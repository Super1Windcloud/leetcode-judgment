import { readFile } from "node:fs/promises";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const THEMES_DIR = path.join(
	process.cwd(),
	"node_modules",
	"monaco-themes",
	"themes",
);
const THEME_LIST_PATH = path.join(THEMES_DIR, "themelist.json");

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ theme: string }> },
) {
	const { theme } = await params;
	const listPayload = await readFile(THEME_LIST_PATH, "utf-8");
	const themeList = JSON.parse(listPayload) as Record<string, string>;
	const themeLabel = themeList[theme];

	if (!themeLabel) {
		return new NextResponse("Theme not found", { status: 404 });
	}

	const themePath = path.join(THEMES_DIR, `${themeLabel}.json`);
	const themePayload = await readFile(themePath, "utf-8");

	return new NextResponse(themePayload, {
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, max-age=3600",
		},
	});
}
