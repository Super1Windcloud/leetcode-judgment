# we need to ensure we have the same skopeo and containers-storage versions,
# but we want to build containers-storage in an independent stage from the final image.
# Adding a third "prep" stage breaks the cyclic dependency so the containers-storage build knows which version to use
FROM archlinux AS pin_skopeo
RUN pacman -Syu --noconfirm skopeo
FROM pin_skopeo AS build_deps
WORKDIR /tmp
RUN pacman -Syu --noconfirm go base-devel
RUN <<"EOF"
set -ex
SKOPEO_VERSION=$(pacman -Qe skopeo | cut -d' ' -f2 | cut -d- -f1)
STORAGE_VERSION=$(curl -L "https://github.com/containers/skopeo/raw/v$SKOPEO_VERSION/go.mod" | grep -F "go.podman.io/storage v" | cut -d'v' -f2)
curl -L "https://github.com/containers/container-libs/archive/storage/v$STORAGE_VERSION.tar.gz" | tar -xz
cd container-libs-storage-*/storage
make -j binary
mv containers-storage /

cd /tmp
curl -Lo bash.deb "https://ftp.debian.org/debian/pool/main/b/bash/bash-static_5.3-1_amd64.deb"
ar -x bash.deb data.tar.xz
tar -xJf data.tar.xz ./usr/bin/bash-static
mv usr/bin/bash-static /
EOF

FROM archlinux AS build
WORKDIR /tmp
RUN pacman -Syu --noconfirm base-devel go rustup && rustup install nightly
COPY yargs.c /tmp/
RUN gcc -Wall -Werror -static /tmp/yargs.c -o /yargs
COPY languages.json Cargo.toml Cargo.lock /tmp/
COPY src /tmp/src
COPY .cargo /tmp/.cargo
ARG CARGO_FLAGS=--release
RUN cargo build $CARGO_FLAGS && mv target/x86_64-unknown-linux-gnu/*/judgment /

FROM pin_skopeo

# install dependencies
RUN <<"EOF"
set -ex
pacman -Syu --noconfirm jq entr strace
curl -Lo /usr/local/bin/tini "https://github.com/krallin/tini/releases/download/v0.19.0/tini-amd64"
chmod +x /usr/local/bin/tini
mkdir /usr/local/lib/ATO
EOF
COPY --from=build_deps /bash-static /usr/local/lib/ATO/bash
COPY --from=build_deps /containers-storage /usr/local/bin/

# configure system
RUN <<"EOF"
mkdir -p /usr/local/share/ATO/overlayfs_upper/{ATO,proc,dev}
mkdir -p /usr/local/share/ATO/runners
ln -s /mnt/rootfs /usr/local/lib/ATO/rootfs
ln -s /mnt/env /usr/local/lib/ATO/env
useradd -U ato
EOF

COPY <<"EOF" /entrypoint.sh
#!/bin/sh
set -ex

GRAPH=/mnt/containers_storage
RUN=/run/containers/storage
STORAGE_BACKEND="containers-storage:[$GRAPH+$RUN]"

# 初始化目录（不删除已有内容）
mkdir -p /mnt/containers_storage /mnt/rootfs /mnt/env

echo "Checking for missing images..."
jq -r '.[].image' < /languages.json | sort -u > /tmp/required_images.txt

while read -r image; do
    image_pathsafe="$(echo "$image" | tr '/:' '+')"
    
    # 检查该镜像是否已经下载并生成了环境文件
    if [ -f "/mnt/env/$image_pathsafe" ]; then
        echo "Image $image already exists, skipping download."
    else
        echo "Downloading $image..."
        # skopeo copy 本身支持跳过已存在的层
        if skopeo copy --retry-times 3 docker://"$image" "$STORAGE_BACKEND$image"; then
            # 提取环境变量并作为“下载成功”的标志
            skopeo inspect "$STORAGE_BACKEND$image" \
              | jq --raw-output0 '.Env[]' > "/mnt/env/$image_pathsafe"
            echo "Successfully prepared $image"
        else
            echo "Failed to download $image, will retry on next start."
        fi
    fi
done < /tmp/required_images.txt

# 挂载逻辑
for image in $(cat /tmp/required_images.txt); do
    image_pathsafe="$(echo "$image" | tr '/:' '+')"
    # 只有下载成功的镜像才尝试挂载
    if [ -f "/mnt/env/$image_pathsafe" ]; then
        mountpoint=$(
            containers-storage --graph "$GRAPH" --run "$RUN" --storage-driver overlay \
              mount --read-only "$image"
        )
        mount --bind --mkdir -o ro=recursive "$mountpoint" /mnt/rootfs/"$image_pathsafe"
    fi
done

echo "all available images mounted"

# 确保 ato 用户有权访问数据
chown -R ato:ato /mnt

# 资源控制配置
mkdir -p /sys/fs/cgroup/server
echo "$$" > /sys/fs/cgroup/server/cgroup.procs
export ATO_CGROUP_PATH=/sys/fs/cgroup
echo +memory > "$ATO_CGROUP_PATH/cgroup.subtree_control"
chown -R ato:ato "$ATO_CGROUP_PATH"

mkdir -p /run/ATO
exec tini -- "$@"
EOF
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

COPY runners /usr/local/share/ATO/runners/
RUN chmod -R a+rx /usr/local/share/ATO/runners
COPY languages.json /
COPY --from=build /yargs /usr/local/lib/ATO/yargs
COPY --from=build /judgment /usr/local/lib/ATO/server

ENV ATO_BIND=0.0.0.0:8500
EXPOSE 8500
CMD setpriv --reuid ato --regid ato --init-groups /usr/local/lib/ATO/server
