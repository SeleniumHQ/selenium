package com.thoughtworks.selenium;

import org.openqa.selenium.server.HtmlIdentifier;

import junit.framework.TestCase;

public class HtmlIdentifierTest extends TestCase {
    public void setUp() {
        HtmlIdentifier.setLogging(true);
    }
    
    public void testSomeScenarios() {
        oneTest("/selenium-server/tests/proxy_injection_meta_equiv_test.js", 
                "application/x-javascript",
                "<!DOCTYPE html PUBLIC \\\"-//W3C//DTD XHTML 1.0 Transitional//EN \\\" \\\"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\\\"><html xmlns=\\\"http://www.w3.org/1999/xhtml\\\">\\n<head>\\n  <meta http-equiv=\\\"Content-Type\\\" content=\\\"text/html; charset=ISO-8859-\"; var s2=\"1\\\" />\\n  <title>Insert</title>\\n</head>\\n<body>n<p><strong>DWR tests passed</strong></p>\\n\\n</body>\\n</html>\\n\";",
                false);
        oneTest("http://www.google.com/webhp", 
                "text/html; charset=UTF-8", 
                "<html>...</html>", 
                true);
    }

    public void testStupidDellDotComScenario() {
        oneTest("/menu.htm", "text/html", "var x = ''; someOtherJavaScript++; blahblahblah;", false);
    }

    private void oneTest(String path, String contentType, String content, boolean expectedToInject) {
        String testCaseDescription = "HtmlIdentifier.shouldBeInjected(\"" + path + "\", \"" + 
                contentType + "\", \"" + content + "\"): should " + (expectedToInject ? "": "not ") + "inject";
        assertEquals(testCaseDescription, 
                HtmlIdentifier.shouldBeInjected(path, contentType, content),
                expectedToInject);
    }

}
