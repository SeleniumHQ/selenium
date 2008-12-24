#!/bin/sh

echo
echo "Sample Selenium-RC Test - zip"
echo "-------------------------------"
echo "This script zips up your source + libs"
echo

jar -cMvf selenium-java-example-for-newbies.zip src/*.java lib/*.jar *.sh *.bat readme.txt

