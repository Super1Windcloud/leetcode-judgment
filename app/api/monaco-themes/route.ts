import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const THEME_LIST_PATH = path.join(
	process.cwd(),
	"node_modules",
	"monaco-themes",
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
