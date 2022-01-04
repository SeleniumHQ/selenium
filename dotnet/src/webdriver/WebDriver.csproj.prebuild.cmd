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

if not exist  "%1..\..\..\bazel-bin\dotnet\src\webdriver\cdp\v95\DevToolsSessionDomains.cs" (
  echo Generating CDP code for version 95
  pushd "%1..\..\.."
  bazel build //dotnet/src/webdriver/cdp:generate-v95
  popd
)

if not exist  "%1..\..\..\bazel-bin\dotnet\src\webdriver\cdp\v96\DevToolsSessionDomains.cs" (
  echo Generating CDP code for version 96
  pushd "%1..\..\.."
  bazel build //dotnet/src/webdriver/cdp:generate-v96
  popd
)

if not exist  "%1..\..\..\bazel-bin\dotnet\src\webdriver\cdp\v97\DevToolsSessionDomains.cs" (
  echo Generating CDP code for version 97
  pushd "%1..\..\.."
  bazel build //dotnet/src/webdriver/cdp:generate-v97
  popd
)
