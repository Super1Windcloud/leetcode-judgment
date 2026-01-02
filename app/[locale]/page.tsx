import { Footer } from "@/components/Footer";
import HomePageClient from "@/components/HomePageClient";
import { Navbar } from "@/components/Navbar";
import Squares from "@/components/Squares";
import { getProblems } from "@/lib/problems";

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const { problems } = await getProblems(1, 1000, locale);

	// 在服务端计算所有标签
	const allTags = Array.from(
		new Set(problems.flatMap((p) => p.tags || [])),
	).sort();

	return (
		<div className="relative min-h-screen bg-zinc-900  font-sans text-zinc-100 overflow-hidden flex flex-col">
			<Navbar />
			<div className="fixed inset-0 z-10">
				<Squares
					speed={0.5}
					squareSize={40}
					direction="diagonal"
					borderColor="rgba(147, 51, 234, 0.25)" // Dark Purple (Purple 600)
					hoverFillColor="rgba(147, 51, 234, 0.4)"
				/>
			</div>

			<HomePageClient problems={problems} allTags={allTags} locale={locale} />
			<Footer />
		</div>
	);
}
