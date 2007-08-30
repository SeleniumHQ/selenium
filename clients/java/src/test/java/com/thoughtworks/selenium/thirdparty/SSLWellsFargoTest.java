package com.thoughtworks.selenium.thirdparty;

import com.thoughtworks.selenium.SSLOpenTest;

public class SSLWellsFargoTest extends SSLOpenTest {
    
    public SSLWellsFargoTest(String name) {
        super(name);
        url = "https://www.wellsfargo.com";
        title = "Wells Fargo Home Page";
    }
    
    public void testChrome() {
        runTest();
    }
    
    public void testIehta() {
        runTest();
    }
}
