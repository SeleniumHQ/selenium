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

if not exist  "%1..\..\..\bazel-bin\dotnet\src\webdriver\cdp\v100\DevToolsSessionDomains.cs" (
  echo Generating CDP code for version 100
  pushd "%1..\..\.."
  bazel build //dotnet/src/webdriver/cdp:generate-v100
  popd
)

if not exist  "%1..\..\..\bazel-bin\dotnet\src\webdriver\cdp\v101\DevToolsSessionDomains.cs" (
  echo Generating CDP code for version 101
  pushd "%1..\..\.."
  bazel build //dotnet/src/webdriver/cdp:generate-v101
  popd
)

if not exist  "%1..\..\..\bazel-bin\dotnet\src\webdriver\cdp\v102\DevToolsSessionDomains.cs" (
  echo Generating CDP code for version 102
  pushd "%1..\..\.."
  bazel build //dotnet/src/webdriver/cdp:generate-v102
  popd
)
