package org.openqa.selenium.server;


public class LinuxHTMLRunnerMultiWindowTest extends HTMLRunnerTestBase {
    public LinuxHTMLRunnerMultiWindowTest() {
        super.multiWindow = true;
    }
    
    public LinuxHTMLRunnerMultiWindowTest(String name) {
        super(name);
        super.multiWindow = true;
    }
    
    public void testFirefox() throws Exception{
        runHTMLSuite("*firefox", false);
    }
    
    public void testChrome() throws Exception {
        runHTMLSuite("*chrome", false);
    }
    
}
