import type { Metadata } from "next";
import { getServerTRPC } from "@/lib/trpc-server";
import { WebsiteDetailsContent } from "./_components/website-details-content";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;

	try {
		const trpc = await getServerTRPC();
		const website = await trpc.websites.getById({ id });

		if (!website) {
			return {
				title: "Website Not Found",
				description: "The requested website could not be found.",
			};
		}

		return {
			title: website.name || website.domain,
			description: `Analytics dashboard for ${website.domain}. View visitor statistics, page views, and performance metrics.`,
			openGraph: {
				title: `${website.name || website.domain} | Databuddy Dashboard`,
				description: `Analytics dashboard for ${website.domain}`,
			},
		};
	} catch (error) {
		return {
			title: "Website",
			description: "View analytics for your website.",
		};
	}
}

export async function generateStaticParams() {
	try {
		const trpc = await getServerTRPC();
		// Get all websites for the current user/organization
		// Note: This will only work if there's a valid session
		// For now, we return empty array to enable on-demand ISR
		return [];
	} catch (error) {
		// If there's no session or error, return empty array
		return [];
	}
}

export const dynamic = "force-dynamic";
export const revalidate = 60; // Revalidate every 60 seconds

export default function Page() {
	return <WebsiteDetailsContent />;
}
