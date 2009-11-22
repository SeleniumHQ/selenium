package org.openqa.selenium.thirdparty;

import org.testng.annotations.Test;

import com.thoughtworks.selenium.SeleneseTestNgHelper;

public class CrossDomainTest extends SeleneseTestNgHelper {
    @Test
    public void crossDomain() {
        selenium.open("http://www.yahoo.com");
        selenium.open("http://www.google.com");
        selenium.open("http://www.msn.com");
    }
}
