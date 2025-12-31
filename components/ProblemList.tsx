"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Link } from "@/i18n/routing";
import type { Problem } from "@/lib/problems";
import ElectricBorder from "./ElectricBorder";
import SearchInput from "./SearchInput";

interface ProblemListProps {
	initialProblems: Problem[];
	locale: string;
}

export function ProblemList({ initialProblems, locale }: ProblemListProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
		[],
	);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [hoveredId, setHoveredId] = useState<string | null>(null);

	const [parent] = useAutoAnimate();

	const allTags = useMemo(() => {
		const tags = new Set<string>();
		for (const problem of initialProblems) {
			if (problem.tags) {
				for (const tag of problem.tags) {
					tags.add(tag);
				}
			}
		}
		return Array.from(tags).sort();
	}, [initialProblems]);

	const difficulties =
		locale === "zh" ? ["简单", "中等", "困难"] : ["Easy", "Medium", "Hard"];

	const toggleDifficulty = (difficulty: string) => {
		setSelectedDifficulties((prev) =>
			prev.includes(difficulty)
				? prev.filter((d) => d !== difficulty)
				: [...prev, difficulty],
		);
	};

	const toggleTag = (tag: string) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
	};

	const filteredProblems = useMemo(() => {
		return initialProblems.filter((problem) => {
			const searchLower = searchQuery.toLowerCase();
			const matchesSearch =
				problem.title.toLowerCase().includes(searchLower) ||
				problem.id.toString().includes(searchLower) ||
				problem.tags?.some((tag) => tag.toLowerCase().includes(searchLower));

			const matchesDifficulty =
				selectedDifficulties.length === 0 ||
				(problem.difficulty &&
					selectedDifficulties.includes(problem.difficulty));

			const matchesTags =
				selectedTags.length === 0 ||
				(problem.tags &&
					selectedTags.every((tag) => problem.tags?.includes(tag)));

			return matchesSearch && matchesDifficulty && matchesTags;
		});
	}, [initialProblems, searchQuery, selectedDifficulties, selectedTags]);

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-6">
				<div className="flex justify-center w-full">
					<div className="w-full max-w-2xl">
						<SearchInput
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder={
								locale === "zh"
									? "搜索题目..."
									: "Search problems, ID or tags..."
							}
						/>
					</div>
				</div>

				<div className="flex flex-col md:flex-row gap-8 p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm">
					<div className="space-y-4 min-w-37.5">
						<h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
							{locale === "zh" ? "难度" : "Difficulty"}
						</h3>

						<div className="flex flex-wrap md:flex-col gap-3">
							{difficulties.map((difficulty) => (
								<div key={difficulty} className="flex items-center space-x-2">
									<Checkbox
										id={`diff-${difficulty}`}
										checked={selectedDifficulties.includes(difficulty)}
										onCheckedChange={() => toggleDifficulty(difficulty)}
									/>

									<Label
										htmlFor={`diff-${difficulty}`}
										className="text-sm font-medium leading-none cursor-pointer text-zinc-300"
									>
										{difficulty}
									</Label>
								</div>
							))}
						</div>
					</div>

					<div className="space-y-4 flex-1">
						<h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
							{locale === "zh" ? "标签" : "Tags"}
						</h3>

						<div className="flex flex-col gap-4">
							<Select
								onValueChange={(tag) =>
									!selectedTags.includes(tag) && toggleTag(tag)
								}
							>
								<SelectTrigger className="w-full md:w-[240px] bg-zinc-800/50 border-zinc-700 text-zinc-300">
									<SelectValue
										placeholder={
											locale === "zh" ? "选择标签..." : "Select tags..."
										}
									/>
								</SelectTrigger>
								<SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
									<ScrollArea className="h-[200px]">
										{allTags.map((tag) => (
											<SelectItem key={tag} value={tag}>
												{tag}
											</SelectItem>
										))}
									</ScrollArea>
								</SelectContent>
							</Select>

							{selectedTags.length > 0 && (
								<div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
									{selectedTags.map((tag) => (
										<Badge
											key={tag}
											variant="secondary"
											className="bg-purple-500/20 text-purple-300 border-purple-500/30 pl-2 pr-1 py-0.5 flex items-center gap-1"
										>
											{tag}
											<button
												type="button"
												onClick={() => toggleTag(tag)}
												className="hover:bg-purple-500/30 rounded-full p-0.5 transition-colors"
											>
												<X className="w-3 h-3" />
											</button>
										</Badge>
									))}
									<button
										type="button"
										onClick={() => setSelectedTags([])}
										className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 ml-2 transition-colors"
									>
										{locale === "zh" ? "清除全部" : "Clear all"}
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			<div ref={parent}>
				{filteredProblems.length > 0 ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{filteredProblems.map((problem) => (
							<Link
								key={problem.id}
								href={`/problems/${problem.slug}`}
								className="group block"
								onMouseEnter={() => setHoveredId(problem.id)}
								onMouseLeave={() => setHoveredId(null)}
							>
								<div className="relative h-full transition-all duration-300 hover:-translate-y-1">
									{hoveredId === problem.id && (
										<div className="absolute inset-0 -m-1 pointer-events-none z-0">
											<ElectricBorder
												color={
													problem.difficulty === "Easy" ||
													problem.difficulty === "简单"
														? "#10b981"
														: problem.difficulty === "Medium" ||
																problem.difficulty === "中等"
															? "#f59e0b"
															: "#f43f5e"
												}
												borderRadius={12}
												chaos={0.12}
												className="w-full h-full"
												speed={1}
											/>
										</div>
									)}
									<Card className="relative h-full border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all duration-300 group-hover:border-transparent group-hover:bg-zinc-800/80 group-hover:shadow-2xl group-hover:shadow-purple-500/10 z-10">
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
								</div>
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
		</div>
	);
}
