#!/bin/sh

echo
echo "Sample Selenium-RC Test - zip"
echo "-------------------------------"
echo "This script zips up your source + libs"
echo

jar -cMvf selenium-rc-bug-report.zip java-test-src/*.java java-lib/*.jar 

