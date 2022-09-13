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

if [[ ! -f "$1../../../bazel-bin/dotnet/src/webdriver/cdp/v103/DevToolsSessionDomains.cs" ]]
then
  echo "Generating CDP code for version 103"
  bazel build //dotnet/src/webdriver/cdp:generate-v103
fi

if [[ ! -f "$1../../../bazel-bin/dotnet/src/webdriver/cdp/v104/DevToolsSessionDomains.cs" ]]
then
  echo "Generating CDP code for version 104"
  bazel build //dotnet/src/webdriver/cdp:generate-v104
fi

if [[ ! -f "$1../../../bazel-bin/dotnet/src/webdriver/cdp/v105/DevToolsSessionDomains.cs" ]]
then
  echo "Generating CDP code for version 105"
  bazel build //dotnet/src/webdriver/cdp:generate-v105
fi
