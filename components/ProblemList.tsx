"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import SearchInput from "./SearchInput";

interface Problem {
	id: string | number;
	slug: string;
	title: string;
	difficulty: string;
	tags?: string[];
}

interface ProblemListProps {
	initialProblems: Problem[];
	locale: string;
}

export function ProblemList({ initialProblems, locale }: ProblemListProps) {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredProblems = useMemo(() => {
		return initialProblems.filter((problem) => {
			const searchLower = searchQuery.toLowerCase();
			return (
				problem.title.toLowerCase().includes(searchLower) ||
				problem.id.toString().includes(searchLower) ||
				problem.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
			);
		});
	}, [initialProblems, searchQuery]);

	return (
		<div>
			<div className="mb-12 flex justify-center w-full">
				<div className="w-full max-w-2xl">
					<SearchInput
						value={searchQuery}
						onChange={setSearchQuery}
						placeholder={
							locale === "zh"
								? "搜索题目、ID 或标签..."
								: "Search problems, ID or tags..."
						}
					/>
				</div>
			</div>

			{filteredProblems.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredProblems.map((problem) => (
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
			) : (
				<div className="py-20 text-center">
					<p className="text-xl text-zinc-500">
						{locale === "zh"
							? "未找到符合条件的题目"
							: "No problems found matching your criteria"}
					</p>
				</div>
			)}
		</div>
	);
}
