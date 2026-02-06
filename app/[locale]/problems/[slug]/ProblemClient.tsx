"use client";

import {
	BookOpen,
	Check,
	ChevronLeft,
	Code2,
	Copy,
	Play,
	Send,
	Trophy,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { CodeEditor } from "@/components/CodeEditor";
import GradientText from "@/components/GradientText";
import { NavbarActions } from "@/components/NavbarActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "@/i18n/routing";
import { JudgmentClient, type JudgmentResponse } from "@/lib/judgment";
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
	const tProblem = useTranslations("Problem");
	const [activeTab, setActiveTab] = useState("description");
	const [editorCode, setEditorCode] = useState("");
	const [editorLanguage, setEditorLanguage] = useState("java");
	const [selectedSolutionIndex, setSelectedSolutionIndex] = useState(0);
	const [isRunning, setIsRunning] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [output, setOutput] = useState<
		{ id: string; type: "stdout" | "stderr" | "system"; content: string }[]
	>([]);
	const [submissionResult, setSubmissionResult] =
		useState<JudgmentResponse | null>(null);

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

	const handleRun = async () => {
		if (isRunning || isSubmitting) return;
		setIsRunning(true);
		setOutput([
			{
				id: crypto.randomUUID(),
				type: "system",
				content: tProblem("executing"),
			},
		]);
		setActiveTab("output");

		const client = new JudgmentClient();
		try {
			await client.execute(
				{
					language: editorLanguage,
					code: editorCode,
					timeout: 10,
				},
				(msg: JudgmentResponse) => {
					if ("Stdout" in msg) {
						const text = new TextDecoder().decode(msg.Stdout);
						setOutput((prev) => [
							...prev,
							{ id: crypto.randomUUID(), type: "stdout", content: text },
						]);
					} else if ("Stderr" in msg) {
						const text = new TextDecoder().decode(msg.Stderr);
						setOutput((prev) => [
							...prev,
							{ id: crypto.randomUUID(), type: "stderr", content: text },
						]);
					} else if ("Done" in msg) {
						const { status_type, status_value, real, max_mem } = msg.Done;
						setOutput((prev) => [
							...prev,
							{
								id: crypto.randomUUID(),
								type: "system",
								content: `\n--- Execution Finished ---\nStatus: ${status_type} (${status_value})\nTime: ${(real / 1e6).toFixed(2)}ms\nMemory: ${(max_mem / 1024).toFixed(2)} MB`,
							},
						]);
					}
				},
			);
		} catch (error) {
			console.error("Execution failed:", error);
			setOutput((prev) => [
				...prev,
				{
					id: crypto.randomUUID(),
					type: "stderr",
					content: `Connection error: ${error instanceof Error ? error.message : String(error)}`,
				},
			]);
		} finally {
			setIsRunning(false);
		}
	};

	const handleSubmit = async () => {
		if (isRunning || isSubmitting) return;
		setIsSubmitting(true);
		setSubmissionResult(null);
		setActiveTab("submission");

		const client = new JudgmentClient();
		try {
			await client.execute(
				{
					language: editorLanguage,
					code: editorCode,
					timeout: 15, // Longer timeout for submission
				},
				(msg: JudgmentResponse) => {
					if ("Done" in msg) {
						setSubmissionResult(msg);
						if (
							msg.Done.status_type === "exited" &&
							msg.Done.status_value === 0
						) {
							toast.success("Submission Accepted!");
						} else {
							toast.error(`Submission Failed: ${msg.Done.status_type}`);
						}
					}
				},
			);
		} catch (error) {
			console.error("Submission failed:", error);
			toast.error("Connection failed. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

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
				<ResizablePanelGroup direction="horizontal" className="h-full w-full">
					{/* Left Panel: Description & Solution */}
					<ResizablePanel defaultSize={50} minSize={20}>
						<div className="h-full flex flex-col bg-white dark:bg-[#292b2c] ">
							<Tabs
								value={activeTab}
								onValueChange={setActiveTab}
								className="flex flex-col h-full "
							>
								<div className="px-4 border-b border-zinc-200 dark:border-[#383a3c] bg-[#f8f9fa] dark:bg-[#292b2c]  flex items-center justify-between shrink-0 h-10">
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
										{output.length > 0 && (
											<TabsTrigger
												value="output"
												className="cursor-pointer  data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-full px-2 text-xs"
											>
												<Play className="w-3.5 h-3.5 mr-1.5" />
												{tProblem("output")}
											</TabsTrigger>
										)}
										{(isSubmitting || submissionResult) && (
											<TabsTrigger
												value="submission"
												className="cursor-pointer  data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-full px-2 text-xs"
											>
												<Trophy className="w-3.5 h-3.5 mr-1.5" />
												{tProblem("submission")}
											</TabsTrigger>
										)}
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

												<div
													style={{
														scrollbarWidth: "none",
													}}
													className="flex gap-2 mb-6 flex-wrap"
												>
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
															const match = /language-(\w+)/.exec(
																className || "",
															);
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
																setSelectedSolutionIndex(
																	Number.parseInt(val, 10),
																)
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
															const _match = /language-(\w+)/.exec(
																className || "",
															);
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

									<TabsContent value="output" className="h-full m-0">
										<ScrollArea className="h-full bg-transparent p-4 font-mono text-sm">
											{output.map((line) => (
												<div
													key={line.id}
													className={cn(
														"whitespace-pre-wrap",
														line.type === "stdout" && "text-zinc-100",
														line.type === "stderr" && "text-red-400",
														line.type === "system" && "text-blue-400 italic",
													)}
												>
													{line.content}
												</div>
											))}
											{output.length === 0 && (
												<div className="text-zinc-500 italic">
													{tProblem("noOutput")}
												</div>
											)}
										</ScrollArea>
									</TabsContent>

									<TabsContent value="submission" className="h-full m-0">
										<ScrollArea className="h-full bg-zinc-50 dark:bg-transparent  p-6">
											{isSubmitting ? (
												<div className="flex flex-col items-center justify-center h-full py-20 space-y-4">
													<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
													<p className="text-zinc-500 animate-pulse">
														{tProblem("submitting")}
													</p>
												</div>
											) : submissionResult && "Done" in submissionResult ? (
												<div className="space-y-6">
													<div
														className={cn(
															"p-6 rounded-xl border flex items-center justify-between",
															submissionResult.Done.status_type === "exited" &&
																submissionResult.Done.status_value === 0
																? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
																: "bg-red-500/10 border-red-500/20 text-red-500",
														)}
													>
														<div>
															<h2 className="text-2xl font-bold">
																{submissionResult.Done.status_type ===
																	"exited" &&
																submissionResult.Done.status_value === 0
																	? tProblem("accepted")
																	: tProblem("wrongAnswer")}
															</h2>
															<p className="text-sm opacity-80">
																{submissionResult.Done.status_type} (
																{submissionResult.Done.status_value})
															</p>
														</div>
														<Trophy className="w-10 h-10" />
													</div>

													<div className="grid grid-cols-2 gap-4">
														<div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
															<p className="text-xs text-zinc-500 uppercase">
																{tProblem("runtime")}
															</p>
															<p className="text-lg font-mono font-bold">
																{(submissionResult.Done.real / 1000000).toFixed(
																	2,
																)}{" "}
																ms
															</p>
														</div>
														<div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
															<p className="text-xs text-zinc-500 uppercase">
																{tProblem("memory")}
															</p>
															<p className="text-lg font-mono font-bold">
																{(submissionResult.Done.max_mem / 1024).toFixed(
																	2,
																)}{" "}
																MB
															</p>
														</div>
													</div>

													{submissionResult.Done.status_value !== 0 && (
														<div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-900/20">
															<p className="text-xs text-red-500 uppercase mb-2 font-bold">
																{tProblem("errorDetails")}
															</p>
															<pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap overflow-x-auto">
																{submissionResult.Done.timed_out
																	? "Time Limit Exceeded"
																	: "Check standard output/error for more details."}
															</pre>
														</div>
													)}
												</div>
											) : (
												<div className="text-zinc-500 text-center py-20 italic">
													{tProblem("submitPlaceholder")}
												</div>
											)}
										</ScrollArea>
									</TabsContent>
								</div>
							</Tabs>
						</div>
					</ResizablePanel>

					<ResizableHandle
						withHandle
						className="bg-zinc-200 dark:bg-[#383a3c]"
					/>

					{/* Right Panel: Code Editor */}
					<ResizablePanel defaultSize={50} minSize={20}>
						<div className="h-full flex flex-col bg-white dark:bg-[#1e1f20]">
							<CodeEditor
								language={editorLanguage}
								onLanguageChange={setEditorLanguage}
								value={editorCode}
								onChange={setEditorCode}
								className="border-none rounded-none"
								callbackFns={{
									handleRun,
								}}
								actions={
									<>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-7  cursor-pointer w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
													onClick={handleRun}
													disabled={isRunning}
												>
													<Play
														className={cn(
															"h-3.5 w-3.5",
															isRunning && "animate-pulse",
														)}
													/>
												</Button>
											</TooltipTrigger>
											<TooltipContent className="bg-zinc-800 text-zinc-200 border-zinc-700">
												<p className="text-xs">Run Code (Alt+E)</p>
											</TooltipContent>
										</Tooltip>
										<Button
											variant="default"
											size="sm"
											className="h-7 cursor-pointer  text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
											onClick={handleSubmit}
											disabled={isRunning || isSubmitting}
										>
											<Send
												className={cn(
													"w-3 h-3 mr-1.5",
													isSubmitting && "animate-spin",
												)}
											/>
											{isSubmitting
												? tProblem("submitting_btn")
												: tProblem("submit")}
										</Button>{" "}
									</>
								}
							/>
						</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</div>
	);
}
