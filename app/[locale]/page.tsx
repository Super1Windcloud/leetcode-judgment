import { ProblemList } from "@/components/ProblemList";
import Squares from "@/components/Squares";
import { getProblems } from "@/lib/problems";

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const { problems } = await getProblems(1, 100, locale);

	return (
		<div className="relative min-h-screen bg-zinc-950 font-sans text-zinc-100 overflow-hidden">
			{/* Animated Background */}
			<div className="fixed inset-0 -z-30">
				<Squares
					speed={0.3}
					squareSize={40}
					direction="diagonal"
					borderColor="rgba(255, 255, 255, 0.05)"
					hoverFillColor="rgba(59, 130, 246, 0.1)"
				/>
			</div>

			<main className="container relative mx-auto px-4 py-16 z-10">
				<div className="mx-auto max-w-5xl">
					<div className="mb-16 text-center">
						<h1 className="mb-4 bg-linear-to-r from-blue-400 to-purple-600 bg-clip-text text-5xl font-extrabold text-transparent">
							{locale === "zh" ? "LeetCode 题库" : "LeetCode Problems"}
						</h1>
						<p className="mx-auto max-w-2xl text-lg text-zinc-400">
							{locale === "zh"
								? "探索并精选编程挑战，掌握算法精髓。"
								: "Explore and master algorithms with our curated collection of programming challenges."}
						</p>
					</div>

					<ProblemList initialProblems={problems} locale={locale} />
				</div>
			</main>
		</div>
	);
}
