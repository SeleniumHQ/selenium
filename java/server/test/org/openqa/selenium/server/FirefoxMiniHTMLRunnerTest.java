package org.openqa.selenium.server;

import org.openqa.selenium.Ignore;


@Ignore
public class FirefoxMiniHTMLRunnerTest extends HTMLRunnerTestBase {
    
    public FirefoxMiniHTMLRunnerTest() { 
        super();
        super.suiteName="TestSuite.html";
    }
    public FirefoxMiniHTMLRunnerTest(String name) {
        super(name);
        super.suiteName="TestSuite.html";
    }
    
    public void testFirefoxMini() throws Exception{
        runHTMLSuite("*firefox", false);
    }
    
    

}
