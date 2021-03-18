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

if not exist  "%1..\..\..\bazel-bin\dotnet\src\webdriver\cdp\v86\DevToolsSessionDomains.cs" (
  echo Generating CDP code for version 86
  pushd "%1..\..\.."
  bazel build //dotnet/src/webdriver/cdp:generate-v86
  popd
)

if not exist  "%1..\..\..\bazel-bin\dotnet\src\webdriver\cdp\v87\DevToolsSessionDomains.cs" (
  echo Generating CDP code for version 87
  pushd "%1..\..\.."
  bazel build //dotnet/src/webdriver/cdp:generate-v87
  popd
)

if not exist  "%1..\..\..\bazel-bin\dotnet\src\webdriver\cdp\v88\DevToolsSessionDomains.cs" (
  echo Generating CDP code for version 88
  pushd "%1..\..\.."
  bazel build //dotnet/src/webdriver/cdp:generate-v88
  popd
)

if not exist  "%1..\..\..\bazel-bin\dotnet\src\webdriver\cdp\v89\DevToolsSessionDomains.cs" (
  echo Generating CDP code for version 89
  pushd "%1..\..\.."
  bazel build //dotnet/src/webdriver/cdp:generate-v89
  popd
)
