package org.openqa.selenium.server;

public class WindowsHTMLRunnerTest extends HTMLRunnerTestBase {
    public void testFirefox() throws Exception{
        runHTMLSuite("*firefox", false);
    }
    
    public void testFirefoxSlow() throws Exception{
        runHTMLSuite("*firefox", true);
    }

    public void testIExplore() throws Exception {
        runHTMLSuite("*iexplore", false);
    }
    
    public void testIExploreSlow() throws Exception {
        runHTMLSuite("*iexplore", true);
    }

    public void testChrome() throws Exception {
        runHTMLSuite("*chrome", false);
    }
    
    public void testChromeSlow() throws Exception {
        runHTMLSuite("*chrome", true);
    }

    public void testOpera() throws Exception {
        runHTMLSuite("*opera", false);
    }
    
    public void testOperaSlow() throws Exception {
        runHTMLSuite("*opera", true);
    }

    public void testHTA() throws Exception {
        try {
            runHTMLSuite("*iehta", false);
            fail("Didn't catch expected exception");
        } catch (UnsupportedOperationException e) {
            System.out.println("caught expected exception");
        }
    }

}
