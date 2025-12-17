# Selenium build container for running `./go maven-install`
# Base with Java 8 JDK

# Rationale for Ubuntu 18.04:
# - This repository's legacy build requires BOTH Java 8 JDK and Python 2.7.
# - Ubuntu 18.04 provides clean apt packages for openjdk-8-jdk and python2.7,
#   avoiding extra repos or custom provisioning required on newer Ubuntu versions.

# Notes:
# - If your Docker runtime host is arm64 but you need to build amd64 images (buck.pex requires x86_64),
#   use docker buildx to build with --platform linux/amd64 and run with --platform linux/amd64.

FROM ubuntu:18.04

ENV DEBIAN_FRONTEND=noninteractive

# Install prerequisites: OpenJDK 8, Python 2.7 (for buckw), python-requests (for buckw download), git, zip, unzip, curl
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       openjdk-8-jdk \
       python2.7 \
       python-requests \
       git \
       zip \
       unzip \
       curl \
    && ln -sf /usr/bin/python2.7 /usr/bin/python \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set Java 8 as default
# Create a stable JAVA_HOME symlink regardless of architecture (amd64/arm64)
RUN arch=$(dpkg --print-architecture) \
    && if [ -d "/usr/lib/jvm/java-8-openjdk-$arch" ]; then ln -s "/usr/lib/jvm/java-8-openjdk-$arch" /usr/lib/jvm/java-8-openjdk; fi
ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk
ENV PATH="$JAVA_HOME/bin:${PATH}"

# Preconfigure git safe.directory for the mounted repo path to avoid 'dubious ownership' errors
RUN git config --system --add safe.directory /work || true

# Default workdir where repository will be mounted at runtime
WORKDIR /work
