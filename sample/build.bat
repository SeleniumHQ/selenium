@echo off
echo 
echo  "Sample Selenium-RC Test - build"
echo  "-------------------------------"

mkdir build
mkdir build\test-classes

set CP="lib\junit-3.8.2.jar;lib\selenium-java-client-driver-1.0-SNAPSHOT.jar"
set CP=%CP%;"build\test-classes"

javac -classpath %CP% -sourcepath src -d build\test-classes src\AllTests.java src\ExampleSeleniumTest.java 