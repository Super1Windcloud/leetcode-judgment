"use client";

import type React from "react";
import { usePathname } from "@/i18n/routing";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function LayoutShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	// Check if we are on a problem detail page (e.g., /problems/0001.Two-Sum)
	// The pattern is typically /problems/[slug]
	// Note: pathname from i18n/routing might or might not include the locale depending on config.
	// We'll check if it matches the detail page pattern.
	const isProblemDetailPage =
		pathname.includes("/problems/") &&
		pathname.split("/").filter(Boolean).length >= 2;

	if (isProblemDetailPage) {
		return <main className="flex-1">{children}</main>;
	}

	return (
		<>
			<Navbar />
			<main className="flex-1">{children}</main>
			<Footer />
		</>
	);
}
