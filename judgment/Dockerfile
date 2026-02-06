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
pacman -Syu --noconfirm jq entr strace clang go python-black rust
curl -Lo /usr/local/bin/tini "https://github.com/krallin/tini/releases/download/v0.19.0/tini-amd64"
chmod +x /usr/local/bin/tini
mkdir /usr/local/lib/JD
EOF
COPY --from=build_deps /bash-static /usr/local/lib/JD/bash
COPY --from=build_deps /containers-storage /usr/local/bin/

# configure system
RUN <<"EOF"
mkdir -p /usr/local/share/JD/overlayfs_upper/{JD,proc,dev}
mkdir -p /usr/local/share/JD/runners
ln -s /mnt/rootfs /usr/local/lib/JD/rootfs
ln -s /mnt/env /usr/local/lib/JD/env
useradd -U jd
EOF

COPY <<"EOF" /entrypoint.sh
#!/bin/sh
set -e

GRAPH=/mnt/containers_storage
RUN=/run/containers/storage
# 显式指定存储配置，确保一致性
CS_OPTS="--graph $GRAPH --run $RUN --storage-driver overlay"
STORAGE_BACKEND="containers-storage:[$GRAPH+$RUN]"

mkdir -p "$GRAPH" "$RUN" /mnt/rootfs /mnt/env

echo "Synchronizing languages and images..."
jq -r '.[].image' < /languages.json | sort -u > /tmp/images.txt

while read -r image; do
    image_pathsafe="$(echo "$image" | tr '/:' '+')"
    
    # 首先检查 containers-storage 是否已经知道这个镜像
    # 这比 skopeo 检查快得多，因为它不联网
    if containers-storage $CS_OPTS exists "$image" >/dev/null 2>&1 && [ -f "/mnt/env/$image_pathsafe" ]; then
        echo "Cache hit: $image is already in local storage."
    else
        echo "Cache miss: $image. Pulling from registry..."
        # skopeo 会自动利用已有的层（Blobs），实现断点续传
        if skopeo copy --retry-times 3 docker://"$image" "$STORAGE_BACKEND$image"; then
            skopeo inspect "$STORAGE_BACKEND$image" | jq --raw-output0 '.Env[]' > "/mnt/env/$image_pathsafe"
            echo "Successfully pulled $image"
        else
            echo "Failed to pull $image, will retry later."
            continue
        fi
    fi
done < /tmp/images.txt

echo "Images synchronized. Setting permissions..."
# 在挂载之前修改权限，确保 jd 用户可以读写这些基础文件
chown -R jd:jd /mnt
chmod -R 777 /mnt

echo "Mounting images..."
# 挂载逻辑
for image in $(cat /tmp/images.txt); do
    image_pathsafe="$(echo "$image" | tr '/:' '+')"
    mountpoint=$(containers-storage $CS_OPTS mount --read-only "$image")
    mount --bind --mkdir -o ro=recursive "$mountpoint" /mnt/rootfs/"$image_pathsafe"
done

echo "All available images are mounted and ready."

# 仅对挂载点目录本身进行非递归所有权修改
chown jd:jd /mnt /mnt/rootfs /mnt/containers_storage /mnt/env

mkdir -p /sys/fs/cgroup/server
echo "$$" > /sys/fs/cgroup/server/cgroup.procs
export JD_CGROUP_PATH=/sys/fs/cgroup
echo +memory > "$JD_CGROUP_PATH/cgroup.subtree_control"
chown -R jd:jd "$JD_CGROUP_PATH"

mkdir -p /run/JD
exec tini -- "$@"
EOF
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

COPY runners /usr/local/share/JD/runners/
RUN chmod -R a+rx /usr/local/share/JD/runners
COPY languages.json /
COPY --from=build /yargs /usr/local/lib/JD/yargs
COPY --from=build /judgment /usr/local/lib/JD/server

ENV JD_BIND=0.0.0.0:8500
EXPOSE 8500
CMD setpriv --reuid jd --regid jd --init-groups /usr/local/lib/JD/server
