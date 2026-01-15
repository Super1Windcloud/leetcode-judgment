#!/bin/bash

# 编译本地 yargs 工具（判题核心需要它）
gcc -Wall -Werror -static yargs.c -o ./yargs_local

# 设置开发环境路径
export ATO_BASH_PATH=$(pwd)/setup/ATO/bash
export ATO_YARGS_PATH=$(pwd)/yargs_local
export ATO_RUNNERS_PATH=$(pwd)/runners/
export ATO_ROOTFS_PATH=$(pwd)/dev_rootfs/
export ATO_ENV_PATH=$(pwd)/dev_env/
export ATO_OVERLAY_UPPER_PATH=$(pwd)/dev_overlay_upper/
# 使用双栈绑定，解决 localhost 访问慢的问题
export ATO_BIND=[::]:8500
export ATO_CGROUP_PATH=/sys/fs/cgroup

# 创建并确保开发目录权限
mkdir -p dev_rootfs dev_env dev_overlay_upper
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

echo "--- 准备本地开发环境 ---"
echo "提示: 判题系统涉及 mount/unshare 等内核操作，必须使用 sudo 运行。"
echo "正在启动 Rust 后端 (使用 Stable)..."

# 使用 sudo 运行，并保留当前环境变量
sudo -E cargo run
