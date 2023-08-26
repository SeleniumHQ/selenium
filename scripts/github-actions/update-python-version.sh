#!/usr/bin/env bash
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


# Go to python dir
cd "$(dirname "$0")"/../../py

# Get SE_VERSION from version.py
# example - SE_VERSION = "4.11.1"
SE_VERSION=$(awk -F\" '/SE_VERSION =/ {print $2}' version.py)

# example - 4.11.1
RELEASE_VERSION=$(echo "$SE_VERSION" | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+')

# example - 4.12.0
NEW_VERSION=$(echo "$RELEASE_VERSION" | awk -F. '{print $1"."$2+1".0"}')

# example - 4.12.0.nightly.20230824
NIGHTLY_VERSION="$NEW_VERSION.nightly.$(date +%Y%m%d)"

# would prefer to use sed -i but awk is more portable
# Replace version in py/version.py
awk -v new_version="$NIGHTLY_VERSION" '/SE_VERSION =/ && !found { sub(/SE_VERSION = "[0-9]+\.[0-9]+\.[0-9]+"/, "SE_VERSION = \"" new_version "\""); found = 1 } { print }' version.py > tmp.txt && mv tmp.txt version.py

# Replace SE_VERSION in py/BUILD.bazel
awk -v new_version="$NIGHTLY_VERSION" '/SE_VERSION =/ && !found { sub(/SE_VERSION = "[0-9]+\.[0-9]+\.[0-9]+"/, "SE_VERSION = \"" new_version "\""); found = 1 } { print }' BUILD.bazel > tmp.txt && mv tmp.txt BUILD.bazel

# Replace selenium-#.#.#.tar.gz with selenium-RELEASE_VERSION.tar.gz in docs/source/index.rst
awk -v new_version="$NIGHTLY_VERSION" '/selenium-[0-9]+\.[0-9]+\.[0-9]+\.tar\.gz/ && !found { sub(/selenium-[0-9]+\.[0-9]+\.[0-9]+\.tar\.gz/, "selenium-" new_version ".tar.gz"); found = 1 } { print }' docs/source/index.rst > tmp.txt && mv tmp.txt docs/source/index.rst

# Set NEW_VERSION_EXTRAS for use in github actions
echo "NIGHTLY_VERSION=$NIGHTLY_VERSION" >> $GITHUB_ENV
