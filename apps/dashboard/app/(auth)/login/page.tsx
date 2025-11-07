import { SpinnerIcon } from "@phosphor-icons/react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
	title: "Sign In",
	description:
		"Sign in to your Databuddy account to access your analytics dashboard and track your website performance.",
	openGraph: {
		title: "Sign In | Databuddy Dashboard",
		description:
			"Sign in to your Databuddy account to access your analytics dashboard.",
	},
	robots: {
		index: false,
		follow: false,
	},
};

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<div className="flex h-screen items-center justify-center bg-background">
					<div className="relative">
						<div className="absolute inset-0 animate-ping rounded-full bg-primary/20 blur-xl" />
						<SpinnerIcon className="relative h-8 w-8 animate-spin text-primary" />
					</div>
				</div>
			}
		>
			<LoginForm />
		</Suspense>
	);
}
