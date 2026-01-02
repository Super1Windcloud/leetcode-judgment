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

	// Parse solution on the server side
	const solutions: { label: string; language: string; code: string }[] = [];
	const regex =
		/(?:####\s+([^\r\n]+)[\r\n\s]*)?```(\w+)[^\r\n]*[\r\n]+([\s\S]*?)[\r\n]+```/g;

	let match: RegExpExecArray | null;
	let firstMatchIndex = -1;

	// biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop
	while ((match = regex.exec(problem.solution)) !== null) {
		if (firstMatchIndex === -1) {
			firstMatchIndex = match.index;
		}
		const headerName = match[1]?.trim();
		const langIdentifier = match[2];
		const code = match[3].trim();

		solutions.push({
			label: headerName || langIdentifier.toUpperCase(),
			language: langIdentifier,
			code: code,
		});
	}

	const preamble =
		firstMatchIndex !== -1
			? problem.solution.slice(0, firstMatchIndex).trim()
			: "";

	const parsedSolution =
		solutions.length === 0
			? {
					preamble: "",
					solutions: [
						{
							label: "Markdown",
							language: "markdown",
							code: problem.solution,
						},
					],
				}
			: { preamble, solutions };

	return (
		<ProblemClient
			problem={problem}
			t={translations}
			parsedSolution={parsedSolution}
		/>
	);
}
