#!/usr/bin/env bash
set -euo pipefail

IMAGE="registry.cn-hangzhou.aliyuncs.com/hanfangyuan/nextjs-template:main"

docker build -t "$IMAGE" .
docker push "$IMAGE"
