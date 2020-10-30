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

if not exist  "%1..\..\..\bazel-bin\dotnet\src\webdriver\devtools\generated\v84\DevToolsSessionDomains.cs" (
  echo Generating CDP code for version 84
  pushd "%1..\..\.."
  bazel build //dotnet/src/webdriver/DevTools:generate-v84
  popd
)

if not exist  "%1..\..\..\bazel-bin\dotnet\src\webdriver\devtools\generated\v85\DevToolsSessionDomains.cs" (
  echo Generating CDP code for version 85
  pushd "%1..\..\.."
  bazel build //dotnet/src/webdriver/DevTools:generate-v85
  popd
)

if not exist  "%1..\..\..\bazel-bin\dotnet\src\webdriver\devtools\generated\v86\DevToolsSessionDomains.cs" (
  echo Generating CDP code for version 86
  pushd "%1..\..\.."
  bazel build //dotnet/src/webdriver/DevTools:generate-v86
  popd
)
