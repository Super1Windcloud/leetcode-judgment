"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./ModeToggle";
import { UserAccountNav } from "./UserAccountNav";

interface NavbarActionsProps {
	className?: string;
}

export function NavbarActions({ className }: NavbarActionsProps) {
	const pathname = usePathname();
	const locale = useLocale();

	return (
		<div className={cn("flex items-center justify-end space-x-4", className)}>
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
	);
}
