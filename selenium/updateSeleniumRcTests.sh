#!/bin/bash

# Script to automatically update the tests for Selenium RC

TO="`pwd`"
SRC_DIR=/tmp/selenium-rc
HOLDING=/tmp/selenium-rc-holding

# Clear up the working directory
rm -rf "$SRC_DIR"

# Get the latest version of Selenium RC
svn export http://svn.openqa.org/svn/selenium-rc/trunk "$SRC_DIR"
cd "$SRC_DIR/tests/generated"

# Build the generated tests
mvn package -Dnotest=1 -Dmaven.test.skip=true

# Delete the old tests and copy in the new ones
rm -f "$TO/test/java/com/thoughtworks/selenium/corebased/*.java"
rm -f "$TO/test/java/org/openqa/selenium/*.java"
rm -f "$TO/test/java/org/openqa/selenium/thirdparty/*.java"

cp target/generated-sources/test/java/com/thoughtworks/selenium/corebased/*.java "$TO/test/java/com/thoughtworks/selenium/corebased"
cp -R ../non-generated/src/test/java/org/openqa/selenium/ "$TO/test/java/org/openqa/selenium"

