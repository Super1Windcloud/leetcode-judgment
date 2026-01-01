"use client";

import type * as React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {cn} from "@/lib/utils";

import {Editor} from "@monaco-editor/react";

interface CodeEditorProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
    value?: string;

    onChange?: (value: string) => void;

    language?: string;
    onLanguageChange?: (language: string) => void;
    actions?: React.ReactNode;
}

const SUPPORTED_LANGUAGES = [
    {value: "cpp", label: "C++"},
    {value: "c", label: "C"},
    {value: "csharp", label: "C#"},
    {value: "go", label: "Go"},
    {value: "java", label: "Java"},
    {value: "javascript", label: "JavaScript"},
    {value: "typescript", label: "TypeScript"},
    {value: "php", label: "PHP"},
    {value: "python", label: "Python"},
    {value: "rust", label: "Rust"},
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

    return (
        <div
            className={cn(
                "flex flex-col h-full bg-[#292b2c] border-zinc-800  overflow-hidden",
                className,
            )}
            {...props}
        >
            <div className="flex items-center  justify-between  h-9.5  bg-[#292b2c]  border-zinc-800">
                <Select value={language} onValueChange={onLanguageChange}>
                    <SelectTrigger
                        className="w-25  pl-3  h-full! px-0! py-0! m-0 rounded-none bg-[#292b2c] border-none! text-zinc-100 text-xs leading-tight  shadow-none!">
                        <SelectValue placeholder="Select Language"/>
                    </SelectTrigger>
                    <SelectContent
                        className="ml-45 bg-[#292b2c]  border-zinc-700 text-zinc-100 min-w-[320px]"
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
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
            <div className="flex-1 relative border-t  mt-px    overflow-hidden">
                <Editor
                    height="100%"
                    language={monacoLanguage}
                    theme="custom-dark"
                    value={value}
                    onChange={(val) => onChange?.(val || "")}
                    beforeMount={(monaco) => {
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
                    options={{
                        minimap: {enabled: false},
                        fontSize: 14,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: {top: 16, bottom: 16},
                        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                        fontLigatures: true,
                        readOnly: false,
                    }}
                    loading={<div className="p-4 text-zinc-500 text-xs">Loading editor...</div>}
                />
            </div>
        </div>
    );
}
