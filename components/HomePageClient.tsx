"use client";

import { useRef } from "react";
import ASCIIText from "@/components/ASCIIText";
import { ProblemList } from "@/components/ProblemList";
import type { Problem } from "@/lib/problems";

interface HomePageClientProps {
	problems: Problem[];
	locale: string;
}

export default function HomePageClient({
	problems,
	locale,
}: HomePageClientProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	return (
		<main
			className="container relative mx-auto px-4 py-16 z-10"
			ref={containerRef}
		>
			<div className="mx-auto max-w-5xl">
				<div className="relative h-32 scale-150  w-full flex items-center justify-center">
					<ASCIIText
						text={locale === "zh" ? "LeetCode 题库" : "LeetCode Problems"}
						enableWaves={true}
						asciiFontSize={3}
					/>
				</div>

				<ProblemList initialProblems={problems} locale={locale} />
			</div>
		</main>
	);
}
