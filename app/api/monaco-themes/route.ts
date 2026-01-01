import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const require = createRequire(import.meta.url);

const getThemeListPath = () => {
	const candidates: string[] = [];

	try {
		const monacoEntryPath = require.resolve("monaco-themes");
		const monacoPackageRoot = path.dirname(path.dirname(monacoEntryPath));
		candidates.push(path.join(monacoPackageRoot, "themes", "themelist.json"));
	} catch {
		// Ignore and fall back to cwd resolution.
	}

	candidates.push(
		path.join(
			process.cwd(),
			"node_modules",
			"monaco-themes",
			"themes",
			"themelist.json",
		),
	);

	for (const candidate of candidates) {
		if (existsSync(candidate)) {
			return candidate;
		}
	}

	throw new Error("Monaco themes list not found on server.");
};

export async function GET() {
	const themeListPath = getThemeListPath();
	const payload = await readFile(themeListPath, "utf-8");

	return new NextResponse(payload, {
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, max-age=3600",
		},
	});
}
