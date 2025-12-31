"use client";

import { useTranslations } from "next-intl";
import GlassSurface from "@/components/GlassSurface";
import GradientText from "@/components/GradientText";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { NavbarActions } from "./NavbarActions";

export function Navbar() {
	const t = useTranslations("Navigation");
	const commonT = useTranslations("Common");
	const pathname = usePathname();

	const navItems = [
		{ href: "/", label: t("home") },
		{ href: "/create", label: t("create") },
		{ href: "/dashboard", label: t("dashboard") },
		{ href: "/integration-demo", label: t("integration") },
		{ href: "/about", label: t("about") },
	];

	return (
		<header className="sticky top-0 z-50 w-full animate-slide-down border-none">
			<GlassSurface
				width="100%"
				height="64px"
				borderRadius={0}
				borderWidth={0}
				opacity={0}
				blur={0}
				className="border-none"
			>
				<div className="container mx-auto flex h-full items-center px-4">
					<div className="mr-30  flex items-center space-x-2 scale-150 ">
						<Link href="/" className="flex items-center space-x-2 group">
							<GradientText
								showBorder={false}
								animationSpeed={3}
								className="bg-transparent"
							>
								{commonT("logo")}
							</GradientText>
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
					<NavbarActions />
				</div>
			</GlassSurface>
		</header>
	);
}
