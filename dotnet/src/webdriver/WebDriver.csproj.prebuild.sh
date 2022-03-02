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

if [[ ! -f "$1../../../bazel-bin/dotnet/src/webdriver/cdp/v97/DevToolsSessionDomains.cs" ]]
then
  echo "Generating CDP code for version 97"
  bazel build //dotnet/src/webdriver/cdp:generate-v97
fi

if [[ ! -f "$1../../../bazel-bin/dotnet/src/webdriver/cdp/v98/DevToolsSessionDomains.cs" ]]
then
  echo "Generating CDP code for version 98"
  bazel build //dotnet/src/webdriver/cdp:generate-v98
fi

if [[ ! -f "$1../../../bazel-bin/dotnet/src/webdriver/cdp/v99/DevToolsSessionDomains.cs" ]]
then
  echo "Generating CDP code for version 99"
  bazel build //dotnet/src/webdriver/cdp:generate-v99
fi
