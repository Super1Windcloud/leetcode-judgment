import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { language, code } = await req.json();

		if (!language || typeof code !== "string") {
			return NextResponse.json(
				{ error: "Language and code are required" },
				{ status: 400 },
			);
		}

		// Determine backend URL
		// Default to localhost:8500 if not set (for local dev where judgment runs on host)
		// In Docker, JUDGMENT_API_URL should be set to "http://judgment:8500" or similar.
		const judgmentUrl = process.env.JUDGMENT_API_URL || "http://localhost:8500";
		const apiUrl = `${judgmentUrl.replace(/\/$/, "")}/api/format`;

		try {
			const backendRes = await fetch(apiUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ language, code }),
			});

			if (!backendRes.ok) {
				throw new Error(`Backend returned ${backendRes.status}`);
			}

			const data = await backendRes.json();
			return NextResponse.json(data);
		} catch (fetchError) {
			console.error(
				"Failed to connect to judgment backend for formatting:",
				fetchError,
			);
			// Fallback or error
			return NextResponse.json(
				{ error: "Formatting service unavailable" },
				{ status: 503 },
			);
		}
	} catch (error) {
		console.error("Format API Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
