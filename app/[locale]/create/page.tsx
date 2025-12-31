'use client';

import { Plus, Send, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import Squares from "@/components/Squares";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface TestCase {
	id: string;
	input: string;
	output: string;
}

export default function CreateProblemPage() {
	const t = useTranslations("CreateProblem");
	const [activeTab, setActiveTab] = useState("basic");

	const [formData, setFormData] = useState({
		title: "",
		difficulty: "Medium",
		tags: "",
		content: "",
		solution: "",
		testCases: [
			{ id: crypto.randomUUID(), input: "", output: "" },
		] as TestCase[],
	});

	const addTestCase = () => {
		setFormData({
			...formData,
			testCases: [
				...formData.testCases,
				{ id: crypto.randomUUID(), input: "", output: "" },
			],
		});
	};

	const removeTestCase = (id: string) => {
		if (formData.testCases.length === 1) return;
		setFormData({
			...formData,
			testCases: formData.testCases.filter((tc) => tc.id !== id),
		});
	};

	const updateTestCase = (
		id: string,
		field: keyof Omit<TestCase, "id">,
		value: string,
	) => {
		setFormData({
			...formData,
			testCases: formData.testCases.map((tc) =>
				tc.id === id ? { ...tc, [field]: value } : tc,
			),
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// In a real app, you would save to Supabase here
		console.log("Submitting problem:", formData);

		toast.success(t("success"));
		// Reset or redirect
	};

	return (
		<div className="relative min-h-screen bg-zinc-900 font-sans text-zinc-100 overflow-hidden pb-20">
			<div className="fixed inset-0 z-0">
				<Squares
					speed={0.2}
					squareSize={40}
					direction="diagonal"
					borderColor="rgba(147, 51, 234, 0.1)"
					hoverFillColor="rgba(147, 51, 234, 0.15)"
				/>
			</div>

			<main className="container relative mx-auto px-4 py-16 z-10 max-w-4xl">
				<div className="space-y-8">
					<div className="space-y-2">
						<h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
						<p className="text-zinc-400">{t("description")}</p>
					</div>

					<form onSubmit={handleSubmit}>
						<Tabs
							value={activeTab}
							onValueChange={setActiveTab}
							className="w-full"
						>
							<TabsList className="grid w-full grid-cols-4 bg-zinc-800/50 border border-zinc-700">
								<TabsTrigger value="basic">{t("basicInfo")}</TabsTrigger>
								<TabsTrigger value="content">{t("content")}</TabsTrigger>
								<TabsTrigger value="testcases">{t("testCases")}</TabsTrigger>
								<TabsTrigger value="solution">{t("solution")}</TabsTrigger>
							</TabsList>

							<Card className="mt-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-md">
								<CardContent className="pt-6">
									{/* Basic Info Tab */}
									<TabsContent value="basic" className="space-y-6 mt-0">
										<div className="space-y-4">
											<div className="grid gap-2">
												<Label htmlFor="title">{t("problemTitle")}</Label>
												<Input
													id="title"
													placeholder="Two Sum"
													className="bg-zinc-800/50 border-zinc-700"
													value={formData.title}
													onChange={(e) =>
														setFormData({ ...formData, title: e.target.value })
													}
													required
												/>
											</div>

											<div className="grid md:grid-cols-2 gap-4">
												<div className="grid gap-2">
													<Label htmlFor="difficulty">{t("difficulty")}</Label>
													<Select
														value={formData.difficulty}
														onValueChange={(val) =>
															setFormData({ ...formData, difficulty: val })
														}
													>
														<SelectTrigger className="bg-zinc-800/50 border-zinc-700">
															<SelectValue />
														</SelectTrigger>
														<SelectContent className="bg-zinc-800 border-zinc-700">
															<SelectItem value="Easy">Easy / 简单</SelectItem>
															<SelectItem value="Medium">
																Medium / 中等
															</SelectItem>
															<SelectItem value="Hard">Hard / 困难</SelectItem>
														</SelectContent>
													</Select>
												</div>

												<div className="grid gap-2">
													<Label htmlFor="tags">{t("tags")}</Label>
													<Input
														id="tags"
														placeholder="Array, Hash Table"
														className="bg-zinc-800/50 border-zinc-700"
														value={formData.tags}
														onChange={(e) =>
															setFormData({ ...formData, tags: e.target.value })
														}
													/>
												</div>
											</div>
										</div>
										<div className="flex justify-end">
											<Button
												type="button"
												onClick={() => setActiveTab("content")}
											>
												Next
											</Button>
										</div>
									</TabsContent>

									{/* Content Tab */}
									<TabsContent value="content" className="space-y-4 mt-0">
										<div className="grid gap-2">
											<Label htmlFor="content">{t("contentLabel")}</Label>
											<Textarea
												id="content"
												placeholder="Given an array of integers nums and an integer target..."
												className="min-h-[300px] bg-zinc-800/50 border-zinc-700 font-mono text-sm"
												value={formData.content}
												onChange={(e) =>
													setFormData({ ...formData, content: e.target.value })
												}
												required
											/>
										</div>
										<div className="flex justify-between">
											<Button
												type="button"
												variant="outline"
												onClick={() => setActiveTab("basic")}
											>
												Previous
											</Button>
											<Button
												type="button"
												onClick={() => setActiveTab("testcases")}
											>
												Next
											</Button>
										</div>
									</TabsContent>

									{/* Test Cases Tab */}
									<TabsContent value="testcases" className="space-y-6 mt-0">
										<div className="space-y-4">
											{formData.testCases.map((tc) => (
												<div
													key={tc.id}
													className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/30 space-y-4 relative"
												>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="absolute top-2 right-2 text-zinc-500 hover:text-rose-500"
														onClick={() => removeTestCase(tc.id)}
														disabled={formData.testCases.length === 1}
													>
														<Trash2 className="w-4 h-4" />
													</Button>

													<div className="grid md:grid-cols-2 gap-4">
														<div className="grid gap-2">
															<Label className="text-xs text-zinc-500">
																{t("testCaseInput")}
															</Label>
															<Textarea
																className="min-h-[80px] bg-zinc-800/50 border-zinc-700 font-mono text-xs"
																value={tc.input}
																onChange={(e) =>
																	updateTestCase(tc.id, "input", e.target.value)
																}
															/>
														</div>
														<div className="grid gap-2">
															<Label className="text-xs text-zinc-500">
																{t("testCaseOutput")}
															</Label>
															<Textarea
																className="min-h-[80px] bg-zinc-800/50 border-zinc-700 font-mono text-xs"
																value={tc.output}
																onChange={(e) =>
																	updateTestCase(
																		tc.id,
																		"output",
																		e.target.value,
																	)
																}
															/>
														</div>
													</div>
												</div>
											))}
											<Button
												type="button"
												variant="outline"
												className="w-full border-dashed border-zinc-700 hover:border-zinc-500"
												onClick={addTestCase}
											>
												<Plus className="w-4 h-4 mr-2" />
												{t("addTestCase")}
											</Button>
										</div>
										<div className="flex justify-between">
											<Button
												type="button"
												variant="outline"
												onClick={() => setActiveTab("content")}
											>
												Previous
											</Button>
											<Button
												type="button"
												onClick={() => setActiveTab("solution")}
											>
												Next
											</Button>
										</div>
									</TabsContent>

									{/* Solution Tab */}
									<TabsContent value="solution" className="space-y-4 mt-0">
										<div className="grid gap-2">
											<Label htmlFor="solution">{t("solutionLabel")}</Label>
											<Textarea
												id="solution"
												placeholder="class Solution: ..."
												className="min-h-[300px] bg-zinc-800/50 border-zinc-700 font-mono text-sm"
												value={formData.solution}
												onChange={(e) =>
													setFormData({ ...formData, solution: e.target.value })
												}
											/>
										</div>
										<div className="flex justify-between pt-4">
											<Button
												type="button"
												variant="outline"
												onClick={() => setActiveTab("testcases")}
											>
												Previous
											</Button>
											<div className="flex gap-2">
												<Button
													type="submit"
													className="bg-purple-600 hover:bg-purple-700"
												>
													<Send className="w-4 h-4 mr-2" />
													{t("submit")}
												</Button>
											</div>
										</div>
									</TabsContent>
								</CardContent>
							</Card>
						</Tabs>
					</form>
				</div>
			</main>
		</div>
	);
}
