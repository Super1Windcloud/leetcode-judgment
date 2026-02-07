import fs from "fs/promises";
import {lstat, mkdir} from "node:fs/promises";
import {dirname} from "path";

const languages = ["cpp", "java", "py", "js", "c", "cs", "go", "rs", "md", "php", "ts"]
const entrys = await fs.readdir("./problems");


entrys.forEach(async entry => {
    const childDirs = await fs.readdir(`./problems/${entry}`);
    let count = 0;
    for (const childDir of childDirs) {
        const path = `./problems/${entry}/${childDir}`;
        const stats = await lstat(path);
        if (stats.isFile()) {
            const extension = path.split(".").pop() || '';

            if (languages.includes(extension)) {
                count++;
            }

        }
    }
    if (count < languages.length) {
        console.log(`./problems/${entry}`)
        const newPath = `./problems/incomplete/${entry}`
        await mkdir(dirname(newPath), {recursive: true});
        await fs.rename(`./problems/${entry}`, newPath)
    }
})

