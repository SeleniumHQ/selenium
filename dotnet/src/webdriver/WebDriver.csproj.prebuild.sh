#!/bin/bash
if [[ ! -f "$1../../../bazel-bin/javascript/webdriver/atoms/get-attribute.js" ]]
then
  echo "Building getAttribute atom"
  bazel build //javascript/webdriver/atoms:get-attribute.js
fi

if [[ ! -f "$1../../../bazel-bin/javascript/atoms/fragments/is-displayed.js" ]]
then
  echo "Building isDisplayed atom"
  bazel build //javascript/atoms/fragments:is-displayed.js
fi

if [[ ! -f "$1../../../bazel-bin/javascript/atoms/fragments/find-elements.js" ]]
then
  echo "Building findElements atom"
  bazel build //javascript/atoms/fragments:find-elements.js
fi

if [[ ! -f "$1../../../bazel-bin/dotnet/src/webdriver/cdp/v85/DevToolsSessionDomains.cs" ]]
then
  echo "Generating CDP code for version 85"
  bazel build //dotnet/src/webdriver/cdp:generate-v85
fi

if [[ ! -f "$1../../../bazel-bin/dotnet/src/webdriver/cdp/v106/DevToolsSessionDomains.cs" ]]
then
  echo "Generating CDP code for version 106"
  bazel build //dotnet/src/webdriver/cdp:generate-v106
fi

if [[ ! -f "$1../../../bazel-bin/dotnet/src/webdriver/cdp/v107/DevToolsSessionDomains.cs" ]]
then
  echo "Generating CDP code for version 107"
  bazel build //dotnet/src/webdriver/cdp:generate-v107
fi

if [[ ! -f "$1../../../bazel-bin/dotnet/src/webdriver/cdp/v108/DevToolsSessionDomains.cs" ]]
then
  echo "Generating CDP code for version 108"
  bazel build //dotnet/src/webdriver/cdp:generate-v108
fi
