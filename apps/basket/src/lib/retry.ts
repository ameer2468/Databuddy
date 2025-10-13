import { Effect, Schedule } from 'effect';
import { logger } from './logger';

interface RetryOptions {
	maxRetries?: number;
	baseDelay?: number;
	operation?: string;
}

export function withRetry<T>(
	operation: () => Promise<T>,
	options: RetryOptions = {}
): Promise<T> {
	const {
		maxRetries = 3,
		baseDelay = 1000,
		operation: operationName = 'operation'
	} = options;

	const retrySchedule = Schedule.exponential(baseDelay).pipe(
		Schedule.compose(Schedule.recurs(maxRetries - 1))
	);

	return Effect.runPromise(
		Effect.tryPromise({
			try: operation,
			catch: (error) => error instanceof Error ? error : new Error(String(error))
		}).pipe(
			Effect.retry(retrySchedule),
			Effect.tapError((error) => 
				Effect.sync(() => logger.error({
					message: `${operationName} failed after all retries`,
					attempts: maxRetries,
					error: error.message,
				}))
			)
		)
	);
}
