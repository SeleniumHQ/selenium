@echo off
echo 
echo  "Sample Selenium-RC Test - build"
echo  "-------------------------------"

mkdir build
mkdir build\test-classes

set CP="java-lib\junit-3.8.2.jar;java-lib\selenium-java-client-driver-1.0-SNAPSHOT.jar"
set CP=%CP%;"build\test-classes"

javac -classpath %CP% -sourcepath java-test-src -d build\test-classes java-test-src\AllTests.java java-test-src\ExampleSeleniumTest.java 