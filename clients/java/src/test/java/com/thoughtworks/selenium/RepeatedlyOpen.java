package com.thoughtworks.selenium;

public class RepeatedlyOpen extends SeleneseTestCase {
    public void testOpen() throws Throwable {
        selenium.setContext("Test Open", "error");
        try {
            while(true) {
                selenium.open("/selenium-server/tests/html/test_open.html");
                selenium.open("/selenium-server/tests/html/test_page.slow.html");
            }
        }
        catch (Exception e) {
            System.out.println("go take a look: " + e);
        }
    }
}
