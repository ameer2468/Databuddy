import {
	appRouter,
	createCallerFactory,
	createTRPCContext,
} from "@databuddy/rpc";
import { headers as getHeaders } from "next/headers";
import "server-only";

/**
 * Server-side tRPC caller for SSR and Server Components
 * This creates a tRPC caller that can be used in Server Components and Server Actions
 */
export async function createServerTRPCCaller() {
	const headers = await getHeaders();
	const ctx = await createTRPCContext({ headers });
	const createCaller = createCallerFactory(appRouter);
	return createCaller(ctx);
}

/**
 * Helper to get the tRPC caller for the current request
 * Use this in Server Components to fetch data server-side
 */
export const getServerTRPC = createServerTRPCCaller;
