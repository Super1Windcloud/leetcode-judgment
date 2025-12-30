"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./ModeToggle";
import { UserAccountNav } from "./UserAccountNav";

export function Navbar() {
	const t = useTranslations("Navigation");
	const commonT = useTranslations("Common");
	const pathname = usePathname();
	const locale = useLocale();

	const navItems = [
		{ href: "/", label: t("home") },
		{ href: "/dashboard", label: t("dashboard") },
		{ href: "/integration-demo", label: t("integration") },
	];

	return (
		<header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 animate-slide-down">
			<div className="container mx-auto flex h-16 items-center px-4">
				<div className="mr-8 flex items-center space-x-2">
					<Link href="/" className="flex items-center space-x-2 group">
						<span className="text-xl font-bold bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-size-[200%_auto] animate-shimmer bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
							{commonT("logo")}
						</span>
					</Link>
				</div>

				<nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
					{navItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"relative py-1 transition-colors hover:text-primary group",
								pathname === item.href
									? "text-primary font-semibold"
									: "text-muted-foreground",
							)}
						>
							{item.label}
							<span
								className={cn(
									"absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full",
									pathname === item.href && "w-full",
								)}
							/>
						</Link>
					))}
				</nav>

				<div className="flex items-center justify-end space-x-4">
					<div className="flex items-center space-x-1 mr-2 border-r pr-4">
						<Link
							href={pathname}
							locale="en"
							className={cn(
								"text-[10px] px-2 py-1 rounded-md transition-all border border-transparent",
								locale === "en"
									? "bg-primary/10 border-primary/20 font-bold text-primary shadow-xs"
									: "text-muted-foreground hover:bg-accent",
							)}
						>
							EN
						</Link>
						<Link
							href={pathname}
							locale="zh"
							className={cn(
								"text-[10px] px-2 py-1 rounded-md transition-all border border-transparent",
								locale === "zh"
									? "bg-primary/10 border-primary/20 font-bold text-primary shadow-xs"
									: "text-muted-foreground hover:bg-accent",
							)}
						>
							中
						</Link>
					</div>
					<ModeToggle />
					<UserAccountNav />
				</div>
			</div>
			{/* Animated Border Layers */}
			<div className="absolute bottom-0 left-0 h-px w-full bg-border" />
			<div className="absolute bottom-0 left-0 h-0.5 w-full bg-linear-to-r from-transparent via-primary/80 to-transparent bg-size-[200%_auto] animate-shimmer opacity-40 blur-[0.5px]" />
			<div className="absolute bottom-px left-0 h-px w-full bg-linear-to-r from-transparent via-primary/40 to-transparent bg-size-[200%_auto] animate-shimmer" />
		</header>
	);
}
