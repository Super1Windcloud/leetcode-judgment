import HomePageClient from "@/components/HomePageClient";
import Squares from "@/components/Squares";
import {getProblems} from "@/lib/problems";

export default async function Home({
                                       params,
                                   }: {
    params: Promise<{ locale: string }>;
}) {
    const {locale} = await params;
    const {problems} = await getProblems(1, 100, locale);

    return (
        <div className="relative min-h-screen bg-zinc-900  font-sans text-zinc-100 overflow-hidden">
            <div className="fixed inset-0 z-10">
                <Squares
                    speed={0.5}
                    squareSize={40}
                    direction="diagonal"
                    borderColor="rgba(147, 51, 234, 0.25)" // Dark Purple (Purple 600)
                    hoverFillColor="rgba(147, 51, 234, 0.4)"
                />
            </div>

            <HomePageClient problems={problems} locale={locale}/>
        </div>
    );
}
