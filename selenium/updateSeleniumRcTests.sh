#!/bin/bash

# Script to automatically update the tests for Selenium RC

TO="`pwd`"
SRC_DIR=/tmp/selenium-rc
HOLDING=/tmp/selenium-rc-holding

# Clear up the working directory
rm -rf "$SRC_DIR"

# Get the latest version of Selenium RC
svn export http://svn.openqa.org/svn/selenium-rc/trunk/tests "$SRC_DIR"

# Now generate the tests

cd "$SRC_DIR/generated"

# Build the generated tests
mvn package -Dnotest=1 -Dmaven.test.skip=true

# Delete the old tests and copy in the new ones
rm -f "$TO/test/java/com/thoughtworks/selenium/corebased/*.java"
rm -f "$TO/test/java/org/openqa/selenium/*.java"
rm -f "$TO/test/java/org/openqa/selenium/thirdparty/*.java"

cp target/generated-sources/test/java/com/thoughtworks/selenium/corebased/*.java "$TO/test/java/com/thoughtworks/selenium/corebased"
cp -R ../non-generated/src/test/java/org/openqa/selenium/* "$TO/test/java/org/openqa/selenium/"

# Modify tests to remove nasty dependency on internals of selenium core
for tst in ${TO}/test/java/com/thoughtworks/selenium/corebased/*.java; do
  echo "$tst"
  sed -e 's/selenium.getEval("parseUrl(canonicalize(absolutify(\\"html\\", selenium.browserbot.baseUrl))).pathname;");/"http:\/\/localhost:4444\/tests\/html";/' -i '' "$tst"
done

# Delete the tests that make no sense for us
rm "${TO}/test/java/org/openqa/selenium/TestSeleniumServerLauncher.java"

# Now go grab the selenium client jar and update that
cp $HOME/.m2/repository/org/seleniumhq/selenium/client-drivers/selenium-java-client-driver/1.0-SNAPSHOT/selenium-java-client-driver-1.0-SNAPSHOT.jar "$TO/lib/runtime"
