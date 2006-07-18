package com.thoughtworks.selenium;

public class TestDwr extends SeleneseTestCase {
    public void setUp() throws Exception {
        super.setUp("http://localhost:8080");
    }
    public void testClick() throws Throwable {
        selenium.open("/dwr");
        Thread.sleep(4000);
        //selenium.windowFocus("");
        selenium.click("");
        Thread.sleep(2000);
    }
}
