package com.thoughtworks.selenium.thirdparty;

import org.testng.annotations.Test;

import com.thoughtworks.selenium.SeleneseTestNgHelper;

public class SSLWellsFargoTest extends SeleneseTestNgHelper {
    
    @Test
    public void testWellsFargo() {
        selenium.open("https://www.wellsfargo.com");
        assertEquals("Wells Fargo Home Page", selenium.getTitle());
    }
}
