"use client";

import {Editor, type Monaco} from "@monaco-editor/react";

import {AlignLeft, RotateCcw} from "lucide-react";

import * as React from "react";
import { Button } from "@/components/ui/button";
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

	onChange?: (value: string) => void;

	language?: string;

	onLanguageChange?: (language: string) => void;

	actions?: React.ReactNode;
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

	value,

	onChange,

	language = "javascript",

	onLanguageChange,

	actions,

	...props
}: CodeEditorProps) {
		const monacoLanguage = LANGUAGE_MAP[language.toLowerCase()] || "javascript";
		const monacoRef = React.useRef<Monaco | null>(null);
		const editorRef = React.useRef<any>(null);
	
		const [editorTheme, setEditorTheme] = React.useState("xcode-dark");
		const [themeOptions, setThemeOptions] = React.useState<MonacoThemeOption[]>(
			[],
		);
	
		const lastTemplateRef = React.useRef("");
		const valueRef = React.useRef(value);
		const onChangeRef = React.useRef(onChange);
	
		// 格式化文档逻辑
		const handleFormat = React.useCallback(() => {
			if (editorRef.current) {
				editorRef.current.getAction("editor.action.formatDocument").run();
			}
		}, []);

	// 同步最新的 props 到 ref
	React.useEffect(() => {
		valueRef.current = value;
		onChangeRef.current = onChange;
	}, [value, onChange]);

	// 当语言改变时，智能决定是否切换模版
	React.useEffect(() => {
		const currentTemplate = LANGUAGE_TEMPLATES[language.toLowerCase()];
		if (!currentTemplate) return;

		const currentValue = valueRef.current;

		// 如果满足以下任一条件，则切换：
		// 1. 编辑器内容为空
		// 2. 编辑器当前内容恰好是上一个语言的模板（说明用户还没动过代码）
		if (
			!currentValue ||
			currentValue.trim() === "" ||
			currentValue === lastTemplateRef.current
		) {
			lastTemplateRef.current = currentTemplate;
			onChangeRef.current?.(currentTemplate);
		}
	}, [language]); // 现在依赖项只有 language，实现了真正的“只监听语言变化”
	const handleResetTemplate = () => {
		const template = LANGUAGE_TEMPLATES[language.toLowerCase()];
		if (template) {
			lastTemplateRef.current = template;
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
							<span className="text-zinc-500 mr-2">Lang:</span>
							<SelectValue placeholder="Select Language" />
						</SelectTrigger>
						<SelectContent
							className="bg-[#292b2c]  border-zinc-700 text-zinc-100 min-w-[320px]"
							position="popper"
							side="bottom"
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
							<span className="text-zinc-500 mr-2">Theme:</span>
							<SelectValue placeholder="Select Theme" />
						</SelectTrigger>
						<SelectContent
							className="bg-[#292b2c] border-zinc-700 text-zinc-100 min-w-140 max-h-80"
							position="popper"
							side="bottom"
							sideOffset={4}
						>
							<div className="grid grid-cols-4 gap-1 p-1">
								<SelectItem
									value="custom-dark"
									className="text-xs hover:bg-[#2a2d2e] focus:bg-[#094771]"
								>
									Default
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
				                                        className="h-7 w-7 text-zinc-500 hover:text-zinc-200"
				                                        onClick={handleFormat}
				                                    >
				                                        <AlignLeft className="h-3.5 w-3.5" />
				                                    </Button>
				                                </TooltipTrigger>
				                                <TooltipContent>
				                                    <p className="text-xs">Format Code (Ctrl+Alt+L)</p>
				                                </TooltipContent>
				                            </Tooltip>
				
				                            <Tooltip>
				                                <TooltipTrigger asChild>
				                                    <Button
				                                        variant="ghost"
				                                        size="icon"
				                                        className="h-7 w-7 text-zinc-500 hover:text-zinc-200"
				                                        onClick={handleResetTemplate}
				                                    >
				                                        <RotateCcw className="h-3.5 w-3.5" />
				                                    </Button>
				                                </TooltipTrigger>
				                                <TooltipContent>
				                                    <p className="text-xs">Reset to default template</p>
				                                </TooltipContent>
				                            </Tooltip>
				                        </div>
				                    </TooltipProvider>
				
				                    {actions && <div className="flex items-center gap-2">{actions}</div>}
				                </div>
				            </div>
				            <div className="flex-1 relative border-t  mt-px    overflow-hidden">
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
				                            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyL,
				                            () => {
				                                handleFormat();
				                            },
				                        );
				
				                        if (editorTheme !== "custom-dark" && editorTheme !== "vs-dark" && editorTheme !== "xcode-dark") {
				                            void applyTheme(editorTheme);
				                        }
				                    }}					options={{
						minimap: { enabled: false },
						fontSize: 14,
						lineNumbers: "on",
						scrollBeyondLastLine: false,
						automaticLayout: true,
						padding: { top: 16, bottom: 16 },
						fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
						fontLigatures: true,
						readOnly: false,
					}}
					loading={
						<div className="p-4 text-zinc-500 text-xs">Loading editor...</div>
					}
				/>
			</div>
		</div>
	);
}
