package com.thoughtworks.selenium;
public class TestFifteenSecondSleep extends SeleneseTestCase
{
   public void testFifteenSecondSleep() throws Throwable {

        selenium.open("/selenium-server/tests/html/test_open.html");
        Thread.sleep(15000);
        selenium.open("/selenium-server/tests/html/test_open.html");        
    }
}
