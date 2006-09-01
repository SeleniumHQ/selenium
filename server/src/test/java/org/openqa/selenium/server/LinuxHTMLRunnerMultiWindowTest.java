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
    
    public void testFirefoxSlow() throws Exception{
        runHTMLSuite("*firefox", true);
    }
        
    public void testChrome() throws Exception {
        runHTMLSuite("*chrome", false);
    }
    
    public void testChromeSlow() throws Exception {
        runHTMLSuite("*chrome", true);
    }

}
