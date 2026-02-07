import fs from "node:fs/promises";
import path from "node:path";


export async function moveBack(lastDir: string, currentDir: string) {
    let count = 0;
    try {
        const entries = await fs.readdir(currentDir);

        for (const entry of entries) {
            const oldPath = path.join(currentDir, entry);
            const newPath = path.join(lastDir, entry);

            try {
                // 2. 移动回上一级
                await fs.rename(oldPath, newPath);
                console.log(`已移回: ${entry}`);
                count++;
            } catch (moveErr: any) {
                console.error(`移动 ${entry} 失败:`, moveErr.message);
                // 常见失败原因：目标位置已存在同名目录
            }
        }

        console.log(`\n操作完成，成功移回 ${count} 个目录。`);


    } catch (err: any) {
        if (err.code === 'ENOENT') {
            console.error("错误：找不到 unused 目录。");
        } else {
            console.error("发生错误:", err.message);
        }
    }
}

