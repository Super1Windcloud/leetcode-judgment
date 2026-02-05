import {getProblems, PaginatedProblems, Problem} from "@/lib/problems";
import fs from "node:fs";

// 1. 获取大数据量作为后备池
const allData = await getProblems(1, 300, "en");
const pool = allData.problems;


function getAllTags() {
    const tags = new Set();
    allData.problems.map(p => {
        p.tags?.forEach(tag => tags.add(tag));
    })
    console.log(tags.size);
}

function getSmartCollection(allProblems: Problem[]) {
    const finalProblemsMap = new Map<string, Problem>(); // 使用 Map 方便通过 ID 去重
    const tagCounts: Record<string, number> = {};

    // 1. 获取所有存在的 Tag 列表
    const allTags = new Set<string>();
    allProblems.forEach(p => p.tags?.forEach(t => allTags.add(t)));

    // 2. 核心逻辑：遍历每个 Tag，尝试抓取 2 题
    allTags.forEach(tag => {
        let countForThisTag = 0;

        for (const p of allProblems) {
            if (countForThisTag >= 2) break; // 每个 Tag 最多拿 2 个

            if (p.tags?.includes(tag)) {
                finalProblemsMap.set(p.id.toString(), p);
                countForThisTag++;
            }
        }
    });

    // 3. 补全难度（确保 Easy, Medium, Hard 至少各有一个）
    let finalArray = Array.from(finalProblemsMap.values());
    const difficulties = ['Easy', 'Medium', 'Hard'];

    difficulties.forEach(diff => {
        const hasDiff = finalArray.some(p => p.difficulty === diff);
        if (!hasDiff) {
            const found = allProblems.find(p => p.difficulty === diff);
            if (found) finalArray.push(found);
        }
    });

    return finalArray;
}

const finalSelection = getSmartCollection(pool);

const titles = finalSelection.map(p => p.title);
const entries = await fs.promises.readdir("assets", {withFileTypes: true});
entries.forEach(entry => {
    const name = entry.name.split(".").at(1) || '';
    if (titles.includes(name)) {
        fs.promises.cp(`assets/${entry.name}`, `problems/${name}`, {
            recursive: true
        });
    }
})