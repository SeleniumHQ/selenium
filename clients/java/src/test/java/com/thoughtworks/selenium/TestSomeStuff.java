package com.thoughtworks.selenium;

public class TestSomeStuff extends SeleneseTestCase {
    public void xtestTextArea() throws Throwable {
        selenium.setContext("Test text area", "error");
        selenium.open("/selenium-server/tests/html/test_verifications.html");
        String s = selenium.getText("theTextarea");
        boolean b = "Line 1\nLine 2".equals(s)  // IE
        || "Line 1 Line 2".equals(s);           // firefox
        assertTrue("text area", b);
        System.out.println(s);
    }
    public void xtestTypeHang() throws Throwable{
        selenium.open("http://www.google.co.uk");
        selenium.waitForPageToLoad("50000");
        
        selenium.type("q", "rabbits");
        selenium.click("btnG");
        selenium.waitForPageToLoad("50000");
        
        selenium.type("q", "selenium2");
        selenium.click("btnG");
        selenium.waitForPageToLoad("50000");
        
        selenium.type("q", "selenium");
        selenium.click("btnG");
        selenium.waitForPageToLoad("50000");
    }    
    public void testCallxtestTypeHang() throws Throwable {
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        /*
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();
        xtestTypeHang();*/
    }
}
