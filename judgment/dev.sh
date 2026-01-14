#!/bin/bash

# 编译本地 yargs 工具（判题核心需要它）
gcc -Wall -Werror -static yargs.c -o ./yargs_local

# 设置开发环境路径
# 我们将所有的判题资源指向当前项目的目录或自定义目录
export ATO_BASH_PATH=$(pwd)/setup/ATO/bash # 你需要确保本地有这个静态 bash
export ATO_YARGS_PATH=$(pwd)/yargs_local
export ATO_RUNNERS_PATH=$(pwd)/runners/
export ATO_ROOTFS_PATH=$(pwd)/dev_rootfs/
export ATO_ENV_PATH=$(pwd)/dev_env/
export ATO_BIND=0.0.0.0:8500

# 创建必要的开发目录
mkdir -p dev_rootfs dev_env

echo "--- 准备本地开发环境 ---"
echo "提示: 判题系统涉及 mount/unshare 等内核操作，必须使用 sudo 运行。"
echo "正在启动 Rust 后端..."

# 使用 sudo 运行，并保留当前环境变量
sudo -E cargo run
