package com.thoughtworks.selenium;

public class TestSomeStuff extends SeleneseTestCase {
    public void testTextArea() throws Throwable {
        selenium.setContext("Test text area", "error");
        selenium.open("/selenium-server/tests/html/test_verifications.html");
        String s = selenium.getText("theTextarea");
        boolean b = "Line 1\nLine 2".equals(s)  // IE
        || "Line 1 Line 2".equals(s);           // firefox
        assertTrue("text area", b);
        System.out.println(s);
    }
}
