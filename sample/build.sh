#!/bin/sh

echo
echo "Sample Selenium-RC Test"
echo "-----------------------"
echo 

mkdir -p build/test-classes

CLASSPATH=`echo java-lib/*.jar | tr ' ' ':'`:$CLASSPATH

TEST_FILES=`find java-test-src -name *.java | tr '\n' ' '`
echo "Compiling java-test-src/ files: $TEST_FILES"

javac -sourcepath java-test-src -classpath $CLASSPATH -d build/test-classes $TEST_FILES

echo ""