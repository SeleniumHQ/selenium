Selenium RPC runner currently consists of and XML-RPC binding between the browser
and external processes. There is currently only support for Java.

To run the tests - just cd to the java folder and execute

ant -Dbrowser=firefox

This will Run the Java Selenium RPC runner unit-and integration tests.
The integration test will launch a browser that loads a JsUnit
test suite, which will run the Selenium browser part of the unit tests
and integration test.

Prereqs:
o JDK 1.4 installed
o Ant 1.6.1 or later installed
o Xalan and JUnit in $ANT_HOME/lib

