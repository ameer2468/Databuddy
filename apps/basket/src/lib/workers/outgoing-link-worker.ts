import type { CustomOutgoingLink } from '@databuddy/db';
import { redis } from '../queue';
import { createBatchWorker } from './batch-worker';
import { logger } from '../logger';
import { insertToTable } from '../db';

async function processOutgoingLinkBatch(batch: CustomOutgoingLink[]): Promise<void> {
	if (batch.length === 0) return;

	const startTime = Date.now();
	
	logger.info({
		message: 'Processing outgoing link batch',
		count: batch.length,
	});
	
	await insertToTable('analytics.outgoing_links', batch, 'processOutgoingLinkBatch');
	
	const duration = Date.now() - startTime;
	logger.info({
		message: 'Outgoing link batch inserted to ClickHouse',
		count: batch.length,
		duration,
		throughput: Math.round(batch.length / (duration / 1000)),
	});
}

export const outgoingLinkWorker = createBatchWorker<CustomOutgoingLink>({
	queueName: 'OutgoingLinks',
	connection: redis,
	batchSize: 500, // Increased for better throughput
	flushInterval: 3000, // Reduced for faster processing
	processor: processOutgoingLinkBatch,
	concurrency: 2, // Increased concurrency
});
