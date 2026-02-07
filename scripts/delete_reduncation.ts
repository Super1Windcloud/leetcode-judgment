import fs from "node:fs/promises";
import {lstat} from "node:fs/promises";
import path from "node:path";

// const ASSETS = path.join(process.cwd(), "assets");
// const UNUSED = path.join(ASSETS, "unused");
const ASSETS = path.join(process.cwd(), "problems",);
const UNUSED = path.join(ASSETS, "incomplete");

// import {moveBack} from "@/utils";
// await moveBack( path.join(process.cwd(), "problems") , INCOMPLETE );
// process.exit(0);

async function moveSolution2Dirs() {
    let result = 0;
    try {
        // 1. 确保目标 unused 目录存在
        await fs.mkdir(UNUSED, {recursive: true});

        const entries = await fs.readdir(ASSETS);

        for (const dir of entries) {
            // 跳过 unused 目录本身和非目录文件
            if (dir === "unused" || dir === "incomplete") continue;

            const dirPath = path.join(ASSETS, dir);
            const dirStats = await lstat(dirPath);
            if (!dirStats.isDirectory()) continue;

            const files = await fs.readdir(dirPath);

            // 检查是否存在以 Solution2. 开头的文件
            const hasSolution2 = files.some(file => file.startsWith("Solution2."));

            if (hasSolution2) {
                const newPath = path.join(UNUSED, dir);

                try {
                    // 移动目录
                    await fs.rename(dirPath, newPath);
                    console.log(`已移动目录 (含 Solution2): ${dir}`);
                    result += 1;
                } catch (moveErr: any) {
                    console.error(`移动失败 ${dir}:`, moveErr.message);
                }
            }
        }
    } catch (err: any) {
        console.error("发生错误:", err.message);
    }
    console.log(`\n统计完成，共移动了 ${result} 个含有 Solution2 文件的目录。`);
}

moveSolution2Dirs();