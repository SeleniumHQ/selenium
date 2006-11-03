package org.openqa.selenium.server;


public class LinuxHTMLRunnerTest extends HTMLRunnerTestBase {
    public void testFirefox() throws Exception{
        runHTMLSuite("*firefox", false);
    }
    
    public void testChrome() throws Exception {
        runHTMLSuite("*chrome", false);
    }
    
}
