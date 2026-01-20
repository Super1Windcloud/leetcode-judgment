#!/bin/bash

# 编译本地 yargs 工具（判题核心需要它）
gcc -Wall -Werror -static yargs.c -o ./yargs_local

# 创建并确保开发目录权限
mkdir -p dev_rootfs dev_env dev_overlay_upper
# 创建 overlayfs 必须的子目录 (ATO, proc, dev, sys, tmp)
mkdir -p dev_overlay_upper/{ATO,proc,dev,sys,tmp}

# 自动创建 languages.json 中定义的镜像目录和默认环境文件，防止挂载失败和警告
if [ -f "languages.json" ]; then
    echo "正在检查并创建缺失的语言镜像目录及环境文件..."
    python3 -c '
import json, os
with open("languages.json") as f:
    langs = json.load(f)
    for l in langs.values():
        img_path = l["image"].replace("/", "+").replace(":", "+")
        
        # 创建 rootfs 目录
        rootfs_path = os.path.join("dev_rootfs", img_path)
        if not os.path.exists(rootfs_path):
            print(f"  -> 创建缺失的 rootfs 目录: {rootfs_path}")
            os.makedirs(rootfs_path, exist_ok=True)
            
        # 创建默认 env 文件 (以 \0 分隔)
        env_path = os.path.join("dev_env", img_path)
        if not os.path.exists(env_path):
            print(f"  -> 创建缺失的 env 文件: {env_path}")
            with open(env_path, "wb") as f:
                f.write(b"PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\x00")
                f.write(b"LANG=C.UTF-8\x00")
'
fi

# 确保 bash 路径正确。
if [ ! -f "setup/bash" ]; then
    echo "提示: 未找到静态 bash (setup/bash)，正在尝试从 GitHub 下载..."
    mkdir -p setup
    if curl -L "https://github.com/attempt-this-online/static-bash/releases/download/5.2.0(1)-rc2/bash" -o "setup/bash"; then
        chmod +x setup/bash
        echo "  -> 静态 bash 下载成功。"
    else
        echo "警告: 静态 bash 下载失败，将回退使用系统 bash。这在大多数 Linux 系统上会导致 ENOENT 错误。"
    fi
fi

sudo chmod -R 777 dev_rootfs dev_env dev_overlay_upper 2>/dev/null || true

# 检查父目录权限。如果父目录不可读/不可执行，沙箱内部将无法访问代码目录
CURRENT_DIR=$(pwd)
while [ "$CURRENT_DIR" != "/" ]; do
    if [ ! -x "$CURRENT_DIR" ]; then
        echo "警告: 目录 $CURRENT_DIR 对其他用户不可执行。"
        echo "这可能导致沙箱内部报 EACCES 错误。建议运行: sudo chmod +x $CURRENT_DIR"
    fi
    CURRENT_DIR=$(dirname "$CURRENT_DIR")
done

# 设置开发环境路径
if [ -f "setup/bash" ]; then
    export ATO_BASH_PATH=$(pwd)/setup/bash
else
    export ATO_BASH_PATH=/bin/bash
fi

export ATO_YARGS_PATH=$(pwd)/yargs_local
export ATO_RUNNERS_PATH=$(pwd)/runners/
export ATO_ROOTFS_PATH=$(pwd)/dev_rootfs/
export ATO_ENV_PATH=$(pwd)/dev_env/
export ATO_OVERLAY_UPPER_PATH=$(pwd)/dev_overlay_upper/
# 使用双栈绑定，解决 localhost 访问慢的问题
export ATO_BIND=[::]:8500
export ATO_CGROUP_PATH=/sys/fs/cgroup

echo "--- 准备本地开发环境 ---"
echo "提示: 判题系统涉及 mount/unshare 等内核操作，必须使用 sudo 运行。"
echo "注意: 自动创建的 dev_rootfs 目录是空的。虽然这可以解决挂载错误，但执行代码时会因找不到编译器/解释器而失败。"
echo "正在启动 Rust 后端 (使用 Stable)..."

# 使用 sudo 运行，并保留当前环境变量
sudo -E cargo run