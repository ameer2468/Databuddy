// import './polyfills/compression'

import { Elysia } from 'elysia';
import { logger } from './lib/logger';
import basketRouter from './routes/basket';
import emailRouter from './routes/email';
import stripeRouter from './routes/stripe';
import './polyfills/compression';
import { eventWorker, errorWorker, webVitalsWorker, customEventWorker, outgoingLinkWorker } from './lib/workers';
import { redis } from './lib/queue';

logger.info({ message: 'Starting basket service' });

const workers = [eventWorker, errorWorker, webVitalsWorker, customEventWorker, outgoingLinkWorker];

workers.forEach(worker => {
	worker.on('ready', () => {
		logger.info({ message: `${worker.name} worker ready` });
	});

	worker.on('error', (err) => {
		logger.error({
			message: 'Worker error',
			queue: worker.name,
			error: err.message,
			stack: err.stack,
			name: err.name,
		});
	});
});

let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
	if (isShuttingDown) {
		process.exit(1);
	}

	isShuttingDown = true;
	logger.info({ message: 'Graceful shutdown initiated', signal });

	const timeout = setTimeout(() => {
		logger.error({ message: 'Shutdown timeout reached, forcing exit' });
		process.exit(1);
	}, 30000);

	try {
		await Promise.all(workers.map(worker => worker.close()));
		await redis.quit();
		clearTimeout(timeout);
		logger.info({ message: 'Graceful shutdown completed' });
		process.exit(0);
	} catch (error) {
		logger.error({
			message: 'Shutdown error',
			error: error instanceof Error ? error.message : String(error),
		});
		process.exit(1);
	}
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (error) => {
	logger.error({
		message: 'Uncaught exception',
		error: error.message,
		stack: error.stack,
	});
	gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
	logger.error({
		message: 'Unhandled rejection',
		reason: String(reason),
	});
});

const app = new Elysia()
	.onError(({ error }) => {
		logger.error({
			message: 'Request error',
			error: error instanceof Error ? error.message : String(error),
			name: error instanceof Error ? error.name : 'Unknown',
		});
	})
	.onBeforeHandle(({ request, set }) => {
		// const { isBot } = await checkBotId();
		// if (isBot) {
		//   return new Response(null, { status: 403 });
		// }
		const origin = request.headers.get('origin');
		if (origin) {
			set.headers ??= {};
			set.headers['Access-Control-Allow-Origin'] = origin;
			set.headers['Access-Control-Allow-Methods'] =
				'POST, GET, OPTIONS, PUT, DELETE';
			set.headers['Access-Control-Allow-Headers'] =
				'Content-Type, Authorization, X-Requested-With, databuddy-client-id, databuddy-sdk-name, databuddy-sdk-version';
			set.headers['Access-Control-Allow-Credentials'] = 'true';
		}
	})
	.options('*', () => new Response(null, { status: 204 }))
	.use(basketRouter)
	.use(stripeRouter)
	.use(emailRouter)
	.get('/health', () => ({ 
		status: 'ok', 
		version: '1.0.0',
		workers: workers.map(w => ({
			name: w.name,
			state: w.isRunning() ? 'running' : 'stopped',
		})),
	}));

export default {
	port: process.env.PORT || 4000,
	fetch: app.fetch,
};
