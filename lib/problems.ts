import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ASSETS_DIR = path.join(process.cwd(), "problems");

export interface Problem {
	id: string | number;
	title: string;
	slug: string;
	difficulty?: string;
	tags?: string[];
}

export interface ProblemDetail extends Problem {
	content: string; // The full content or description
	description: string;
	solution: string;
	templates?: {
		language: string;
		code: string;
		functionName?: string;
	}[];
	testCases?: {
		input: Record<string, unknown>;
		output: unknown;
	}[];
}

const LANGUAGE_EXT_MAP: Record<string, string> = {
	cpp: "cpp",
	c: "c",
	csharp: "cs",
	go: "go",
	java: "java",
	javascript: "js",
	typescript: "ts",
	php: "php",
	python: "py",
	rust: "rs",
};

function clearBraceBodies(code: string): string {
	let result = "";
	let i = 0;

	while (i < code.length) {
		const char = code[i];
		if (char === "{") {
			// Find matching brace
			let count = 1;
			let j = i + 1;
			while (j < code.length && count > 0) {
				if (code[j] === "{") count++;
				else if (code[j] === "}") count--;
				j++;
			}

			// Capture everything before the current '{' to check context
			const lookback = result.slice(-50);
			const isStructural = /\b(class|struct|interface|impl|enum)\b/.test(
				lookback,
			);

			if (isStructural) {
				// It's a container (class/struct), keep its children but clear THEIR bodies
				const body = code.substring(i + 1, j - 1);
				result += `{\n${clearBraceBodies(body)}\n}`;
			} else {
				// It's a leaf body (function/method/block), clear it!
				result += "{\n    \n}";
			}
			i = j;
			continue;
		}
		result += char;
		i++;
	}
	return result;
}

function clearPythonBodies(code: string): string {
	const lines = code.split("\n");
	const result: string[] = [];
	let inFunc = false;
	let funcIndent = 0;

	for (const line of lines) {
		const trimmed = line.trim();
		if (trimmed.startsWith("def ") || trimmed.startsWith("class ")) {
			result.push(line);
			if (trimmed.endsWith(":")) {
				const indent = line.length - line.trimStart().length;
				if (trimmed.startsWith("def ")) {
					result.push(`${" ".repeat(indent + 4)}pass`);
					inFunc = true;
					funcIndent = indent;
				}
			}
		} else if (inFunc) {
			const indent = line.length - line.trimStart().length;
			if (trimmed !== "" && indent <= funcIndent) {
				inFunc = false;
				if (trimmed.startsWith("class ") || trimmed.startsWith("def ")) {
					result.push(line);
					if (trimmed.startsWith("def ")) {
						const newIndent = line.length - line.trimStart().length;
						result.push(`${" ".repeat(newIndent + 4)}pass`);
						inFunc = true;
						funcIndent = newIndent;
					}
				} else {
					result.push(line);
				}
			}
		} else {
			result.push(line);
		}
	}
	return result.join("\n");
}

function extractSignature(language: string, fullCode: string): string {
	const lang = language.toLowerCase();

	if (
		[
			"javascript",
			"typescript",
			"js",
			"ts",
			"java",
			"cpp",
			"csharp",
			"cs",
			"go",
			"rust",
			"rs",
			"c",
		].includes(lang)
	) {
		return clearBraceBodies(fullCode.trim());
	}

	if (["python", "py", "python3"].includes(lang)) {
		return clearPythonBodies(fullCode.trim());
	}

	if (lang === "php") {
		const code = fullCode.trim();
		if (code.startsWith("<?php")) {
			return `<?php\n${clearBraceBodies(code.substring(5))}`;
		}
		return clearBraceBodies(code);
	}

	return fullCode.trim();
}

function normalizeLanguage(lang: string): string {
	const l = lang.toLowerCase();
	if (l === "js" || l === "javascript") return "javascript";
	if (l === "ts" || l === "typescript") return "typescript";
	if (l === "py" || l === "python" || l === "python3") return "python";
	if (l === "cs" || l === "csharp") return "csharp";
	if (l === "rs" || l === "rust") return "rust";
	if (l === "cpp" || l === "c++") return "cpp";
	return l;
}

interface Template {
	language: string;
	code: string;
	functionName?: string;
}

function normalizeTemplates(templates: Template[]) {
	return templates.map((t) => ({
		...t,
		language: normalizeLanguage(t.language),
	}));
}

function extractTemplates(solutionMarkdown: string): {
	language: string;
	code: string;
	functionName?: string;
}[] {
	const templates: { language: string; code: string; functionName?: string }[] =
		[];
	const regex = /```(\w+)[^\r\n]*[\r\n]+([\s\S]*?)[\r\n]+```/g;
	let match: RegExpExecArray | null;

	// biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop
	while ((match = regex.exec(solutionMarkdown)) !== null) {
		const language = match[1].toLowerCase();
		const fullCode = match[2].trim();

		let functionName = "";
		// Extract function name logic (same as before)
		if (["javascript", "typescript", "js", "ts"].includes(language)) {
			const nameMatch = fullCode.match(
				/(?:function|var|const|let)\s+(\w+)\s*[=(]|export\s+function\s+(\w+)/,
			);
			functionName = nameMatch ? nameMatch[1] || nameMatch[2] : "";
		} else if (language === "python" || language === "python3") {
			const nameMatch = fullCode.match(/def\s+(\w+)\(/);
			functionName = nameMatch ? nameMatch[1] : "";
		} else if (language === "java") {
			const nameMatch = fullCode.match(/public\s+[\w<>[\]]+\s+(\w+)\(/);
			functionName = nameMatch ? nameMatch[1] : "";
		} else if (language === "cpp") {
			const solMatch = fullCode.match(
				/class\s+Solution\s*\{[\s\S]*?public:[\s\S]*?([\w<>:]+)\s+(\w+)\(/,
			);
			functionName = solMatch ? solMatch[2] : "";
		} else if (language === "go") {
			const nameMatch = fullCode.match(/func\s+(\w+)\(/);
			functionName = nameMatch ? nameMatch[1] : "";
		}

		templates.push({
			language,
			code: extractSignature(language, fullCode),
			functionName,
		});
	}

	return templates;
}

async function getTemplatesFromFiles(problemDir: string): Promise<
	{
		language: string;
		code: string;
		functionName?: string;
	}[]
> {
	const templates: { language: string; code: string; functionName?: string }[] =
		[];

	for (const [lang, ext] of Object.entries(LANGUAGE_EXT_MAP)) {
		const filePath = path.join(problemDir, `Solution.${ext}`);
		if (fs.existsSync(filePath)) {
			try {
				const fullCode = await fs.promises.readFile(filePath, "utf-8");

				const normalizedLang = normalizeLanguage(lang);
				let functionName = "";
				// Extract function name
				if (["javascript", "typescript"].includes(normalizedLang)) {
					const nameMatch = fullCode.match(
						/(?:function|var|const|let)\s+(\w+)\s*[=(]|export\s+function\s+(\w+)/,
					);
					functionName = nameMatch ? nameMatch[1] || nameMatch[2] : "";
				} else if (normalizedLang === "python") {
					const nameMatch = fullCode.match(/def\s+(\w+)\(/);
					functionName = nameMatch ? nameMatch[1] : "";
				} else if (normalizedLang === "java") {
					const nameMatch = fullCode.match(/public\s+[\w<>[\]]+\s+(\w+)\(/);
					functionName = nameMatch ? nameMatch[1] : "";
				} else if (normalizedLang === "cpp") {
					const solMatch = fullCode.match(
						/class\s+Solution\s*\{[\s\S]*?public:[\s\S]*?([\w<>:]+)\s+(\w+)\(/,
					);
					functionName = solMatch ? solMatch[2] : "";
				} else if (normalizedLang === "go") {
					const nameMatch = fullCode.match(/func\s+(\w+)\(/);
					functionName = nameMatch ? nameMatch[1] : "";
				} else if (normalizedLang === "rust") {
					const nameMatch = fullCode.match(/fn\s+(\w+)\(/);
					functionName = nameMatch ? nameMatch[1] : "";
				}

				templates.push({
					language: normalizedLang,
					code: extractSignature(normalizedLang, fullCode),
					functionName,
				});
			} catch (e) {
				console.error(`Error reading ${filePath}:`, e);
			}
		}
	}

	return templates;
}

export interface PaginatedProblems {
	problems: Problem[];
	total: number;
	totalPages: number;
	currentPage: number;
}

function getSmartCollection(allProblems: Problem[]) {
	const finalProblemsMap = new Map<string, Problem>(); // 使用 Map 方便通过 ID 去重

	// 1. 获取所有存在的 Tag 列表
	const allTags = new Set<string>();
	allProblems.map((p) => p.tags?.map((t) => allTags.add(t)));

	// 2. 核心逻辑：遍历每个 Tag，尝试抓取 2 题
	allTags.forEach((tag) => {
		let countForThisTag = 0;

		for (const p of allProblems) {
			if (countForThisTag >= 2) break; // 每个 Tag 最多拿 2 个

			if (p.tags?.includes(tag)) {
				finalProblemsMap.set(p.id.toString(), p);
				countForThisTag++;
			}
		}
	});

	// 3. 补全难度（确保 Easy, Medium, Hard 至少各有一个）
	const finalArray = Array.from(finalProblemsMap.values());
	const difficulties = ["Easy", "Medium", "Hard"];

	difficulties.forEach((diff) => {
		const hasDiff = finalArray.some((p) => p.difficulty === diff);
		if (!hasDiff) {
			const found = allProblems.find((p) => p.difficulty === diff);
			if (found) finalArray.push(found);
		}
	});

	return finalArray;
}

export async function getProblems(
	page = 1,
	limit = 20,
	locale = "en",
): Promise<PaginatedProblems> {
	const entries = await fs.promises.readdir(ASSETS_DIR, {
		withFileTypes: true,
	});

	// 1. 先拿到基础列表
	const baseProblems = entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => {
			const match = entry.name.match(/^(\d+)\.(.+)$/);
			return match ? { id: match[1], title: match[2], slug: entry.name } : null;
		})
		.filter(
			(p): p is { id: string; title: string; slug: string } => p !== null,
		);

	// 2. 重要：必须先加载所有题目的 tags 和 difficulty 才能进行 SmartCollection 筛选
	const allProblemsWithMeta = await Promise.all(
		baseProblems.map(async (p) => {
			try {
				const readmePath = path.join(ASSETS_DIR, p.slug, "README.md");
				const fileContent = await fs.promises.readFile(readmePath, "utf-8");
				const { data } = matter(fileContent); // 只读 frontmatter，速度很快

				let difficulty = data.difficulty;
				// 简单的难度映射逻辑
				if (difficulty === "简单") difficulty = "Easy";
				if (difficulty === "中等") difficulty = "Medium";
				if (difficulty === "困难") difficulty = "Hard";

				return { ...p, difficulty, tags: data.tags || [] };
			} catch {
				return { ...p, tags: [] };
			}
		}),
	);

	const filteredProblems = getSmartCollection(allProblemsWithMeta);

	const finalWithOrder = filteredProblems.map((p, idx) => ({
		...p,
		id: idx + 1, // 新的连续编号，从 1 开始
	}));

	// console.log(finalWithOrder)
	const total = finalWithOrder.length;
	const totalPages = Math.ceil(total / limit);
	const offset = (page - 1) * limit;
	const paginatedItems = finalWithOrder.slice(offset, offset + limit);

	// Fetch details for the current page
	const problemsWithDetails = await Promise.all(
		paginatedItems.map(async (p) => {
			try {
				let readmePath = path.join(ASSETS_DIR, p.slug, "README.md");
				let isFallback = false;

				if (locale === "en") {
					const enReadmePath = path.join(ASSETS_DIR, p.slug, "README_EN.md");
					try {
						await fs.promises.access(enReadmePath);
						readmePath = enReadmePath;
					} catch {
						isFallback = true;
					}
				}

				const fileContent = await fs.promises.readFile(readmePath, "utf-8");
				const { data, content } = matter(fileContent);

				// Extract title from content if available: # [ID. Title](url)
				const titleMatch = content.match(/# \[\d+\. (.+?)]/);
				const title = titleMatch ? titleMatch[1] : p.title;

				let difficulty = data.difficulty;

				if (locale === "en") {
					// If reading README_EN.md, difficulty should be English (Easy/Medium/Hard)
					// If fallback to README.md (Chinese), map it.
					if (isFallback) {
						if (difficulty === "简单") difficulty = "Easy";
						if (difficulty === "中等") difficulty = "Medium";
						if (difficulty === "困难") difficulty = "Hard";
					}
				} else if (locale === "zh") {
					// Expect Chinese. If for some reason we read English file or it's English,
					// we might want to map back, but typically README.md is Chinese.
					// Assuming README.md has "简单"/"中等"/"困难".
				}

				return {
					...p,
					title,
					difficulty,
					tags: data.tags || [],
				};
			} catch (_e) {
				return p; // Return without details if read fails
			}
		}),
	);

	return {
		problems: problemsWithDetails,
		total,
		totalPages,
		currentPage: page,
	};
}

async function getProblem(
	slug: string,
	language: string = "en",
): Promise<ProblemDetail | null> {
	const problemDir = path.join(ASSETS_DIR, slug);
	let readmePath = path.join(problemDir, "README.md");

	if (language === "en") {
		const enReadmePath = path.join(problemDir, "README_EN.md");
		try {
			await fs.promises.access(enReadmePath);
			readmePath = enReadmePath;
		} catch {
			// Fallback to README.md if EN version doesn't exist
		}
	}

	try {
		const fileContent = await fs.promises.readFile(readmePath, "utf-8");
		const { data, content } = matter(fileContent);

		// Split content based on comments if possible, or just return as is
		// The format seems to be:
		// <!-- problem:start -->
		// ... description ...
		// <!-- description:end -->
		// ...
		// <!-- solution:start -->
		// ... solution ...
		// <!-- solution:end -->

		let description = content;
		let solution = "";

		const descriptionMatch = content.match(
			/<!-- description:start -->([\s\S]*?)<!-- description:end -->/,
		);
		if (descriptionMatch) {
			description = descriptionMatch[1];
		}

		const solutionMatch = content.match(
			/<!-- solution:start -->([\s\S]*?)<!-- solution:end -->/,
		);
		if (solutionMatch) {
			solution = solutionMatch[1];
		}

		const titleMatch = content.match(/# \[\d+\. (.+?)]/);
		// Default to slug-derived title if regex fails, but try to use content title
		const title = titleMatch
			? titleMatch[1]
			: slug.split(".").slice(1).join(".");

		// Attempt to map difficulty from Chinese to English if simple and language is EN
		let difficulty = data.difficulty;
		if (language === "en") {
			if (difficulty === "简单") difficulty = "Easy";
			if (difficulty === "中等") difficulty = "Medium";
			if (difficulty === "困难") difficulty = "Hard";
		}

		const fileTemplates = await getTemplatesFromFiles(problemDir);
		const extractedTemplates = extractTemplates(solution);

		// Merge: prioritize file templates
		const templatesMap = new Map<string, Template>();
		for (const t of normalizeTemplates(extractedTemplates))
			templatesMap.set(t.language, t);
		for (const t of normalizeTemplates(fileTemplates))
			templatesMap.set(t.language, t);
		const templates = Array.from(templatesMap.values());

		let testCases: ProblemDetail["testCases"];
		try {
			const testCasePath = path.join(problemDir, "test_case.json");
			if (fs.existsSync(testCasePath)) {
				const testCaseContent = await fs.promises.readFile(
					testCasePath,
					"utf-8",
				);
				const parsed = JSON.parse(testCaseContent);
				testCases = parsed.testCases;
			}
		} catch (e) {
			console.error(`Error reading test cases for ${slug}:`, e);
		}

		return {
			id: slug.split(".")[0],
			title,
			slug,
			difficulty,
			tags: data.tags || [],
			content,
			description,
			solution,
			templates,
			testCases,
		};
	} catch (error) {
		console.error(`Error reading problem ${slug}:`, error);
		return null;
	}
}

export default getProblem;
