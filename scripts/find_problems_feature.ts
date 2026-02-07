import fs from "node:fs/promises";
import {lstat} from "node:fs/promises";
import path from "node:path";

const languages = ["cpp", "java", "py", "js", "c", "cs", "go", "rs", "php", "ts", "md"];
const langSet = new Set(languages);

const ASSETS = path.join(process.cwd(), "assets");
const UNUSED = path.join(ASSETS, "unused");
// import {moveBack} from "@/utils";
// await moveBack(ASSETS, UNUSED);
// process.exit(0)

async function run() {
    let result = 0;
    try {
        await fs.mkdir(UNUSED, {recursive: true});
        const entries = await fs.readdir(ASSETS);

        for (const dir of entries) {
            // 重要：跳过 unused 目录本身，防止把自己移入自己
            if (dir === "unused") continue;

            const dirPath = path.join(ASSETS, dir);
            const dirStats = await lstat(dirPath);
            if (!dirStats.isDirectory()) continue;

            const files = await fs.readdir(dirPath);

            // 使用 Set 存储该目录下已有的语言后缀（自动去重）
            const seenLanguagesInDir = new Set<string>();

            for (const file of files) {
                const extension = file.split(".").pop() || '';

                // 如果这个后缀是我们关心的语言，就加入 Set
                if (langSet.has(extension)) {
                    seenLanguagesInDir.add(extension);
                }
            }

            // size 就是去重后的语言种类数量
            const currentCount = seenLanguagesInDir.size;

            if (currentCount < languages.length) {
                console.log(`未集齐: ${dir} (只有 ${currentCount} 种语言)`);
                const newPath = path.join(UNUSED, dir);
                if (dirPath === UNUSED) continue;
                try {
                    await fs.rename(dirPath, newPath);
                    result += 1;
                } catch (moveErr: any) {
                    console.error(`移动失败 ${dir}:`, moveErr.message);
                }
            }
        }
    } catch (err: any) {
        console.error("发生错误:", err.message);
    }
    console.log(`\n统计完成，共移动了 ${result} 个目录。`);
}

run();