package org.openqa.selenium.server;

public class WindowsHTMLRunnerFunctionalTest extends HTMLRunnerTestBase {

    public void testFirefox() throws Exception {
        runHTMLSuite("*firefox", false);
    }

    public void testIExplore() throws Exception {
        runHTMLSuite("*iexplore", false);
    }

    public void testChrome() throws Exception {
        runHTMLSuite("*chrome", false);
    }

    public void testOpera() throws Exception {
        runHTMLSuite("*opera", false);
    }

    public void testHTA() throws Exception {
        runHTMLSuite("*iehta", false);
    }

}
