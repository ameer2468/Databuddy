import type { ErrorEvent } from '@databuddy/db';
import { redis } from '../queue';
import { createBatchWorker } from './batch-worker';
import { logger } from '../logger';
import { insertToTable } from '../db';

async function processErrorBatch(batch: ErrorEvent[]): Promise<void> {
	if (batch.length === 0) return;

	const startTime = Date.now();
	
	logger.info({
		message: 'Processing error batch',
		count: batch.length,
	});
	
	await insertToTable('analytics.errors', batch, 'processErrorBatch');
	
	const duration = Date.now() - startTime;
	logger.info({
		message: 'Error batch inserted to ClickHouse',
		count: batch.length,
		duration,
		throughput: Math.round(batch.length / (duration / 1000)),
	});
}

export const errorWorker = createBatchWorker<ErrorEvent>({
	queueName: 'Errors',
	connection: redis,
	batchSize: 500, // Increased for better throughput
	flushInterval: 3000, // Reduced for faster processing
	processor: processErrorBatch,
	concurrency: 2, // Increased concurrency
});
