package com.thoughtworks.selenium.thirdparty;

import com.thoughtworks.selenium.SeleneseTestNgHelper;
import org.testng.annotations.Test;

public class SSLWellsFargoTest extends SeleneseTestNgHelper {
    
    @Test
    public void testWellsFargo() {
        selenium.open("https://www.wellsfargo.com");
        assertEquals("Wells Fargo Home Page", selenium.getTitle());
    }
}
