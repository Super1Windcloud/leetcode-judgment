"use client";

import {
	BookOpen,
	Check,
	ChevronLeft,
	Code2,
	Copy,
	Play,
	Send,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";

interface ProblemClientProps {
	problem: ProblemDetail;

	t: {
		allProblems: string;

		solution: string;

		description: string;
	};

	parsedSolution: ParsedSolution;
}

interface ParsedSolution {
	preamble: string;

	solutions: {
		label: string;

		language: string;

		code: string;
	}[];
}

// 递归提取 React 节点中的纯文本

function extractText(node: React.ReactNode): string {
	if (!node) return "";

	if (typeof node === "string") return node;

	if (typeof node === "number") return String(node);

	if (Array.isArray(node)) return node.map(extractText).join("");

	// @ts-expect-error

	if (node.props?.children) return extractText(node.props.children);

	return "";
}

function CopyButton({ content }: { content: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(content);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy!", err);
		}
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			className="h-7 w-7 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50"
			onClick={handleCopy}
		>
			{copied ? (
				<Check className="h-3.5 w-3.5 text-emerald-500" />
			) : (
				<Copy className="h-3.5 w-3.5" />
			)}
		</Button>
	);
}

export function ProblemClient({
	problem,
	t,
	parsedSolution,
}: ProblemClientProps) {
	const [activeTab, setActiveTab] = useState("description");

	const [editorCode, setEditorCode] = useState("");

	const [editorLanguage, setEditorLanguage] = useState("java");

	const [selectedSolutionIndex, setSelectedSolutionIndex] = useState(0);

	// Reset selection when problem changes

	useEffect(() => {
		setSelectedSolutionIndex(0);
	}, []);

	const currentSolution =
		parsedSolution.solutions[selectedSolutionIndex] ||
		parsedSolution.solutions[0];

	const solutionMarkdown = useMemo(() => {
		if (!currentSolution) return "";

		if (currentSolution.language === "markdown") return currentSolution.code;

		return `\`\`\`${currentSolution.language}\n${currentSolution.code}\n\`\`\``;
	}, [currentSolution]);

	return (
		<div className="h-screen w-full overflow-hidden bg-[#f5f5f5] dark:bg-[#292b2c] text-foreground flex flex-col">
			{" "}
			{/* Header */}
			<div className="h-12 border-b border-zinc-200 dark:border-[#383a3c] flex items-center px-4  shrink-0">
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
				<div className="w-1/2 border-r   border-zinc-200 dark:border-[#383a3c] flex flex-col bg-white dark:bg-[#292b2c]">
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="flex flex-col h-full "
					>
						<div className="px-4 border-b border-zinc-200 dark:border-[#383a3c] bg-[#f8f9fa] dark:bg-transparent  flex items-center justify-between shrink-0 h-10">
							<TabsList className="bg-transparent cursor-pointer   border-none gap-0 h-full p-0">
								<TabsTrigger
									value="description"
									className="cursor-pointer data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-full px-2 text-xs"
								>
									<BookOpen className="w-3.5 h-3.5 mr-1.5" />
									{t.description}
								</TabsTrigger>
								<TabsTrigger
									value="solution"
									className="cursor-pointer  data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-full px-2 text-xs"
								>
									<Code2 className="w-3.5 h-3.5 mr-1.5" />
									{t.solution}
								</TabsTrigger>
							</TabsList>
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
												style={{
													marginBottom: 15,
												}}
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
													className="text-xs border-zinc-200 dark:border-[#383a3c] bg-zinc-50 dark:bg-[#383a3c] text-zinc-600 dark:text-zinc-300"
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
														className="rounded-md bg-zinc-100 dark:bg-[#292a30] p-4 overflow-x-auto border border-zinc-200 dark:border-[#383a3c] shadow-sm text-sm! font-mono"
														{...props}
													/>
												),
												code: ({ node, className, ...props }) => {
													const match = /language-(\w+)/.exec(className || "");
													return (
														<code
															className={cn(
																className,
																"text-sm! font-mono",
																!match &&
																	"bg-zinc-100 dark:bg-[#383a3c] px-1 py-0.5 rounded-sm text-zinc-900 dark:text-zinc-200",
															)}
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

							<TabsContent
								value="solution"
								className="h-full m-0 flex flex-col"
							>
								<ScrollArea className="flex-1 min-h-0 p-6">
									<div className="prose prose-sm dark:prose-invert max-w-none">
										{parsedSolution.preamble && (
											<ReactMarkdown
												remarkPlugins={[remarkGfm]}
												rehypePlugins={[rehypeRaw, rehypeHighlight]}
											>
												{parsedSolution.preamble}
											</ReactMarkdown>
										)}

										{parsedSolution.solutions.length > 1 && (
											<div
												style={{
													borderWidth: 0,
												}}
												className="border border-zinc-200
                                                 dark:border-[#383a3c]  bg-transparent  rounded-md flex items-center
                                                 justify-between shrink-0"
											>
												<Select
													value={selectedSolutionIndex.toString()}
													onValueChange={(val) =>
														setSelectedSolutionIndex(Number.parseInt(val, 10))
													}
												>
													<SelectTrigger className="h-8 w-35 text-xs bg-zinc-100 dark:bg-[#383a3c] border-[#383a3c] text-zinc-700 dark:text-zinc-300">
														<SelectValue />
													</SelectTrigger>
													<SelectContent className="dark:bg-[#292a30]   dark:border-[#383a3c]">
														{parsedSolution.solutions.map((s, index) => (
															<SelectItem
																key={`${s.label}-${index}`}
																value={index.toString()}
																className="text-xs"
															>
																{s.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										)}

										<ReactMarkdown
											remarkPlugins={[remarkGfm]}
											rehypePlugins={[rehypeRaw, rehypeHighlight]}
											components={{
												pre: ({ children, ...props }) => {
													// 递归提取代码文本内容

													const content = extractText(children);

													return (
														<div className="relative group">
															<pre
																className="rounded-md m-0 text-sm! p-0 font-mono bg-transparent overflow-x-auto border border-zinc-200 dark:border-[#383a3c] shadow-sm"
																{...props}
															>
																{children}
															</pre>

															<div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
																<CopyButton content={content} />
															</div>
														</div>
													);
												},

												code: ({ node, className, ...props }) => {
													const _match = /language-(\w+)/.exec(className || "");
													return (
														<code
															className={cn(
																className,
																"text-sm! font-mono bg-transparent p-0 m-0 rounded-sm text-zinc-900 dark:text-zinc-200",
															)}
															{...props}
														/>
													);
												},
											}}
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
				<div className="w-1/2 flex-none flex flex-col bg-white dark:bg-[#1e1f20] border-l border-zinc-200 dark:border-[#383a3c]">
					<CodeEditor
						language={editorLanguage}
						onLanguageChange={setEditorLanguage}
						value={editorCode}
						onChange={setEditorCode}
						className="border-none rounded-none "
						actions={
							<>
								<Button
									variant="ghost"
									size="sm"
									className="h-6 text-[10px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
								>
									<Play className="w-3 h-3 mr-1.5" />
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
