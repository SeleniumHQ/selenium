#!/bin/sh

echo
echo "Sample Selenium-RC Test"
echo "-----------------------"
echo 

mkdir -p build/test-classes

CLASSPATH=`echo lib/*.jar | tr ' ' ':'`:$CLASSPATH

TEST_FILES=`find src -name *.java | tr '\n' ' '`
echo "Compiling src/ files: $TEST_FILES"

javac -sourcepath src -classpath $CLASSPATH -d build/test-classes $TEST_FILES

echo ""