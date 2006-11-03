package org.openqa.selenium.server;

public class WindowsHTMLRunnerMultiWindowTest extends HTMLRunnerTestBase {
    public WindowsHTMLRunnerMultiWindowTest() {
        super.multiWindow = true;
    }
    
    public WindowsHTMLRunnerMultiWindowTest(String name) {
        super(name);
        super.multiWindow = true;
    }
    
    public void testFirefox() throws Exception{
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
        try {
            runHTMLSuite("*iehta", false);
            fail("Didn't catch expected exception");
        } catch (UnsupportedOperationException e) {
            System.out.println("caught expected exception");
        }
    }

}
