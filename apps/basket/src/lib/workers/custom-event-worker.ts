import type { CustomEvent } from '@databuddy/db';
import { redis } from '../queue';
import { createBatchWorker } from './batch-worker';
import { logger } from '../logger';
import { insertToTable } from '../db';

async function processCustomEventBatch(batch: CustomEvent[]): Promise<void> {
	if (batch.length === 0) return;

	const startTime = Date.now();
	
	logger.info({
		message: 'Processing custom event batch',
		count: batch.length,
	});
	
	await insertToTable('analytics.custom_events', batch, 'processCustomEventBatch');
	
	const duration = Date.now() - startTime;
	logger.info({
		message: 'Custom event batch inserted to ClickHouse',
		count: batch.length,
		duration,
		throughput: Math.round(batch.length / (duration / 1000)),
	});
}

export const customEventWorker = createBatchWorker<CustomEvent>({
	queueName: 'CustomEvents',
	connection: redis,
	batchSize: 500, // Increased for better throughput
	flushInterval: 3000, // Reduced for faster processing
	processor: processCustomEventBatch,
	concurrency: 2, // Increased concurrency
});
