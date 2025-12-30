import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { getProblems } from "@/lib/problems";

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const { problems } = await getProblems(1, 100, locale);

	return (
		<div className="min-h-screen bg-linear-to-b from-zinc-900 via-black to-zinc-950 font-sans text-zinc-100">
			<main className="container mx-auto px-4 py-16">
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

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{problems.map((problem) => (
							<Link
								key={problem.id}
								href={`/problems/${problem.slug}`}
								className="group block"
							>
								<Card className="h-full border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-800/80 hover:shadow-2xl hover:shadow-purple-500/10">
									<div className="flex items-start justify-between mb-4">
										<div className="flex items-center gap-2">
											<span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white transition-colors">
												{problem.id}
											</span>
										</div>
										<Badge
											variant={
												problem.difficulty === "Easy" ||
												problem.difficulty === "简单"
													? "default"
													: problem.difficulty === "Medium" ||
														  problem.difficulty === "中等"
														? "secondary"
														: "destructive"
											}
											className={`
                        ${problem.difficulty === "Easy" || problem.difficulty === "简单" ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20" : ""}
                        ${problem.difficulty === "Medium" || problem.difficulty === "中等" ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20" : ""}
                        ${problem.difficulty === "Hard" || problem.difficulty === "困难" ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20" : ""}
                        border
                      `}
										>
											{problem.difficulty || "Unknown"}
										</Badge>
									</div>

									<h2 className="mb-3 text-xl font-bold text-zinc-100 group-hover:text-blue-400 transition-colors line-clamp-2">
										{problem.title}
									</h2>

									<div className="flex flex-wrap gap-2">
										{problem.tags && problem.tags.length > 0 ? (
											problem.tags.slice(0, 3).map((tag) => (
												<span
													key={tag}
													className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors"
												>
													#{tag}
												</span>
											))
										) : (
											<span className="text-xs text-zinc-600 italic">
												{locale === "zh" ? "暂无标签" : "No tags"}
											</span>
										)}
									</div>
								</Card>
							</Link>
						))}
					</div>
				</div>
			</main>
		</div>
	);
}
