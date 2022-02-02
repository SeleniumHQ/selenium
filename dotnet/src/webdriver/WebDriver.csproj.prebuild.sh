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

if [[ ! -f "$1../../../bazel-bin/dotnet/src/webdriver/cdp/v95/DevToolsSessionDomains.cs" ]]
then
  echo "Generating CDP code for version 95"
  bazel build //dotnet/src/webdriver/cdp:generate-v95
fi

if [[ ! -f "$1../../../bazel-bin/dotnet/src/webdriver/cdp/v96/DevToolsSessionDomains.cs" ]]
then
  echo "Generating CDP code for version 96"
  bazel build //dotnet/src/webdriver/cdp:generate-v96
fi

if [[ ! -f "$1../../../bazel-bin/dotnet/src/webdriver/cdp/v97/DevToolsSessionDomains.cs" ]]
then
  echo "Generating CDP code for version 97"
  bazel build //dotnet/src/webdriver/cdp:generate-v97
fi
