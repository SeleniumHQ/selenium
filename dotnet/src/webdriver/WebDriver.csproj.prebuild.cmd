@echo off
if not exist "%1..\..\..\bazel-bin\javascript\webdriver\atoms\get-attribute.js" (
  echo Building getAttribute atom
  pushd "%1..\..\.."
  bazel build //javascript/webdriver/atoms:get-attribute.js
  popd
)

if not exist  "%1..\..\..\bazel-bin\javascript\atoms\fragments\is-displayed.js" (
  echo Building isDisplayed atom
  pushd "%1..\..\.."
  bazel build //javascript/atoms/fragments:is-displayed.js
  popd
)

if not exist  "%1..\..\..\bazel-bin\javascript\atoms\fragments\find-elements.js" (
  echo Building findElements atom
  pushd "%1..\..\.."
  bazel build //javascript/atoms/fragments:find-elements.js
  popd
)

if not exist  "%1..\..\..\bazel-bin\dotnet\src\webdriver\cdp\v85\DevToolsSessionDomains.cs" (
  echo Generating CDP code for version 85
  pushd "%1..\..\.."
  bazel build //dotnet/src/webdriver/cdp:generate-v85
  popd
)

if not exist  "%1..\..\..\bazel-bin\dotnet\src\webdriver\cdp\v114\DevToolsSessionDomains.cs" (
  echo Generating CDP code for version 114
  pushd "%1..\..\.."
  bazel build //dotnet/src/webdriver/cdp:generate-v114
  popd
)

if not exist  "%1..\..\..\bazel-bin\dotnet\src\webdriver\cdp\v115\DevToolsSessionDomains.cs" (
  echo Generating CDP code for version 115
  pushd "%1..\..\.."
  bazel build //dotnet/src/webdriver/cdp:generate-v115
  popd
)

if not exist  "%1..\..\..\bazel-bin\dotnet\src\webdriver\cdp\v116\DevToolsSessionDomains.cs" (
  echo Generating CDP code for version 116
  pushd "%1..\..\.."
  bazel build //dotnet/src/webdriver/cdp:generate-v116
  popd
)
