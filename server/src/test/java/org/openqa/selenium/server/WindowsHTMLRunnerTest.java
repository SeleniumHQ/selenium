package org.openqa.selenium.server;

public class WindowsHTMLRunnerTest extends HTMLRunnerTestBase {
    public void testFirefox() throws Exception{
        runHTMLSuite("*firefox");
    }

    public void testIExplore() throws Exception {
        runHTMLSuite("*iexplore");
    }

    public void testChrome() throws Exception {
        // TODO incorporate Shinya's fixes from Selenium IDE
        // This test should pass
        runHTMLSuite("*chrome");
    }

    public void testOpera() throws Exception {
        runHTMLSuite("*opera");
    }

    public void testHTA() throws Exception {
        try {
            runHTMLSuite("*iehta");
            fail("Didn't catch expected exception");
        } catch (UnsupportedOperationException e) {
            System.out.println("caught expected exception");
        }
    }

}
