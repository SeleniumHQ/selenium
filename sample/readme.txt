This mini download should allow you to tryout Selenium RC on your own machine.
==============================================================================

The commands available are for Windows, Mac and Linux.

There are a number of working assumptions -

1) You have installed a recent version of Java on your system and it is in the PATH.

   In a terminal window, type java --version and press enter.  
   Get help from your colleagues to set this up, if it is not configured correctly.

2) You are able to run the supplied commands in a Terminal or command shell:

  clean.sh ( or clean.bat on Windows)
  build.sh ( or build.bat on Windows)
  test.sh ( or test.bat on Windows)

3) Can edit text files on your platform

4) You have Firefox installed in the default location.

5) You do not have proxy server between you and http://www.google.com  - this is often a corporate decision.


Building and Running the supplied Test
======================================

1) Run build.sh (or .bat) To make the test case.

2) Download a version of selenium-server.jar from http://selenium-rc.openqa.org/download.html It should be inside the zip. In a second command window, execute 'java -jar selenium-server.jar' 

3) Run test.sh (or .bat) to run the tests.  You should see output like so in the command line, if it all went fine:

    Sample Selenium-RC Test - test
    -------------------------------
    Executing: java -cp java-lib/junit-3.8.2.jar:java-lib/selenium-java-client-driver-1.0-SNAPSHOT.jar:build/test-classes AllTests
    Time: 55.738

	OK (4 tests)

Or something like this if the test failed:

    Sample Selenium-RC Test - test
    -------------------------------
    Executing: java -cp java-lib/junit-3.8.2.jar:java-lib/selenium-java-client-driver-1.0-SNAPSHOT.jar:build/test-classes AllTests
    .F...

	Time: 49.424
	There was 1 failure:
	1) testGoogleForSomeThings(ExampleSeleniumTest)junit.framework.ComparisonFailure: expected:<[abcdefg]h> but was:<[hello world - Google Searc]h>
		at ExampleSeleniumTest.testGoogleForSomeThings(ExampleSeleniumTest.java:19)
		at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
		at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:39)
		at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:25)
		at AllTests.main(AllTests.java:12)

	FAILURES!!!
	Tests run: 4,  Failures: 1,  Errors: 0


Reporting bugs to us for Selenium RC, or requesting help to get something working, that you think should
========================================================================================================

Please modify the class in java-test-source to illustrate your problem.  Then run zip.sh or zip.bat and upload it to Jira (jira.openqa.org/browse/SRC) for our convenience.  Lastly, email the selenium-users mail-list or forum, briefly introducing the issue with a link to the issue.

Make sure you do not zip up the selenium-server.jar - it'll make for a huge (and needless) upload.

Thanks!

- The Selenium RC Team.