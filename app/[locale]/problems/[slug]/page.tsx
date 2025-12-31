import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import getProblem from "@/lib/problems";
import "highlight.js/styles/atom-one-dark.css";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import GradientText from "@/components/GradientText";
import { Badge } from "@/components/ui/badge";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function ProblemPage({
	params,
}: {
	params: Promise<{ slug: string; locale: string }>;
}) {
	const { slug, locale } = await params;
	const decodedSlug = decodeURIComponent(slug);
	const problem = await getProblem(decodedSlug, locale);
	const t = await getTranslations({ locale, namespace: "Navigation" });

	if (!problem) {
		return (
			<div className="container mx-auto py-10 text-center">
				<h1 className="text-2xl font-bold">Problem Not Found</h1>
				<Link
					href="/problems"
					className="text-blue-500 hover:underline mt-4 block"
				>
					{t("allProblems")}
				</Link>
			</div>
		);
	}

	return (
		<div className="h-[calc(100vh-4rem)] w-full overflow-hidden">
			<div className="h-12 border-b flex items-center px-4">
				<Link
					href="/problems"
					className="flex items-center text-sm text-muted-foreground hover:text-foreground mr-4"
				>
					<ChevronLeft className="w-4 h-4 mr-1" />
					<GradientText
						colors={["#40ffaa", "#4079ff", "#40ffaa"]}
						animationSpeed={3}
					>
						{t("allProblems")}
					</GradientText>
				</Link>
				<div className="font-medium mr-2">
					{problem.id}. {problem.title}
				</div>
			</div>

			<ResizablePanelGroup
				direction="horizontal"
				className="h-[calc(100%-3rem)]"
			>
				<ResizablePanel defaultSize={50} minSize={30}>
					<ScrollArea className="h-full w-full p-6">
						<div className="prose prose-sm dark:prose-invert max-w-none">
							<div className="flex items-center gap-2 mb-4">
								<h1 className="text-2xl font-bold m-0">{problem.title}</h1>
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
									<Badge key={tag} variant="outline" className="text-xs">
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
											className="rounded-md bg-muted p-4 overflow-x-auto"
											{...props}
										/>
									),
									code: ({ node, className, ...props }) => {
										const match = /language-(\w+)/.exec(className || "");
										return match ? (
											<code className={className} {...props} />
										) : (
											<code
												className="bg-muted px-1 py-0.5 rounded-sm"
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
				</ResizablePanel>

				<ResizableHandle withHandle />

				<ResizablePanel defaultSize={50} minSize={30}>
					<ScrollArea className="h-full w-full">
						<div className="flex flex-col h-full">
							<div className="bg-muted/50 p-2 border-b text-sm font-medium">
								Solution
							</div>
							<div className="p-6 prose prose-sm dark:prose-invert max-w-none">
								<ReactMarkdown
									remarkPlugins={[remarkGfm]}
									rehypePlugins={[rehypeRaw, rehypeHighlight]}
								>
									{problem.solution || "No solution provided in README."}
								</ReactMarkdown>
							</div>
						</div>
					</ScrollArea>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
}
