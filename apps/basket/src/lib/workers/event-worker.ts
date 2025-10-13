import type { AnalyticsEvent } from '@databuddy/db';
import { redis } from '../queue';
import { createBatchWorker } from './batch-worker';
import { logger } from '../logger';
import { insertToTable } from '../db';

async function processEventBatch(batch: AnalyticsEvent[]): Promise<void> {
	if (batch.length === 0) return;

	const startTime = Date.now();
	
	logger.info({
		message: 'Processing event batch',
		count: batch.length,
	});
	
	await insertToTable('analytics.events', batch, 'processEventBatch');
	
	const duration = Date.now() - startTime;
	logger.info({
		message: 'Event batch inserted to ClickHouse',
		count: batch.length,
		duration,
		throughput: Math.round(batch.length / (duration / 1000)),
	});
}

export const eventWorker = createBatchWorker<AnalyticsEvent>({
	queueName: 'Events',
	connection: redis,
	batchSize: 2000, // Increased for better throughput
	flushInterval: 5000, // Reduced for faster processing
	processor: processEventBatch,
	concurrency: 2, // Increased concurrency
});

