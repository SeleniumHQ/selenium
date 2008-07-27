package com.thoughtworks.selenium.thirdparty;

import com.thoughtworks.selenium.SeleneseTestCase;

public class SSLWellsFargoTest extends SeleneseTestCase {
    
    public void testWellsFargo() {
        selenium.open("https://www.wellsfargo.com");
        assertEquals("Wells Fargo Home Page", selenium.getTitle());
    }
}
