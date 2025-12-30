"use client";

import {useRef} from "react";
import ASCIIText from "@/components/ASCIIText";
import {ProblemList} from "@/components/ProblemList";
import VariableProximity from "@/components/VariableProximity";
import type {Problem} from "@/lib/problems";

interface HomePageClientProps {
    problems: Problem[];
    locale: string;
}

export default function HomePageClient({
                                           problems,
                                           locale,
                                       }: HomePageClientProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const subtitle =
        locale === "zh"
            ? "探索并精选编程挑战，掌握算法精髓。"
            : "Explore and master algorithms with our curated collection of programming challenges.";

    return (
        <main
            className="container relative mx-auto px-4 py-16 z-10"
            ref={containerRef}
        >

            <div className="mx-auto max-w-5xl">
                <div className="mb-16 text-center">
                    <div className="relative h-32 scale-150  w-full mb-4 flex items-center justify-center">
                        <ASCIIText
                            text={locale === "zh" ? "LeetCode 题库" : "LeetCode Problems"}
                            enableWaves={true}
                            asciiFontSize={3}
                        />
                    </div>
                    <div className="mx-auto max-w-2xl text-lg  cursor-pointer text-zinc-400 min-h-[1.5em]">
                        <VariableProximity
                            label={subtitle}
                            fromFontVariationSettings="'wght' 400, 'opsz' 9"
                            toFontVariationSettings="'wght' 900, 'opsz' 40"
                            containerRef={containerRef}
                            radius={100}
                            falloff="gaussian"
                            className={"cursor-pointer"}
                        />
                    </div>
                </div>

                <ProblemList initialProblems={problems} locale={locale}/>
            </div>
        </main>
    );
}
