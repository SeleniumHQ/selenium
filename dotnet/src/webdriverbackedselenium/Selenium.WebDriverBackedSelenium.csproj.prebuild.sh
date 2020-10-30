#!/bin/bash
if [[ ! -f "$1../../../bazel-bin/javascript/selenium-atoms/findElement.js" ]]
then
  echo "Building findElement atom"
  bazel build //javascript/selenium-atoms:findElement
fi

if [[ ! -f "$1../../../bazel-bin/javascript/selenium-atoms/findOption.js" ]]
then
  echo "Building findOption atom"
  bazel build //javascript/selenium-atoms:findOption
fi

if [[ ! -f "$1../../../bazel-bin/javascript/selenium-atoms/fireEvent.js" ]]
then
  echo "Building fireEvent atom"
  bazel build //javascript/selenium-atoms:fireEvent
fi

if [[ ! -f "$1../../../bazel-bin/javascript/selenium-atoms/fireEventAt.js" ]]
then
  echo "Building fireEventAt atom"
  bazel build //javascript/selenium-atoms:fireEventAt
fi

if [[ ! -f "$1../../../bazel-bin/javascript/selenium-atoms/getText.js" ]]
then
  echo "Building getText atom"
  bazel build //javascript/selenium-atoms:getText
fi

if [[ ! -f "$1../../../bazel-bin/javascript/selenium-atoms/linkLocator.js" ]]
then
  echo "Building linkLocator atom"
  bazel build //javascript/selenium-atoms:linkLocator
fi

if [[ ! -f "$1../../../bazel-bin/javascript/selenium-atoms/isElementPresent.js" ]]
then
  echo "Building isElementPresent atom"
  bazel build //javascript/selenium-atoms:isElementPresent
fi

if [[ ! -f "$1../../../bazel-bin/javascript/selenium-atoms/isSomethingSelected.js" ]]
then
  echo "Building isSomethingSelected atom"
  bazel build //javascript/selenium-atoms:isSomethingSelected
fi

if [[ ! -f "$1../../../bazel-bin/javascript/selenium-atoms/isVisible.js" ]]
then
  echo "Building isVisble atom"
  bazel build //javascript/selenium-atoms:isVisble
fi

if [[ ! -f "$1../../../bazel-bin/javascript/selenium-atoms/type.js" ]]
then
  echo "Building type atom"
  bazel build //javascript/selenium-atoms:type
fi
