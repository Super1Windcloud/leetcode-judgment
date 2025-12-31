import getProblem from "@/lib/problems";
import "highlight.js/styles/atom-one-dark.css";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ProblemClient } from "./ProblemClient";

export default async function ProblemPage({
	params,
}: {
	params: Promise<{ slug: string; locale: string }>;
}) {
	const { slug, locale } = await params;
	const decodedSlug = decodeURIComponent(slug);
	const problem = await getProblem(decodedSlug, locale);
	const tNav = await getTranslations({ locale, namespace: "Navigation" });

	if (!problem) {
		return (
			<div className="container mx-auto py-10 text-center">
				<h1 className="text-2xl font-bold">Problem Not Found</h1>
				<Link
					href="/problems"
					className="text-blue-500 hover:underline mt-4 block"
				>
					{tNav("allProblems")}
				</Link>
			</div>
		);
	}

	const translations = {
		allProblems: tNav("allProblems"),
		solution: tNav("solution"),
		description: tNav("description"),
	};

	return <ProblemClient problem={problem} t={translations} />;
}
