"use client";

import { BookOpen, ChevronLeft, Code2, Play, Send } from "lucide-react";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { CodeEditor } from "@/components/CodeEditor";
import GradientText from "@/components/GradientText";
import { NavbarActions } from "@/components/NavbarActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/routing";
import type { ProblemDetail } from "@/lib/problems";

interface ProblemClientProps {
	problem: ProblemDetail;
	t: {
		allProblems: string;
		solution: string;
		description: string;
	};
}

interface ParsedSolution {
	language: string;
	code: string;
}

export function ProblemClient({ problem, t }: ProblemClientProps) {
	const [activeTab, setActiveTab] = useState("description");
	const [editorCode, setEditorCode] = useState("// Write your code here...");
	const [editorLanguage, setEditorLanguage] = useState("javascript");

	// Simple parser to extract code blocks from the solution markdown
	const parsedSolutions = useMemo(() => {
		const solutions: ParsedSolution[] = [];
		const codeBlockRegex = /```(\w+)\n([\s\S]*?)```/g;
		let match: RegExpExecArray | null;

		// biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop
		while ((match = codeBlockRegex.exec(problem.solution)) !== null) {
			solutions.push({
				language: match[1],
				code: match[2].trim(),
			});
		}

		if (solutions.length === 0) {
			solutions.push({ language: "markdown", code: problem.solution });
		}
		return solutions;
	}, [problem.solution]);

	const [selectedLanguage, setSelectedLanguage] = useState(
		parsedSolutions[0]?.language || "javascript",
	);

	const currentSolution =
		parsedSolutions.find((s) => s.language === selectedLanguage) ||
		parsedSolutions[0];

	const solutionMarkdown = useMemo(() => {
		if (currentSolution.language === "markdown") return currentSolution.code;
		return (
			"```" + currentSolution.language + "\n" + currentSolution.code + "\n```"
		);
	}, [currentSolution]);

	return (
		<div className="h-screen w-full overflow-hidden bg-zinc-50 dark:bg-[#292b2d] text-foreground flex flex-col">
			{/* Header */}
			<div className="h-12 border-b border-zinc-200 dark:border-[#383a3c] flex items-center px-4 bg-white dark:bg-[#242628] shrink-0">
				<Link
					href="/"
					className="flex items-center text-sm text-muted-foreground hover:text-foreground mr-4"
				>
					<ChevronLeft className="w-4 h-4 mr-1" />
					<GradientText
						colors={["#40ffaa", "#4079ff", "#40ffaa"]}
						animationSpeed={3}
					>
						{t.allProblems}
					</GradientText>
				</Link>
				<div className="font-medium mr-2 text-zinc-900 dark:text-zinc-200">
					{problem.id}. {problem.title}
				</div>

				<div className="ml-auto flex items-center gap-4">
					<NavbarActions className="scale-90" />
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex overflow-hidden">
				{/* Left Panel: Description & Solution */}
				<div className="w-1/2 border-r border-zinc-200 dark:border-[#383a3c] flex flex-col bg-white dark:bg-[#292b2d]">
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="flex flex-col h-full"
					>
						<div className="px-4 border-b border-zinc-200 dark:border-[#383a3c] bg-zinc-50 dark:bg-[#242628] flex items-center justify-between shrink-0 h-10">
							<TabsList className="bg-transparent border-none gap-4 h-full p-0">
								<TabsTrigger
									value="description"
									className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-full px-2 text-xs"
								>
									<BookOpen className="w-3.5 h-3.5 mr-1.5" />
									{t.description}
								</TabsTrigger>
								<TabsTrigger
									value="solution"
									className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-full px-2 text-xs"
								>
									<Code2 className="w-3.5 h-3.5 mr-1.5" />
									{t.solution}
								</TabsTrigger>
							</TabsList>

							{activeTab === "solution" && parsedSolutions.length > 1 && (
								<Select
									value={selectedLanguage}
									onValueChange={setSelectedLanguage}
								>
									<SelectTrigger className="h-7 w-30 text-[10px] bg-zinc-100 dark:bg-[#343638] border-[#383a3c]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="dark:bg-[#242628] dark:border-[#383a3c]">
										{parsedSolutions.map((s) => (
											<SelectItem
												key={s.language}
												value={s.language}
												className="text-[10px]"
											>
												{s.language.toUpperCase()}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>

						<div className="flex-1 overflow-hidden">
							<TabsContent value="description" className="h-full m-0">
								<ScrollArea className="h-full p-6">
									<div className="prose prose-sm dark:prose-invert max-w-none">
										<div className="flex items-center gap-2 mb-4">
											<h1 className="text-2xl font-bold m-0 text-zinc-900 dark:text-zinc-100">
												{problem.title}
											</h1>
											<Badge
												className={
													problem.difficulty === "Easy"
														? "bg-green-500 hover:bg-green-600"
														: problem.difficulty === "Medium"
															? "bg-yellow-500 hover:bg-yellow-600"
															: problem.difficulty === "Hard"
																? "bg-red-500 hover:bg-red-600"
																: "bg-gray-500"
												}
											>
												{problem.difficulty}
											</Badge>
										</div>

										<div className="flex gap-2 mb-6 flex-wrap">
											{problem.tags?.map((tag) => (
												<Badge
													key={tag}
													variant="outline"
													className="text-xs border-zinc-200 dark:border-[#383a3c] bg-zinc-50 dark:bg-[#343638] text-zinc-600 dark:text-zinc-300"
												>
													{tag}
												</Badge>
											))}
										</div>

										<ReactMarkdown
											remarkPlugins={[remarkGfm]}
											rehypePlugins={[rehypeRaw, rehypeHighlight]}
											components={{
												pre: ({ node, ...props }) => (
													<pre
														className="rounded-md bg-zinc-100 dark:bg-[#242628] p-4 overflow-x-auto border border-zinc-200 dark:border-[#383a3c] shadow-sm"
														{...props}
													/>
												),
												code: ({ node, className, ...props }) => {
													const match = /language-(\w+)/.exec(className || "");
													return match ? (
														<code className={className} {...props} />
													) : (
														<code
															className="bg-zinc-100 dark:bg-[#343638] px-1 py-0.5 rounded-sm text-zinc-900 dark:text-zinc-200"
															{...props}
														/>
													);
												},
											}}
										>
											{problem.description}
										</ReactMarkdown>
									</div>
								</ScrollArea>
							</TabsContent>

							<TabsContent value="solution" className="h-full m-0">
								<ScrollArea className="h-full p-6">
									<div className="prose prose-sm dark:prose-invert max-w-none">
										<ReactMarkdown
											remarkPlugins={[remarkGfm]}
											rehypePlugins={[rehypeRaw, rehypeHighlight]}
										>
											{solutionMarkdown}
										</ReactMarkdown>
									</div>
								</ScrollArea>
							</TabsContent>
						</div>
					</Tabs>
				</div>

				{/* Right Panel: Code Editor */}
				<div className="flex-1 flex flex-col bg-white dark:bg-[#242628] border-l border-zinc-200 dark:border-[#383a3c]">
					<CodeEditor
						language={editorLanguage}
						onLanguageChange={setEditorLanguage}
						value={editorCode}
						onChange={setEditorCode}
						className="border-none rounded-none"
						actions={
							<>
								<Button
									variant="ghost"
									size="sm"
									className="h-6 text-[10px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
								>
									<Play className="w-3 h-3 mr-1.5" />
									Run
								</Button>
								<Button
									variant="default"
									size="sm"
									className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white"
								>
									<Send className="w-3 h-3 mr-1.5" />
									Submit
								</Button>
							</>
						}
					/>
				</div>
			</div>
		</div>
	);
}
