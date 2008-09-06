package org.openqa.selenium.thirdparty;

import org.openqa.selenium.AbstractTest;
import org.testng.annotations.Test;

public class CrossDomainTest extends AbstractTest {
    @Test
    public void crossDomain() {
        selenium.open("http://www.yahoo.com");
        selenium.open("http://www.google.com");
        selenium.open("http://www.msn.com");
    }
}
