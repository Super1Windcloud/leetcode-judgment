import path from "node:path";
import fs from "fs/promises";
import {lstat} from "node:fs/promises";


const PROBLEMS = path.join(process.cwd(), "problems",);
const INCOMPLETE = path.join(PROBLEMS, "incomplete");


// const PROBLEMS = path.join(process.cwd(), "assets");
// const INCOMPLETE = path.join(PROBLEMS, "incomplete");
const languages = ["cpp", "java", "py", "js", "c", "cs", "go", "rs", "md", "php", "ts", 'json']
const langSet = new Set(languages);


async function cleanExtraFiles() {
    let deletedCount = 0;

    try {
        // 读取 problems 目录
        const dirs = await fs.readdir(PROBLEMS);

        for (const dir of dirs) {
            // 跳过归档目录和非目录文件
            if (dir === INCOMPLETE) continue;

            const dirPath = path.join(PROBLEMS, dir);
            const dirStats = await lstat(dirPath);
            if (!dirStats.isDirectory()) continue;

            // 读取子目录下的所有文件
            const files = await fs.readdir(dirPath);

            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const fileStats = await lstat(filePath);

                // 如果是子文件夹，可以根据需求决定是否递归，这里默认跳过文件夹
                if (fileStats.isDirectory()) continue;

                const extension = file.split(".").pop()?.toLowerCase() || '';

                // 核心判断：如果后缀不在白名单内，执行删除
                if (!langSet.has(extension)) {
                    try {
                        await fs.unlink(filePath);
                        console.log(`[已清理] ${dir}/${file}`);
                        deletedCount++;
                    } catch (err: any) {
                        console.error(`无法删除文件 ${file}:`, err.message);
                    }
                }
            }
        }
    } catch (err: any) {
        console.error("执行出错:", err.message);
    }

    console.log(`\n清理完成！共删除多余文件: ${deletedCount} 个。`);
}

cleanExtraFiles();

