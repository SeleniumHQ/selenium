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

if [[ ! -f "$1../../../bazel-bin/dotnet/src/webdriver/devtools/generated/v84/DevToolsSessionDomains.cs" ]]
then
  echo "Generating CDP code for version 84"
  bazel build //dotnet/src/webdriver/DevTools:generate-v84
fi

if [[ ! -f "$1../../../bazel-bin/dotnet/src/webdriver/devtools/generated/v85/DevToolsSessionDomains.cs" ]]
then
  echo "Generating CDP code for version 85"
  bazel build //dotnet/src/webdriver/DevTools:generate-v85
fi

if [[ ! -f "$1../../../bazel-bin/dotnet/src/webdriver/devtools/generated/v86/DevToolsSessionDomains.cs" ]]
then
  echo "Generating CDP code for version 86"
  bazel build //dotnet/src/webdriver/DevTools:generate-v86
fi
