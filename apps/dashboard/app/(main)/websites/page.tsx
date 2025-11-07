import type { Metadata } from "next";
import { WebsitesContent } from "./_components/websites-content";

export const metadata: Metadata = {
	title: "Websites",
	description:
		"Manage and monitor all your tracked websites. View analytics, performance metrics, and insights for each of your websites in one place.",
	openGraph: {
		title: "Websites | Databuddy Dashboard",
		description: "Manage and monitor all your tracked websites.",
	},
};

export default function WebsitesPage() {
	return <WebsitesContent />;
}
