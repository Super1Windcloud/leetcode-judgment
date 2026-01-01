import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const require = createRequire(import.meta.url);
const MONACO_ENTRY_PATH = require.resolve("monaco-themes");
const MONACO_PACKAGE_ROOT = path.dirname(path.dirname(MONACO_ENTRY_PATH));
const THEME_LIST_PATH = path.join(
	MONACO_PACKAGE_ROOT,
	"themes",
	"themelist.json",
);

export async function GET() {
	const payload = await readFile(THEME_LIST_PATH, "utf-8");

	return new NextResponse(payload, {
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, max-age=3600",
		},
	});
}
