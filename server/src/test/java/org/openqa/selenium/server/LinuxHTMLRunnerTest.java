package org.openqa.selenium.server;


public class LinuxHTMLRunnerTest extends HTMLRunnerTestBase {
    public void testFirefox() throws Exception{
        runHTMLSuite("*firefox");
    }
        
    public void testChrome() throws Exception {
        // TODO incorporate Shinya's fixes from Selenium IDE
        // This test should pass
        runHTMLSuite("*chrome");
    }

}
