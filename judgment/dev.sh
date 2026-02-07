#!/bin/bash

# 检查并尝试格式化代码
if [[ "$*" == *"--fmt"* ]]; then
    echo "--- 正在格式化代码 ---"
    
    # Rust
    if command -v cargo-fmt >/dev/null 2>&1; then
        echo "  -> 格式化 Rust 代码..."
        cargo fmt
    else
        echo "  [跳过] 未找到 cargo-fmt"
    fi

    # C / C++ / C#
    if command -v clang-format >/dev/null 2>&1; then
        echo "  -> 格式化 C/C++/C# 代码..."
        find . -maxdepth 1 -name "*.c" -o -name "*.cpp" -o -name "*.cs" | xargs -r clang-format -i
    else
        echo "  [跳过] 未找到 clang-format"
    fi

    # Java
    if command -v google-java-format >/dev/null 2>&1; then
        echo "  -> 格式化 Java 代码..."
        find . -name "*.java" | xargs -r google-java-format -i
    else
        echo "  [跳过] 未找到 google-java-format"
    fi

    # Go
    if command -v gofmt >/dev/null 2>&1; then
        echo "  -> 格式化 Go 代码..."
        find . -name "*.go" | xargs -r gofmt -w
    else
        echo "  [跳过] 未找到 gofmt"
    fi

    # PHP
    if command -v php-cs-fixer >/dev/null 2>&1; then
        echo "  -> 格式化 PHP 代码..."
        # 同步 Docker 中的参数：禁用缓存，非交互
        find . -name "*.php" | xargs -r php-cs-fixer fix --rules=@PSR12 --using-cache=no --no-interaction -q
    else
        echo "  [跳过] 未找到 php-cs-fixer"
    fi

    # Python
    if command -v black >/dev/null 2>&1; then
        echo "  -> 格式化 Python 代码..."
        find . -name "*.py" | xargs -r black --quiet
    else
        echo "  [跳过] 未找到 black"
    fi

    # Shell scripts (runners and dev.sh)
    if command -v shfmt >/dev/null 2>&1; then
        echo "  -> 格式化 Shell 脚本 (runners/* and dev.sh)..."
        shfmt -w dev.sh runners/*
    else
        echo "  [跳过] 未找到 shfmt"
    fi

    # JSON
    if command -v jq >/dev/null 2>&1; then
        echo "  -> 格式化 languages.json..."
        jq . languages.json > languages.json.tmp && mv languages.json.tmp languages.json
    else
        echo "  [跳过] 未找到 jq"
    fi

    # TypeScript/JavaScript (Biome)
    if [ -f "package.json" ]; then
        if command -v pnpm >/dev/null 2>&1; then
            echo "  -> 格式化 TS/JS 代码 (Biome)..."
            pnpm fix
        elif command -v npm >/dev/null 2>&1; then
            echo "  -> 格式化 TS/JS 代码 (Biome)..."
            npm run fix
        fi
    fi

    echo "--- 格式化完成 ---"
fi

# 检查必要的开发工具 (与 Dockerfile 保持同步)
MISSING_TOOLS=()
for tool in gcc cargo jq clang-format shfmt go google-java-format php-cs-fixer black; do
    if ! command -v $tool >/dev/null 2>&1; then
        MISSING_TOOLS+=("$tool")
    fi
done

if [ ${#MISSING_TOOLS[@]} -ne 0 ]; then
    echo "提示: 以下开发/格式化工具未安装: ${MISSING_TOOLS[*]}"
    echo "你可以运行以下命令安装基础工具 (Arch Linux):"
    echo "  sudo pacman -S base-devel rust jq clang shfmt go python-black php jre-openjdk-headless"
    echo ""
    echo "对于手动下载的工具，你可以运行: ./dev.sh --setup-fmt"
fi

# 自动安装/设置格式化工具
if [[ "$*" == *"--setup-fmt"* ]]; then
    echo "--- 正在设置格式化工具 ---"
    sudo pacman -S --needed --noconfirm jq clang shfmt go python-black php jdk17-openjdk
    
    if ! command -v php-cs-fixer >/dev/null 2>&1; then
        echo "正在下载 php-cs-fixer..."
        sudo curl -Lo /usr/local/bin/php-cs-fixer "https://github.com/PHP-CS-Fixer/PHP-CS-Fixer/releases/latest/download/php-cs-fixer.phar"
        sudo chmod a+x /usr/local/bin/php-cs-fixer
    fi

    if ! command -v google-java-format >/dev/null 2>&1; then
        echo "正在下载 google-java-format..."
        sudo mkdir -p /usr/local/share/google-java-format
        sudo curl -Lo /usr/local/share/google-java-format/google-java-format.jar "https://github.com/google/google-java-format/releases/download/v1.25.2/google-java-format-1.25.2-all-deps.jar"
        # 尝试定位 java 17
        JAVA_BIN="java"
        if [ -x "/usr/lib/jvm/java-17-openjdk/bin/java" ]; then
            JAVA_BIN="/usr/lib/jvm/java-17-openjdk/bin/java"
        fi
        printf "#!/bin/sh\nexec $JAVA_BIN \\
  --add-exports jdk.compiler/com.sun.tools.javac.api=ALL-UNNAMED \\
  --add-exports jdk.compiler/com.sun.tools.javac.file=ALL-UNNAMED \\
  --add-exports jdk.compiler/com.sun.tools.javac.parser=ALL-UNNAMED \\
  --add-exports jdk.compiler/com.sun.tools.javac.tree=ALL-UNNAMED \\
  --add-exports jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED \\
  --add-opens jdk.compiler/com.sun.tools.javac.code=ALL-UNNAMED \\
  --add-opens jdk.compiler/com.sun.tools.javac.comp=ALL-UNNAMED \\
  -jar /usr/local/share/google-java-format/google-java-format.jar \"\$@\"\n" | sudo tee /usr/local/bin/google-java-format > /dev/null
        sudo chmod a+x /usr/local/bin/google-java-format
    fi
    echo "--- 设置完成 ---"
fi

# 编译本地 yargs 工具（判题核心需要它）
gcc -Wall -Werror -static yargs.c -o ./yargs_local

# 创建并确保开发目录权限
mkdir -p dev_rootfs dev_env dev_overlay_upper
# 创建 overlayfs 必须的子目录 (JD, proc, dev, sys, tmp)
mkdir -p dev_overlay_upper/{JD,proc,dev,sys,tmp}

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
export JD_BASH_PATH=/bin/bash
export JD_YARGS_PATH=$(pwd)/yargs_local
export JD_RUNNERS_PATH=$(pwd)/runners/
export JD_ROOTFS_PATH=$(pwd)/dev_rootfs/
export JD_ENV_PATH=$(pwd)/dev_env/
export JD_OVERLAY_UPPER_PATH=$(pwd)/dev_overlay_upper/
export JD_USE_HOST_LIBS=1
# 使用双栈绑定，解决 localhost 访问慢的问题
# 提示: 如果使用系统 bash，沙箱内部需要访问 /lib 和 /lib64。
# 我们通过环境变量告诉后端，但在本地开发模式下，后端会自动处理基础映射。
# 如果执行仍然报错，请确保宿主机的 /bin/bash 对 ato 用户可执行。

export JD_BIND=[::]:8500
export JD_CGROUP_PATH=/sys/fs/cgroup

# 强制修复所有关键二进制文件和脚本的执行权限
echo "正在修复文件权限..."
chmod +x ./yargs_local 2>/dev/null || true
chmod +x runners/* 2>/dev/null || true

# 自动创建 rootfs 中 bash 依赖的挂载点（防止后端挂载失败）
# 注意：后端逻辑会把宿主机的 /lib 等挂载进去
for lang_dir in dev_rootfs/*; do
    if [ -d "$lang_dir" ]; then
        mkdir -p "$lang_dir/lib" "$lang_dir/lib64" "$lang_dir/usr/lib" "$lang_dir/bin"
    fi
done

echo "--- 准备本地开发环境 ---"
echo "使用系统 Bash (/bin/bash) 代替静态 Bash 以提高兼容性。"
echo "正在启动 Rust 后端 (使用 Stable)..."

# 使用 sudo 运行，并保留当前环境变量
sudo -E cargo run