#!/bin/bash

# Script to automatically update the tests for Selenium RC

TO="`pwd`"
SRC_DIR=/tmp/selenium-rc
HOLDING=/tmp/selenium-rc-holding

mkdir -p "$SRC_DIR"
mkdir -p "$HOLDING"

rm -rf "$SRC_DIR"
rm -rf "$HOLDING"

svn export http://svn.openqa.org/svn/selenium-rc/trunk "$SRC_DIR"
cd "$SRC_DIR"

mvn install -Dnotest=1 -Dmaven.test.skip=true

cd "$SRC_DIR/clients/java/target/generated-sources/test/java"
cp -r . "$HOLDING"

cd "$SRC_DIR/tests/src/test/java"
cp -r . "$HOLDING"

cd "$HOLDING" && echo "In $HOLDING"
find com -type f -print | grep -v .java | xargs rm
find org -type f -print | grep -v .java | xargs rm

cp -r "$HOLDING/" "$TO/test/java"