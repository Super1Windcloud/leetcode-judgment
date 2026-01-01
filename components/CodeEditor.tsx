"use client";

import type { Monaco } from "@monaco-editor/react";
import { Editor } from "@monaco-editor/react";
import * as React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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

type MonacoThemeOption = {
	value: string;
	label: string;
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
	const [editorTheme, setEditorTheme] = React.useState("custom-dark");
	const [themeOptions, setThemeOptions] = React.useState<MonacoThemeOption[]>(
		[],
	);

	React.useEffect(() => {
		let active = true;

		const loadThemes = async () => {
			try {
				const response = await fetch("/api/monaco-themes");
				if (!response.ok) {
					throw new Error("Failed to load themes");
				}
				const themeList = (await response.json()) as Record<string, string>;
				const options = Object.entries(themeList)
					.map(([value, label]) => ({ value, label }))
					.sort((a, b) => a.label.localeCompare(b.label));
				if (active) {
					setThemeOptions(options);
				}
			} catch (error) {
				console.error("Monaco themes loading failed:", error);
				// Fallback to a few common themes if API fails
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
		if (nextTheme === "custom-dark" || nextTheme === "vs-dark" || nextTheme === "vs-light") {
			setEditorTheme(nextTheme);
			return;
		}

		setEditorTheme(nextTheme);
		if (!monacoRef.current) {
			return;
		}

		try {
			const response = await fetch(`/api/monaco-themes/${nextTheme}`);
			if (!response.ok) {
				return;
			}
			const themeData = (await response.json()) as Record<string, unknown>;
			monacoRef.current.editor.defineTheme(nextTheme, themeData);
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
						<SelectTrigger className="w-25  pl-3  h-9.5 px-0! py-0! m-0 rounded-none bg-[#292b2c] border-none! text-zinc-100 text-xs leading-tight  shadow-none! focus:ring-0">
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
						<SelectTrigger className="w-40  pl-3  h-9.5 px-0! py-0! m-0 rounded-none bg-[#292b2c] border-none! text-zinc-100 text-xs leading-tight  shadow-none! focus:ring-0">
							<SelectValue placeholder="Select Theme" />
						</SelectTrigger>
						<SelectContent 
							className="bg-[#292b2c] border-zinc-700 text-zinc-100 min-w-75 max-h-80"
							position="popper"
							side="bottom"
							sideOffset={4}
						>
							<div className="grid grid-cols-2 gap-1 p-1">
								<SelectItem
									value="custom-dark"
									className="text-xs hover:bg-[#2a2d2e] focus:bg-[#094771]"
								>
									Default (Custom)
								</SelectItem>
								<SelectItem
									value="vs-dark"
									className="text-xs hover:bg-[#2a2d2e] focus:bg-[#094771]"
								>
									Monaco Dark
								</SelectItem>
								<SelectItem
									value="vs-light"
									className="text-xs hover:bg-[#2a2d2e] focus:bg-[#094771]"
								>
									Monaco Light
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
				{actions && <div className="flex items-center gap-2">{actions}</div>}
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
						monaco.editor.defineTheme("custom-dark", {
							base: "vs-dark",
							inherit: true,
							rules: [],
							colors: {
								"editor.background": "#292b2c",
								"editor.lineHighlightBackground": "#2f3133",
							},
						});
					}}
					onMount={() => {
						if (editorTheme !== "custom-dark") {
							void applyTheme(editorTheme);
						}
					}}
					options={{
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
