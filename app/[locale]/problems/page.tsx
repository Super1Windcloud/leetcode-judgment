import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getProblems } from "@/lib/problems";

export default async function ProblemsPage({
	params,
	searchParams,
}: {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ page?: string }>;
}) {
	const { locale } = await params;
	const resolvedSearchParams = await searchParams;
	const page = Number(resolvedSearchParams.page) || 1;
	const { problems, totalPages } = await getProblems(page, 50, locale);

	return (
		<div className="container mx-auto py-10">
			<h1 className="text-3xl font-bold mb-6">Problems</h1>
			<div className="border rounded-md">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[100px]">Status</TableHead>
							<TableHead>Title</TableHead>
							<TableHead>Difficulty</TableHead>
							<TableHead>Tags</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{problems.map((problem) => (
							<TableRow key={problem.id}>
								<TableCell className="font-medium"></TableCell>
								<TableCell>
									<Link
										href={`/problems/${problem.slug}`}
										className="hover:underline font-medium"
									>
										{problem.id}. {problem.title}
									</Link>
								</TableCell>
								<TableCell>
									<Badge
										className={
											problem.difficulty === "Easy"
												? "bg-green-500 hover:bg-green-600 border-green-600"
												: problem.difficulty === "Medium"
													? "bg-yellow-500 hover:bg-yellow-600 border-yellow-600"
													: problem.difficulty === "Hard"
														? "bg-red-500 hover:bg-red-600 border-red-600"
														: "bg-gray-500"
										}
									>
										{problem.difficulty || "Unknown"}
									</Badge>
								</TableCell>
								<TableCell>
									<div className="flex gap-1 flex-wrap">
										{problem.tags?.slice(0, 3).map((tag) => (
											<Badge
												key={tag}
												variant="outline"
												className="text-xs text-muted-foreground"
											>
												{tag}
											</Badge>
										))}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<div className="mt-8">
				<Pagination>
					<PaginationContent>
						{page > 1 && (
							<PaginationItem>
								<PaginationPrevious href={`/problems?page=${page - 1}`} />
							</PaginationItem>
						)}

						<PaginationItem>
							<PaginationLink isActive>{page}</PaginationLink>
						</PaginationItem>

						{page < totalPages && (
							<PaginationItem>
								<PaginationNext href={`/problems?page=${page + 1}`} />
							</PaginationItem>
						)}
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
}
