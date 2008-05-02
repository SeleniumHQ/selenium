#!/bin/sh

ALL_TESTS_CLASS="AllTests"

CLASSPATH=build/test-classes

CLASSPATH=`echo lib/*.jar | tr ' ' ':'`:$CLASSPATH
 
CMD="java -cp $CLASSPATH $ALL_TESTS_CLASS"

echo "Sample Selenium-RC Test - test"
echo "-------------------------------"
 
echo "Executing: $CMD"
echo 
$CMD