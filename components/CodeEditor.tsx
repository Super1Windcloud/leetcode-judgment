"use client";

import type * as React from "react";
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

export function CodeEditor({
	className,
	value,
	onChange,
	language = "javascript",
	onLanguageChange,
	actions,
	...props
}: CodeEditorProps) {
	return (
		<div
			className={cn(
				"flex flex-col h-full bg-[#1e1e1e] border border-zinc-800 rounded-md overflow-hidden",
				className,
			)}
			{...props}
		>
			<div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-zinc-800">
				<Select value={language} onValueChange={onLanguageChange}>
					<SelectTrigger className="w-[140px] h-8 bg-[#3c3c3c] border-zinc-700 text-zinc-100 text-xs">
						<SelectValue placeholder="Select Language" />
					</SelectTrigger>
					<SelectContent className="bg-[#252526] border-zinc-700 text-zinc-100">
						{SUPPORTED_LANGUAGES.map((lang) => (
							<SelectItem
								key={lang.value}
								value={lang.value}
								className="text-xs hover:bg-[#2a2d2e] focus:bg-[#094771]"
							>
								{lang.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{actions && <div className="flex items-center gap-2">{actions}</div>}
			</div>
			<div className="flex-1 relative">
				<textarea
					className="w-full h-full bg-[#1e1e1e] text-zinc-300 font-mono text-sm p-4 resize-none focus:outline-none"
					value={value}
					onChange={(e) => onChange?.(e.target.value)}
					spellCheck={false}
					autoCapitalize="none"
					autoComplete="off"
					autoCorrect="off"
				/>
			</div>
		</div>
	);
}
