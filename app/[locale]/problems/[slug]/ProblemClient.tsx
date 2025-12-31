"use client";

import {BookOpen, ChevronLeft, Code2, Play, Send} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import {CodeEditor} from "@/components/CodeEditor";
import GradientText from "@/components/GradientText";
import {NavbarActions} from "@/components/NavbarActions";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Link} from "@/i18n/routing";
import type {ProblemDetail} from "@/lib/problems";

interface ProblemClientProps {
    problem: ProblemDetail;
    t: {
        allProblems: string;
        solution: string;
        description: string;
    };
}

interface ParsedSolution {
    preamble: string;
    solutions: {
        label: string;
        language: string;
        code: string;
    }[];
}

export function ProblemClient({problem, t}: ProblemClientProps) {
    const [activeTab, setActiveTab] = useState("description");
    const [editorCode, setEditorCode] = useState("");
    const [editorLanguage, setEditorLanguage] = useState("java");

    // Improved parser to extract preamble and code blocks from the solution markdown
    const parsedData = useMemo((): ParsedSolution => {
        const solutions: ParsedSolution["solutions"] = [];
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

        if (solutions.length === 0) {
            return {
                preamble: "",
                solutions: [
                    {
                        label: "Markdown",
                        language: "markdown",
                        code: problem.solution,
                    },
                ],
            };
        }

        return {preamble, solutions};
    }, [problem.solution]);

    const [selectedSolutionIndex, setSelectedSolutionIndex] = useState(0);

    // Reset selection when problem changes
    // biome-ignore lint/correctness/useExhaustiveDependencies: reset index on new solution
    useEffect(() => {
        setSelectedSolutionIndex(0);
    }, [problem.solution]);

    const currentSolution =
        parsedData.solutions[selectedSolutionIndex] || parsedData.solutions[0];

    const solutionMarkdown = useMemo(() => {
        if (!currentSolution) return "";
        if (currentSolution.language === "markdown") return currentSolution.code;
        return `\`\`\`${currentSolution.language}\n${currentSolution.code}\n\`\`\``;
    }, [currentSolution]);

    return (
        <div className="h-screen w-full overflow-hidden bg-[#f5f5f5] dark:bg-[#292b2c] text-foreground flex flex-col">
            {" "}
            {/* Header */}
            <div
                className="h-12 border-b border-zinc-200 dark:border-[#383a3c] flex items-center px-4  shrink-0">
                <Link
                    href="/"
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground mr-4"
                >
                    <ChevronLeft className="w-4 h-4 mr-1"/>
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
                    <NavbarActions className="scale-90"/>
                </div>
            </div>
            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Description & Solution */}
                <div
                    className="w-1/2 border-r   border-zinc-200 dark:border-[#383a3c] flex flex-col bg-white dark:bg-[#292b2c]">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="flex flex-col h-full "
                    >
                        <div
                            className="px-4 border-b border-zinc-200 dark:border-[#383a3c] bg-[#f8f9fa] dark:bg-transparent  flex items-center justify-between shrink-0 h-10">
                            <TabsList className="bg-transparent cursor-pointer   border-none gap-0 h-full p-0">
                                <TabsTrigger
                                    value="description"
                                    className="cursor-pointer data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-full px-2 text-xs"
                                >
                                    <BookOpen className="w-3.5 h-3.5 mr-1.5"/>
                                    {t.description}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="solution"
                                    className="cursor-pointer  data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-full px-2 text-xs"
                                >
                                    <Code2 className="w-3.5 h-3.5 mr-1.5"/>
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
                                                pre: ({node, ...props}) => (
                                                    <pre
                                                        className="rounded-md bg-zinc-100 dark:bg-[#292a30]   p-4 overflow-x-auto border border-zinc-200 dark:border-[#383a3c] shadow-sm"
                                                        {...props}
                                                    />
                                                ),
                                                code: ({node, className, ...props}) => {
                                                    const match = /language-(\w+)/.exec(className || "");
                                                    return match ? (
                                                        <code className={className} {...props} />
                                                    ) : (
                                                        <code
                                                            className="bg-zinc-100 dark:bg-[#383a3c] px-1 py-0.5 rounded-sm text-zinc-900 dark:text-zinc-200"
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
                                        {parsedData.preamble && (
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                                            >
                                                {parsedData.preamble}
                                            </ReactMarkdown>
                                        )}

                                        {parsedData.solutions.length > 1 && (
                                            <div
                                                style={{
                                                    borderWidth: 0
                                                }}
                                                className="border border-zinc-200
                                                 dark:border-[#383a3c]  bg-transparent  rounded-md flex items-center
                                                 justify-between shrink-0">
                                                <Select
                                                    value={selectedSolutionIndex.toString()}
                                                    onValueChange={(val) =>
                                                        setSelectedSolutionIndex(Number.parseInt(val, 10))
                                                    }
                                                >
                                                    <SelectTrigger
                                                        className="h-8 w-35 text-xs bg-zinc-100 dark:bg-[#383a3c] border-[#383a3c] text-zinc-700 dark:text-zinc-300">
                                                        <SelectValue/>
                                                    </SelectTrigger>
                                                    <SelectContent
                                                        className="dark:bg-[#292a30]   dark:border-[#383a3c]">
                                                        {parsedData.solutions.map((s, index) => (
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
                                            components={
                                                {
                                                    pre: ({node, ...props}) => (
                                                        <pre
                                                            className="rounded-md m-0 p-0  bg-transparent overflow-x-auto border border-zinc-200 dark:border-[#383a3c] shadow-sm"
                                                            {...props}
                                                        />
                                                    ),
                                                    code: ({node, className, ...props}) => {
                                                        const match = /language-(\w+)/.exec(className || "");
                                                        return match ? (
                                                            <code className={className} {...props} />
                                                        ) : (
                                                            <code
                                                                className="bg-transparent  p-0 m-0 rounded-sm text-zinc-900 dark:text-zinc-200"
                                                                {...props}
                                                            />
                                                        );
                                                    },
                                                }
                                            }
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
                <div
                    className="flex-1 flex flex-col bg-white dark:bg-[#1e1f20] border-l border-zinc-200 dark:border-[#383a3c]">
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
                                    <Play className="w-3 h-3 mr-1.5"/>
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <Send className="w-3 h-3 mr-1.5"/>
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


