import { Github, Globe, Mail, Twitter } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Squares from "@/components/Squares";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "About" });

	return {
		title: t("title"),
		description: t("description"),
	};
}

export default async function AboutPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "About" });

	return (
		<div className="relative min-h-screen bg-zinc-900 font-sans text-zinc-100 overflow-hidden">
			<div className="fixed inset-0 z-0">
				<Squares
					speed={0.3}
					squareSize={40}
					direction="diagonal"
					borderColor="rgba(147, 51, 234, 0.15)"
					hoverFillColor="rgba(147, 51, 234, 0.2)"
				/>
			</div>

			<main className="container relative mx-auto px-4 py-20 z-10">
				<div className="max-w-4xl mx-auto space-y-12">
					{/* Project Section */}
					<section className="space-y-6">
						<div className="text-center space-y-4">
							<Badge
								variant="outline"
								className="border-purple-500/50 text-purple-400 px-4 py-1"
							>
								{t("projectBadge")}
							</Badge>
							<h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
								{t("projectTitle")}
							</h1>
							<p className="text-xl text-zinc-400 max-w-2xl mx-auto">
								{t("projectDescription")}
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
							<Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-md">
								<CardHeader>
									<CardTitle className="text-xl text-purple-400">
										{t("techStackTitle")}
									</CardTitle>
								</CardHeader>
								<CardContent className="flex flex-wrap gap-2">
									{[
										"Next.js 16",
										"React 19",
										"Tailwind v4",
										"TypeScript",
										"Shadcn UI",
										"Framer Motion",
										"Three.js",
									].map((tech) => (
										<Badge
											key={tech}
											variant="secondary"
											className="bg-zinc-800 text-zinc-300"
										>
											{tech}
										</Badge>
									))}
								</CardContent>
							</Card>
							<Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-md">
								<CardHeader>
									<CardTitle className="text-xl text-purple-400">
										{t("featuresTitle")}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2 text-zinc-400 text-sm">
										<li>• {t("feature1")}</li>
										<li>• {t("feature2")}</li>
										<li>• {t("feature3")}</li>
										<li>• {t("feature4")}</li>
									</ul>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Author Section */}
					<section className="pt-12 border-t border-zinc-800">
						<div className="flex flex-col md:flex-row items-center gap-8">
							<div className="relative group">
								<div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
								<div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-2 border-zinc-800">
									<Image
										src="https://github.com/Super1Windcloud.png"
										alt="Author"
										fill
										className="object-cover"
									/>
								</div>
							</div>

							<div className="flex-1 text-center md:text-left space-y-4">
								<h2 className="text-3xl font-bold">{t("authorName")}</h2>
								<p className="text-zinc-400 leading-relaxed">
									{t("authorBio")}
								</p>

								<div className="flex justify-center md:justify-start gap-4">
									<a
										href="https://github.com/Super1Windcloud"
										target="_blank"
										rel="noopener noreferrer"
										className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300"
									>
										<Github className="w-5 h-5" />
									</a>
									<a
										href="https://twitter.com"
										target="_blank"
										rel="noopener noreferrer"
										className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300"
									>
										<Twitter className="w-5 h-5" />
									</a>
									<a
										href="https://github.com/Super1Windcloud"
										target="_blank"
										rel="noopener noreferrer"
										className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300"
									>
										<Globe className="w-5 h-5" />
									</a>
									<a
										href="mailto:contact@example.com"
										className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300"
									>
										<Mail className="w-5 h-5" />
									</a>
								</div>
							</div>
						</div>
					</section>
				</div>
			</main>
		</div>
	);
}
