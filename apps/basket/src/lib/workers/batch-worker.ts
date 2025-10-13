import { Worker, type Job } from 'bullmq';
import type { Redis } from 'ioredis';
import { logger } from '../logger';

interface BatchWorkerConfig<T> {
	queueName: string;
	connection: Redis;
	batchSize: number;
	flushInterval: number;
	processor: (batch: T[]) => Promise<void>;
	concurrency?: number;
}

export function createBatchWorker<T>({
	queueName,
	connection,
	batchSize,
	flushInterval,
	processor,
	concurrency = 1,
}: BatchWorkerConfig<T>) {
	const buffer: T[] = [];
	let flushTimer: NodeJS.Timeout | null = null;
	let isShuttingDown = false;

	const flush = async () => {
		if (buffer.length === 0) return;

		const batch = buffer.splice(0, buffer.length);
		const startTime = Date.now();
		
		logger.info({
			message: 'Batch flush started',
			queue: queueName,
			count: batch.length,
		});

		try {
			await processor(batch);
			const duration = Date.now() - startTime;
			
			logger.info({
				message: 'Batch flush completed',
				queue: queueName,
				count: batch.length,
				duration,
				throughput: Math.round(batch.length / (duration / 1000)),
			});
		} catch (error) {
			const duration = Date.now() - startTime;
			logger.error({
				message: 'Batch flush failed',
				queue: queueName,
				count: batch.length,
				duration,
				error: error instanceof Error ? error.message : String(error),
			});
			throw error; // Ensure error propagates to BullMQ
		}
	};

	const scheduleFlush = () => {
		if (flushTimer) {
			clearTimeout(flushTimer);
		}
		flushTimer = setTimeout(() => {
			flush();
		}, flushInterval);
	};

	const worker = new Worker<T>(
		queueName,
		async (job: Job<T>) => {
			if (isShuttingDown) {
				logger.warn({
					message: 'Worker rejecting job during shutdown',
					queue: queueName,
					jobId: job.id,
				});
				throw new Error('Worker is shutting down');
			}

			try {
				buffer.push(job.data);

				if (buffer.length >= batchSize) {
					if (flushTimer) {
						clearTimeout(flushTimer);
						flushTimer = null;
					}
					await flush();
				} else {
					scheduleFlush();
				}
			} catch (error) {
				logger.error({
					message: 'Job processing failed',
					queue: queueName,
					jobId: job.id,
					error: error instanceof Error ? error.message : String(error),
				});
				throw error; // Re-throw to trigger BullMQ retry
			}
		},
		{
			connection: connection as any,
			concurrency,
			maxStalledCount: 1,
			stalledInterval: 30000,
		}
	);

	worker.on('completed', (job) => {
		if (process.env.NODE_ENV === 'development') {
			logger.debug({
				message: 'Job completed',
				queue: queueName,
				jobId: job.id,
			});
		}
	});

	worker.on('failed', (job, err) => {
		logger.error({
			message: 'Job failed',
			queue: queueName,
			jobId: job?.id,
			error: err.message,
			attemptsMade: job?.attemptsMade,
			failedReason: job?.failedReason,
		});
	});

	worker.on('stalled', (jobId) => {
		logger.warn({
			message: 'Job stalled',
			queue: queueName,
			jobId,
		});
	});

	worker.on('progress', (job, progress) => {
		// Track progress for monitoring
		if (process.env.NODE_ENV === 'development') {
			logger.debug({
				message: 'Job progress',
				queue: queueName,
				jobId: job.id,
				progress,
			});
		}
	});

	const originalClose = worker.close.bind(worker);
	worker.close = async () => {
		isShuttingDown = true;
		
		if (flushTimer) {
			clearTimeout(flushTimer);
			flushTimer = null;
		}

		if (buffer.length > 0) {
			logger.info({
				message: 'Flushing final batch during shutdown',
				queue: queueName,
				count: buffer.length,
			});
			try {
				await flush();
			} catch (error) {
				logger.error({
					message: 'Final batch flush failed during shutdown',
					queue: queueName,
					count: buffer.length,
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}

		await originalClose();
		logger.info({ message: 'Worker closed', queue: queueName });
	};

	return worker;
}

