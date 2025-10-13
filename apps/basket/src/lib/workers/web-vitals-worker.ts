import type { WebVitalsEvent } from '@databuddy/db';
import { redis } from '../queue';
import { createBatchWorker } from './batch-worker';
import { logger } from '../logger';
import { insertToTable } from '../db';

async function processWebVitalsBatch(batch: WebVitalsEvent[]): Promise<void> {
	if (batch.length === 0) return;

	const startTime = Date.now();
	
	logger.info({
		message: 'Processing web vitals batch',
		count: batch.length,
	});
	
	await insertToTable('analytics.web_vitals', batch, 'processWebVitalsBatch');
	
	const duration = Date.now() - startTime;
	logger.info({
		message: 'Web vitals batch inserted to ClickHouse',
		count: batch.length,
		duration,
		throughput: Math.round(batch.length / (duration / 1000)),
	});
}

export const webVitalsWorker = createBatchWorker<WebVitalsEvent>({
	queueName: 'WebVitals',
	connection: redis,
	batchSize: 500, // Increased for better throughput
	flushInterval: 3000, // Reduced for faster processing
	processor: processWebVitalsBatch,
	concurrency: 2, // Increased concurrency
});
