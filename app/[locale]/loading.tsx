import {Card} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="relative min-h-screen bg-zinc-900 font-sans text-zinc-100 overflow-hidden">
            <main className="container relative mx-auto px-4 py-16 z-10">
                <div className="mx-auto max-w-5xl">
                    {/* Header Skeleton (matches ASCIIText + VariableProximity) */}
                    <div className="mb-16 text-center space-y-8">
                        <div className="relative h-32 w-full flex items-center justify-center">
                            <Skeleton className="h-20 w-3/4 bg-zinc-800/50"/>
                        </div>
                        <div className="mx-auto max-w-2xl min-h-[1.5em] flex justify-center">
                            <Skeleton className="h-6 w-full bg-zinc-800/50"/>
                        </div>
                    </div>

                    {/* Search & Filters Skeleton */}
                    <div className="space-y-8 mb-12">
                        <div className="flex justify-center w-full">
                            <Skeleton className="h-12 w-full max-w-2xl rounded-xl bg-zinc-800/50"/>
                        </div>

                        <div
                            className="flex flex-col md:flex-row gap-8 p-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
                            <div className="space-y-4 min-w-37.5">
                                <Skeleton className="h-4 w-16 bg-zinc-800/50"/>
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-24 bg-zinc-800/50"/>
                                    <Skeleton className="h-4 w-24 bg-zinc-800/50"/>
                                    <Skeleton className="h-4 w-24 bg-zinc-800/50"/>
                                </div>
                            </div>
                            <div className="space-y-4 flex-1">
                                <Skeleton className="h-4 w-16 bg-zinc-800/50"/>
                                <div className="flex flex-wrap gap-4">
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                        <Skeleton
                                            key={`tag-skel-${i}`}
                                            className="h-4 w-20 bg-zinc-800/50"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid Skeleton (matches ProblemList cards) */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <Card
                                key={`card-skel-${i}`}
                                className="h-52.5 border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <Skeleton className="h-8 w-8 rounded-full bg-zinc-800"/>
                                    <Skeleton className="h-6 w-16 rounded-md bg-zinc-800"/>
                                </div>

                                <Skeleton className="h-7 w-full mb-3 bg-zinc-800"/>
                                <Skeleton className="h-7 w-2/3 mb-4 bg-zinc-800"/>

                                <div className="flex gap-2">
                                    <Skeleton className="h-4 w-12 bg-zinc-800"/>
                                    <Skeleton className="h-4 w-16 bg-zinc-800"/>
                                    <Skeleton className="h-4 w-14 bg-zinc-800"/>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
