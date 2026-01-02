import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const require = createRequire(import.meta.url);

const getThemesDir = () => {
	const candidates: string[] = [];

	try {
		const monacoEntryPath = require.resolve("monaco-themes");
		const monacoPackageRoot = path.dirname(path.dirname(monacoEntryPath));
		candidates.push(path.join(monacoPackageRoot, "themes"));
	} catch {
		// Ignore and fall back to cwd resolution.
	}

	candidates.push(
		path.join(process.cwd(), "node_modules", "monaco-themes", "themes"),
	);

	for (const candidate of candidates) {
		if (existsSync(candidate)) {
			return candidate;
		}
	}

	throw new Error("Monaco themes directory not found on server.");
};

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ theme: string }> },
) {
	const { theme } = await params;
	const themesDir = getThemesDir();
	const themeListPath = path.join(themesDir, "themelist.json");
	const listPayload = await readFile(themeListPath, "utf-8");
	const themeList = JSON.parse(listPayload) as Record<string, string>;
	const themeLabel = themeList[theme];

	if (!themeLabel) {
		return new NextResponse("Theme not found", { status: 404 });
	}

	const themePath = path.join(themesDir, `${themeLabel}.json`);
	const themePayload = await readFile(themePath, "utf-8");

	return new NextResponse(themePayload, {
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, max-age=3600",
		},
	});
}
