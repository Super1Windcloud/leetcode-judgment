import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ASSETS_DIR = path.join(process.cwd(), "assets");

export interface Problem {
	id: string;
	title: string;
	slug: string;
	difficulty?: string;
	tags?: string[];
}

export interface ProblemDetail extends Problem {
	content: string; // The full content or description
	description: string;
	solution: string;
}

export interface PaginatedProblems {
	problems: Problem[];
	total: number;
	totalPages: number;
	currentPage: number;
}

export async function getProblems(
	page = 1,
	limit = 20,
	locale = "en",
): Promise<PaginatedProblems> {
	const entries = await fs.promises.readdir(ASSETS_DIR, {
		withFileTypes: true,
	});

	const allProblems = entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => {
			const folderName = entry.name;
			// Pattern: XXXX.Title
			const match = folderName.match(/^(\d+)\.(.+)$/);
			if (match) {
				return {
					id: match[1],
					title: match[2], // Default title from folder name
					slug: folderName,
				};
			}
			return null;
		})
		.filter((p): p is { id: string; title: string; slug: string } => p !== null)
		.sort((a, b) => Number.parseInt(a.id, 10) - Number.parseInt(b.id, 10));

	const total = allProblems.length;
	const totalPages = Math.ceil(total / limit);
	const offset = (page - 1) * limit;
	const paginatedItems = allProblems.slice(offset, offset + limit);

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
				const titleMatch = content.match(/# \[\d+\. (.+?)\]/);
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

export async function getProblem(
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

		const titleMatch = content.match(/# \[\d+\. (.+?)\]/);
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

		return {
			id: slug.split(".")[0],
			title,
			slug,
			difficulty,
			tags: data.tags || [],
			content,
			description,
			solution,
		};
	} catch (error) {
		console.error(`Error reading problem ${slug}:`, error);
		return null;
	}
}
