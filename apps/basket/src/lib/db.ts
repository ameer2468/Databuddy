import { clickHouse } from '@databuddy/db';
import { logger } from './logger';

export const insertToTable = async (table: string, values: any[], operation: string) => {
	try {
		await clickHouse.insert({
			table,
			values,
			format: 'JSONEachRow',
		});
	} catch (error) {
		logger.error({
			message: `${operation} failed`,
			table,
			count: values.length,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
};
