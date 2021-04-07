@echo off
if not exist "%1..\..\..\bazel-bin\javascript\selenium-atoms\findElement.js" (
  echo Building findElement atom
  pushd "%1..\..\.."
  bazel build //javascript/selenium-atoms:findElement
  popd
)

if not exist "%1..\..\..\bazel-bin\javascript\selenium-atoms\findOption.js" (
  echo Building findOption atom
  pushd "%1..\..\.."
  bazel build //javascript/selenium-atoms:findOption
  popd
)

if not exist  "%1..\..\..\bazel-bin\javascript\selenium-atoms\fireEvent.js" (
  echo Building fireEvent atom
  pushd "%1..\..\.."
  bazel build //javascript/selenium-atoms:fireEvent
  popd
)

if not exist  "%1..\..\..\bazel-bin\javascript\selenium-atoms\fireEventAt.js" (
  echo Building fireEventAt atom
  pushd "%1..\..\.."
  bazel build //javascript/selenium-atoms:fireEventAt
  popd
)


if not exist  "%1..\..\..\bazel-bin\javascript\selenium-atoms\getText.js" (
  echo Building getText atom
  pushd "%1..\..\.."
  bazel build //javascript/selenium-atoms:getText
  popd
)

if not exist  "%1..\..\..\bazel-bin\javascript\selenium-atoms\linkLocator.js" (
  echo Building linkLocator atom
  pushd "%1..\..\.."
  bazel build //javascript/selenium-atoms:linkLocator
  popd
)

if not exist  "%1..\..\..\bazel-bin\javascript\selenium-atoms\isElementPresent.js" (
  echo Building isElementPresent atom
  pushd "%1..\..\.."
  bazel build //javascript/selenium-atoms:isElementPresent
  popd
)

if not exist  "%1..\..\..\bazel-bin\javascript\selenium-atoms\isSomethingSelected.js" (
  echo Building isSomethingSelected atom
  pushd "%1..\..\.."
  bazel build //javascript/selenium-atoms:isSomethingSelected
  popd
)

if not exist  "%1..\..\..\bazel-bin\javascript\selenium-atoms\isVisible.js" (
  echo Building isVisible atom
  pushd "%1..\..\.."
  bazel build //javascript/selenium-atoms:isVisible
  popd
)

if not exist  "%1..\..\..\bazel-bin\javascript\selenium-atoms\type.js" (
  echo Building type atom
  pushd "%1..\..\.."
  bazel build //javascript/selenium-atoms:type
  popd
)
