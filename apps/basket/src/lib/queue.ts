
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { logger } from './logger';

if (!process.env.QUEUE_URL) {
	throw new Error('QUEUE_URL is not set');
}

export const redis = new Redis(process.env.QUEUE_URL, {
	maxRetriesPerRequest: null,
	lazyConnect: true,
	keepAlive: 30000,
	connectTimeout: 10000,
	commandTimeout: 30000, // Increased from 5s to 30s
	enableReadyCheck: false,
});

redis.on('connect', () => {
	logger.info({ message: 'Redis connected' });
});

redis.on('error', (error) => {
	logger.error({
		message: 'Redis connection error',
		error: error.message,
		stack: error.stack,
		name: error.name,
	});
});

redis.on('close', () => {
	logger.info({ message: 'Redis connection closed' });
});

// Optimized queue configurations for better performance
const queueOptions = {
	connection: redis as any,
	defaultJobOptions: {
		removeOnComplete: 50, // Keep fewer completed jobs
		removeOnFail: 20, // Keep fewer failed jobs
		attempts: 3,
		backoff: {
			type: 'exponential',
			delay: 1000,
		},
	},
};

export const eventQueue = new Queue('Events', queueOptions);
export const webVitalsQueue = new Queue('WebVitals', queueOptions);
export const errorQueue = new Queue('Errors', queueOptions);
export const customEventQueue = new Queue('CustomEvents', queueOptions);
export const outgoingLinkQueue = new Queue('OutgoingLinks', queueOptions);

[eventQueue, webVitalsQueue, errorQueue, customEventQueue, outgoingLinkQueue].forEach(queue => {
	queue.on('error', (error) => {
		logger.error({
			message: 'Queue error',
			queueName: queue.name,
			error: error.message,
		});
	});
});
