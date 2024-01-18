#!/bin/bash
echo "Building Selenium Manager binaries"
bazel build //dotnet/src/webdriver:manager-linux
bazel build //dotnet/src/webdriver:manager-windows
bazel build //dotnet/src/webdriver:manager-macos

echo "Building atoms"
bazel build //javascript/webdriver/atoms:get-attribute.js
bazel build //javascript/atoms/fragments:is-displayed.js
bazel build //javascript/atoms/fragments:find-elements.js

echo "Generating CDP code"
bazel build //dotnet/src/webdriver/cdp:generate-v85
bazel build //dotnet/src/webdriver/cdp:generate-v118
bazel build //dotnet/src/webdriver/cdp:generate-v119
bazel build //dotnet/src/webdriver/cdp:generate-v120
