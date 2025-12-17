#!/usr/bin/env bash
set -euo pipefail

# Generic Docker buildx script to build and run this repo in linux/amd64 regardless of Docker runtime (Desktop, Colima, etc.)

IMG=selenium-build:java8-amd64

if ! docker buildx version >/dev/null 2>&1; then
  echo "[ERROR] docker buildx is required. Install it (e.g., brew install docker-buildx) and retry." >&2
  exit 1
fi

echo "[INFO] Building linux/amd64 image: $IMG"
docker buildx build --platform linux/amd64 -f macOS_build.Dockerfile -t "$IMG" . --load

echo "[INFO] Running ./go maven-install with 24GB memory and host Maven cache mounted"
docker run --rm --platform linux/amd64 \
  --memory=24g --memory-swap=26g \
  -v "$PWD":/work -v "$HOME/.m2":/root/.m2 \
  -w /work "$IMG" \
  ./go maven-install || {
    echo "[WARN] Build failed. Retrying with constrained heap." >&2
    docker run --rm --platform linux/amd64 \
      --memory=24g --memory-swap=26g \
      -e BUCK_EXTRA_JAVA_ARGS="-Xmx1024m -XX:ReservedCodeCacheSize=128m -XX:MaxMetaspaceSize=256m" \
      -v "$PWD":/work -v "$HOME/.m2":/root/.m2 \
      -w /work "$IMG" \
      ./go maven-install
  }
