@echo off

echo  "Sample Selenium-RC Test - run tests"
echo  "-----------------------------------"

set CP="lib\junit-3.8.2.jar;lib\selenium-java-client-driver-1.0-SNAPSHOT.jar"
set CP=%CP%;"build\test-classes"

java -classpath %CP% AllTests 
