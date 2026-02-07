"use client";

import { Editor, type Monaco } from "@monaco-editor/react";

import { AlignLeft, RotateCcw, Terminal } from "lucide-react";
import { useTranslations } from "next-intl";

import * as React from "react";
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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CodeEditorProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	value?: string;

	callbackFns?: {
		handleRun: () => Promise<void>;
	};
	onChange?: (value: string) => void;

	language?: string;

	onLanguageChange?: (language: string) => void;

	actions?: React.ReactNode;

	output?: {
		id: string;
		type: "stdout" | "stderr" | "system";
		content: string;
	}[];
}

const SUPPORTED_LANGUAGES = [
	{ value: "cpp", label: "C++" },
	{ value: "c", label: "C" },
	{ value: "csharp", label: "C#" },
	{ value: "go", label: "Go" },
	{ value: "java", label: "Java" },
	{ value: "javascript", label: "JavaScript" },
	{ value: "typescript", label: "TypeScript" },
	{ value: "php", label: "PHP" },
	{ value: "python", label: "Python" },
	{ value: "rust", label: "Rust" },
];

const LANGUAGE_MAP: Record<string, string> = {
	cpp: "cpp",
	c: "c",
	csharp: "csharp",
	go: "go",
	java: "java",
	javascript: "javascript",
	typescript: "typescript",
	php: "php",
	python: "python",
	rust: "rust",
};

const LANGUAGE_TEMPLATES: Record<string, string> = {
	cpp: `#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        \n    }\n};\n\nint main() {\n    Solution sol;\n    sol.solve();\n    return 0;\n}`,
	c: `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\nint main() {\n    \n    return 0;\n}`,
	csharp: `using System;\nusing System.Collections.Generic;\n\npublic class Solution {\n    public void Solve() {\n        \n    }\n}\n\npublic class Program {\n    public static void Main() {\n        Solution sol = new Solution();\n        sol.Solve();\n    }\n}`,
	go: `package main\n\nimport (\n    "fmt"\n)\n\nfunc main() {\n    \n}`,
	java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n    }\n}\n\nclass Solution {\n    public void solve() {\n        \n    }\n}`,
	javascript: `/**\n * @return {void}\n */\nvar solve = function() {\n    \n};\n\n// solve();`,
	typescript: `function solve(): void {\n    \n}\n\n// solve();`,
	php: `<?php\n\nclass Solution {\n    /**\n     * @return void\n     */\n    function solve() {\n        \n    }\n}\n\n$sol = new Solution();\n$sol->solve();`,
	python: `import collections\nimport heapq\nimport math\n\nclass Solution:\n    def solve(self):\n        pass\n\nif __name__ == "__main__":\n    sol = Solution()\n    sol.solve()`,
	rust: `struct Solution;\n\nimpl Solution {\n    pub fn solve() {\n        \n    }\n}\n\nfn main() {\n    Solution::solve();\n}`,
};

type MonacoThemeOption = {
	value: string;
	label: string;
};

const LIGHT_THEMES_BLACKLIST = [
	"vs-light",

	"active4d",

	"clouds",

	"chrome-devtools",

	"dawn",

	"eiffel",
	"github",

	"idle",

	"iplastic",

	"katzenmilch",

	"kuroir",

	"lazy",

	"slush-and-poppies",

	"solarized-light",

	"textmate-mac-classic",

	"tomorrow",

	"xcode-default",
];

const XCODE_DARK_THEME_DATA = {
	base: "vs-dark" as const,

	inherit: true,

	rules: [
		{ token: "comment", foreground: "A0D07D" },

		{ token: "punctuation.definition.comment", foreground: "A0D07D" },

		{ token: "punctuation.definition.string", foreground: "FC6A5D" },

		{ token: "string", foreground: "FC6A5D" },

		{ token: "constant.numeric", foreground: "D0BF69" },

		{ token: "keyword.other.unit", foreground: "D0BF69" },

		{ token: "support.constant", foreground: "D0BF69" },

		{ token: "constant.language", foreground: "FF7AB2", fontStyle: "bold" },

		{ token: "entity.name.tag", foreground: "FF7AB2", fontStyle: "bold" },

		{ token: "keyword", foreground: "FF7AB2", fontStyle: "bold" },

		{ token: "storage.modifier", foreground: "FF7AB2", fontStyle: "bold" },

		{ token: "storage.type", foreground: "FF7AB2", fontStyle: "bold" },

		{
			token: "support.type.primitive",
			foreground: "FF7AB2",
			fontStyle: "bold",
		},

		{ token: "variable.language", foreground: "FF7AB2", fontStyle: "bold" },

		{ token: "keyword.control.directive", foreground: "FFA14F" },

		{ token: "keyword.control.preprocessor", foreground: "FFA14F" },

		{ token: "punctuation.definition.preprocessor", foreground: "FFA14F" },

		{ token: "markup.underline.link", foreground: "6699FF" },

		{ token: "entity.name.type.class.std.rust", foreground: "ACF2E4" },

		{ token: "storage.type.cs", foreground: "ACF2E4" },

		{ token: "support.type", foreground: "ACF2E4" },

		{ token: "meta.object-literal.key", foreground: "ACF2E4" },

		{ token: "punctuation.definition.variable", foreground: "83C9BC" },

		{ token: "punctuation.support.type.property-name", foreground: "83C9BC" },

		{ token: "storage.modifier.lifetime", foreground: "83C9BC" },

		{ token: "support.type.property-name", foreground: "83C9BC" },

		{ token: "variable.other.property", foreground: "83C9BC" },

		{ token: "meta.definition.function", foreground: "5DD8FF" },

		{ token: "meta.definition.method", foreground: "5DD8FF" },

		{ token: "meta.method.declaration", foreground: "5DD8FF" },

		{ token: "variable.other.constant", foreground: "FFFFFF" },

		{ token: "meta.definition.variable", foreground: "FFFFFF" },

		{ token: "variable.parameter", foreground: "4eb1cc" },

		{ token: "meta.parameters", foreground: "4eb1cc" },

		{ token: "meta.object.member", foreground: "4eb1cc" },

		{ token: "constant.language.boolean.false", foreground: "D6C455" },

		{ token: "constant.language.boolean.true", foreground: "D6C455" },

		{ token: "meta.objectliteral", foreground: "D6C455" },

		{ token: "entity.name.type", foreground: "E5CFFF" },

		{ token: "entity.name.type.class", foreground: "5DD8FF" },

		{ token: "entity.other.inherited-class", foreground: "5DD8FF" },

		{ token: "keyword.operator", foreground: "A167E6" },

		{ token: "meta.function-call", foreground: "B281EB" },

		{ token: "entity.name.type.namespace", foreground: "49B7D7" },

		{ token: "entity.name.variable", foreground: "49B7D7" },

		{ token: "variable.other.assignment", foreground: "49B7D7" },

		{ token: "variable.object.property", foreground: "49B7D7" },

		{ token: "meta.definition.property", foreground: "49B7D7" },

		{ token: "meta.field.declaration", foreground: "49B7D7" },

		{ token: "meta.class", foreground: "49B7D7" },
	],

	colors: {
		"editor.background": "#292b2c",

		"editor.foreground": "#dfdfe0",

		"editor.lineHighlightBackground": "#2f3239",

		"editor.selectionBackground": "#646f8366",

		"editorCursor.foreground": "#ffffff",

		"editorLineNumber.foreground": "#dfdfdf55",

		"editorLineNumber.activeForeground": "#dfdfdf",

		"editorIndentGuide.background": "#00000000",

		"editorIndentGuide.activeBackground": "#00000000",
	},
};

// bg-[#292a30]

export function CodeEditor({
	className,
	callbackFns,
	value,

	onChange,

	language = "javascript",

	onLanguageChange,

	actions,

	output,

	...props
}: CodeEditorProps) {
	const t = useTranslations("CodeEditor");
	const monacoLanguage = LANGUAGE_MAP[language.toLowerCase()] || "javascript";
	const monacoRef = React.useRef<Monaco | null>(null);
	const editorRef = React.useRef<
		| Parameters<NonNullable<React.ComponentProps<typeof Editor>["onMount"]>>[0]
		| null
	>(null);

	const [editorTheme, setEditorTheme] = React.useState("xcode-dark");
	const [themeOptions, setThemeOptions] = React.useState<MonacoThemeOption[]>(
		[],
	);

	const lastTemplateRef = React.useRef("");
	const valueRef = React.useRef(value);
	const onChangeRef = React.useRef(onChange);
	const languageRef = React.useRef(language);
	const callbackFnsRef = React.useRef(callbackFns);
	const codeCacheRef = React.useRef<Record<string, string>>({});
	const prevLanguageRef = React.useRef(language);

	// 格式化文档逻辑
	const handleFormat = React.useCallback(async () => {
		const editor = editorRef.current;
		if (!editor) {
			return;
		}

		editor.focus();

		const activeLanguage = languageRef.current.toLowerCase();
		const isTsOrJs =
			activeLanguage === "typescript" || activeLanguage === "javascript";

		if (isTsOrJs) {
			// JS/TS 直接走 Monaco 内置格式化
			const formatAction = editor.getAction("editor.action.formatDocument");
			if (formatAction) {
				void formatAction.run();
			}
			return;
		}

		const model = editor.getModel();
		if (!model) {
			return;
		}

		const currentValue = model.getValue();
		if (!currentValue.trim()) {
			return;
		}

		try {
			const response = await fetch("/api/format", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					language: activeLanguage,
					code: currentValue,
				}),
			});

			if (!response.ok) {
				throw new Error(`Format request failed: ${response.status}`);
			}

			const payload = (await response.json()) as {
				formatted?: string;
				error?: string;
			};

			const formattedValue =
				typeof payload.formatted === "string" && payload.formatted.length > 0
					? payload.formatted
					: currentValue;

			const currentSelection = editor.getSelection();
			editor.setValue(formattedValue);
			if (currentSelection) {
				editor.setSelection(currentSelection);
			}
			onChangeRef.current?.(formattedValue);
		} catch (error) {
			console.error("Format request failed:", error);
			// 保底方案：没有格式化器时重新缩进
			const currentSelection = editor.getSelection();
			editor.setSelection(model.getFullModelRange());
			editor.trigger("anyString", "editor.action.reindentlines", null);
			if (currentSelection) {
				editor.setSelection(currentSelection);
			}
		}
	}, []);

	// 同步最新的 props 到 ref
	React.useEffect(() => {
		valueRef.current = value;
		onChangeRef.current = onChange;
		languageRef.current = language;
		callbackFnsRef.current = callbackFns;
	}, [value, onChange, language, callbackFns]);

	// 当语言改变时，自动切换到对应语言的代码（从缓存加载或使用模板）
	React.useEffect(() => {
		const currentLanguage = language.toLowerCase();
		const oldLanguage = prevLanguageRef.current.toLowerCase();
		const currentValue = valueRef.current || "";

		if (oldLanguage !== currentLanguage) {
			// 1. 保存旧语言的代码到缓存
			codeCacheRef.current[oldLanguage] = currentValue;

			// 2. 加载新语言的代码
			const cachedCode = codeCacheRef.current[currentLanguage];
			const template = LANGUAGE_TEMPLATES[currentLanguage];

			if (cachedCode !== undefined && cachedCode.trim() !== "") {
				// 如果缓存中有内容，则恢复缓存
				onChangeRef.current?.(cachedCode);
			} else if (template) {
				// 否则加载模板
				lastTemplateRef.current = template;
				onChangeRef.current?.(template);
			}

			prevLanguageRef.current = language;
		} else if (currentValue.trim() === "") {
			// 初始挂载且内容为空，自动加载当前语言的模板
			const template = LANGUAGE_TEMPLATES[currentLanguage];
			if (template) {
				lastTemplateRef.current = template;
				onChangeRef.current?.(template);
			}
		}
	}, [language]);

	const handleResetTemplate = () => {
		const template = LANGUAGE_TEMPLATES[language.toLowerCase()];
		if (template) {
			lastTemplateRef.current = template;
			// 重置时清除当前语言的缓存
			codeCacheRef.current[language.toLowerCase()] = template;
			onChange?.(template);
		}
	};

	React.useEffect(() => {
		let active = true;

		const loadThemes = async () => {
			try {
				const response = await fetch("/api/monaco-themes");

				if (!response.ok) {
					throw new Error(`Failed to load themes: ${response.status}`);
				}

				const themeList = (await response.json()) as Record<string, string>;

				const options = Object.entries(themeList)

					.filter(([value]) => !LIGHT_THEMES_BLACKLIST.includes(value))

					.map(([value, label]) => ({ value, label }))

					.sort((a, b) => a.label.localeCompare(b.label));

				if (active) {
					setThemeOptions(options);
				}
			} catch (error) {
				console.error("Monaco themes loading failed:", error);

				// Fallback to a few common themes if API fails (all dark)

				if (active) {
					setThemeOptions([
						{ value: "cobalt", label: "Cobalt" },

						{ value: "monokai", label: "Monokai" },

						{ value: "dracula", label: "Dracula" },

						{ value: "night-owl", label: "Night Owl" },

						{ value: "oceanic-next", label: "Oceanic Next" },
					]);
				}
			}
		};

		void loadThemes();

		return () => {
			active = false;
		};
	}, []);

	const applyTheme = React.useCallback(async (nextTheme: string) => {
		// 如果是本地已定义的主题，直接切换状态

		if (
			nextTheme === "custom-dark" ||
			nextTheme === "vs-dark" ||
			nextTheme === "xcode-dark"
		) {
			setEditorTheme(nextTheme);

			return;
		}

		// 如果 Monaco 实例还没准备好，先不切换状态

		if (!monacoRef.current) {
			return;
		}

		try {
			// 先获取并定义主题

			const response = await fetch(`/api/monaco-themes/${nextTheme}`);

			if (!response.ok) {
				return;
			}

			const themeData = (await response.json()) as Record<string, unknown>;

			// 关键：先在 Monaco 中定义该主题

			monacoRef.current.editor.defineTheme(nextTheme, themeData);

			// 定义成功后，再更新 React 状态触发编辑器切换主题

			setEditorTheme(nextTheme);
		} catch (error) {
			console.error(`Failed to load theme ${nextTheme}:`, error);
		}
	}, []);

	const handleThemeChange = (nextTheme: string) => {
		void applyTheme(nextTheme);
	};

	return (
		<div
			className={cn(
				"flex flex-col h-full bg-[#292b2c] border-zinc-800  overflow-hidden",
				className,
			)}
			{...props}
		>
			<div className="flex items-center  justify-between  h-9.5  bg-[#292b2c]  border-zinc-800">
				<div className="flex items-center gap-0">
					<Select value={language} onValueChange={onLanguageChange}>
						<SelectTrigger className="w-35  pl-3  h-9.5 px-0! py-0! m-0 rounded-none bg-[#292b2c] border-none! text-zinc-100 text-xs leading-tight  shadow-none! focus:ring-0">
							<span className="text-zinc-500 mr-2">{t("language")}:</span>
							<SelectValue placeholder={t("selectLanguage")} />
						</SelectTrigger>
						<SelectContent
							className="bg-[#292b2c]  border-zinc-700 text-zinc-100 min-w-[320px]"
							position="popper"
							side="bottom"
							align={"start"}
							sideOffset={4}
						>
							<div className="grid grid-cols-3 gap-1 p-1">
								{SUPPORTED_LANGUAGES.map((lang) => (
									<SelectItem
										key={lang.value}
										value={lang.value}
										className="text-xs hover:bg-[#2a2d2e] focus:bg-[#094771]"
									>
										{lang.label}
									</SelectItem>
								))}
							</div>
						</SelectContent>
					</Select>

					<div className="w-px h-4 bg-zinc-700 mx-1" />

					<Select value={editorTheme} onValueChange={handleThemeChange}>
						<SelectTrigger className="w-52  pl-3  h-9.5 px-0! py-0! m-0 rounded-none bg-[#292b2c] border-none! text-zinc-100 text-xs leading-tight  shadow-none! focus:ring-0">
							<span className="text-zinc-500 mr-2">{t("theme")}:</span>
							<SelectValue placeholder={t("selectTheme")} />
						</SelectTrigger>
						<SelectContent
							className="bg-[#292b2c] border-zinc-700 text-zinc-100 min-w-140 max-h-80"
							position="popper"
							side="bottom"
							align={"start"}
							sideOffset={4}
						>
							<div className="grid grid-cols-4 gap-1 p-1">
								<SelectItem
									value="custom-dark"
									className="text-xs hover:bg-[#2a2d2e] focus:bg-[#094771]"
								>
									{t("defaultTheme")}
								</SelectItem>
								<SelectItem
									value="xcode-dark"
									className="text-xs hover:bg-[#2a2d2e] focus:bg-[#094771]"
								>
									Xcode Dark
								</SelectItem>
								<SelectItem
									value="vs-dark"
									className="text-xs hover:bg-[#2a2d2e] focus:bg-[#094771]"
								>
									Monaco Dark
								</SelectItem>
								{themeOptions.map((themeOption) => (
									<SelectItem
										key={themeOption.value}
										value={themeOption.value}
										className="text-xs hover:bg-[#2a2d2e] focus:bg-[#094771]"
									>
										{themeOption.label}
									</SelectItem>
								))}
							</div>
						</SelectContent>
					</Select>
				</div>
				<div className="flex items-center gap-2 px-2">
					<TooltipProvider>
						<div className="flex items-center gap-1">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7  cursor-pointer text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
										onClick={handleFormat}
									>
										<AlignLeft className="h-3.5 w-3.5" />
									</Button>
								</TooltipTrigger>
								<TooltipContent className="bg-zinc-800 text-zinc-200 border-zinc-700">
									<p className="text-xs">{t("formatCode")}</p>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7  cursor-pointer text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
										onClick={handleResetTemplate}
									>
										<RotateCcw className="h-3.5 w-3.5" />
									</Button>
								</TooltipTrigger>
								<TooltipContent className="bg-zinc-800 text-zinc-200 border-zinc-700">
									<p className="text-xs">{t("resetTemplate")}</p>
								</TooltipContent>
							</Tooltip>
							{actions && (
								<div className="flex items-center gap-1">{actions}</div>
							)}
						</div>
					</TooltipProvider>
				</div>
			</div>
			<div className="flex-1 relative border-t  mt-px    overflow-hidden">
				<ResizablePanelGroup direction="vertical">
					<ResizablePanel
						defaultSize={output && output.length > 0 ? 75 : 100}
						minSize={20}
					>
						<Editor
							height="100%"
							language={monacoLanguage}
							theme={editorTheme}
							value={value}
							onChange={(val) => onChange?.(val || "")}
							beforeMount={(monaco) => {
								monacoRef.current = monaco;
								// 注册自定义默认主题
								monaco.editor.defineTheme("custom-dark", {
									base: "vs-dark",
									inherit: true,
									rules: [],
									colors: {
										"editor.background": "#292b2c",
										"editor.lineHighlightBackground": "#2f3133",
									},
								});
								// 注册 Xcode Dark 主题
								monaco.editor.defineTheme("xcode-dark", {
									base: "vs-dark",
									inherit: true,
									rules: XCODE_DARK_THEME_DATA.rules,
									colors: XCODE_DARK_THEME_DATA.colors,
								});
							}}
							onMount={(editor, monaco) => {
								editorRef.current = editor;

								// 注册快捷键 Ctrl+Alt+L
								editor.addCommand(
									monaco.KeyMod.CtrlCmd |
										monaco.KeyMod.Alt |
										monaco.KeyCode.KeyL,
									async () => {
										await handleFormat();
									},
								);
								editor.addCommand(
									monaco.KeyMod.Alt | monaco.KeyCode.KeyE,
									async () => {
										await callbackFnsRef.current?.handleRun();
									},
								);

								if (
									editorTheme !== "custom-dark" &&
									editorTheme !== "vs-dark" &&
									editorTheme !== "xcode-dark"
								) {
									void applyTheme(editorTheme);
								}
							}}
							options={{
								minimap: { enabled: false },
								fontSize: 18,
								lineNumbers: "on",
								allowVariableFonts: true,
								unusualLineTerminators: "auto",
								scrollBeyondLastLine: true,
								automaticLayout: true,
								padding: { top: 16, bottom: 16 },
								fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
								fontLigatures: true,
								readOnly: false,
								formatOnType: true,
								formatOnPaste: true,

								autoIndent: "full",
								mouseWheelZoom: true,
								smoothScrolling: true,
								cursorSmoothCaretAnimation: "off",
								scrollOnMiddleClick: false,
								cursorBlinking: "smooth",
								showUnused: true,
								showDeprecated: true,
								inlayHints: {
									enabled: "on",
									padding: true,
								},
								bracketPairColorization: {
									enabled: true,
								},
								parameterHints: {
									enabled: true,
									cycle: true,
								},
								guides: {
									indentation: true,
									bracketPairs: false,
									bracketPairsHorizontal: true,
								},
							}}
							loading={
								<div className="p-4 text-zinc-500 text-xs">{t("loading")}</div>
							}
						/>
					</ResizablePanel>

					{output && output.length > 0 && (
						<>
							<ResizableHandle
								withHandle
								className="bg-zinc-800 border-zinc-700"
							/>
							<ResizablePanel defaultSize={25} minSize={10}>
								<div className="h-full flex flex-col bg-[#1e1e1e] border-t border-zinc-800">
									<div className="flex items-center gap-2 px-3 h-8 bg-[#252526] text-zinc-400 text-[10px] uppercase tracking-wider font-bold shrink-0">
										<Terminal className="w-3 h-3" />
										{t("runResult")}
									</div>
									<ScrollArea className="flex-1 font-mono text-xs">
										<div className="p-3">
											{output.map((line) => (
												<div
													key={line.id}
													className={cn(
														"whitespace-pre-wrap mb-1",
														line.type === "stdout" && "text-zinc-100",
														line.type === "stderr" && "text-red-400",
														line.type === "system" && "text-blue-400 italic",
													)}
												>
													{line.content}
												</div>
											))}
										</div>
									</ScrollArea>
								</div>
							</ResizablePanel>
						</>
					)}
				</ResizablePanelGroup>
			</div>
		</div>
	);
}
