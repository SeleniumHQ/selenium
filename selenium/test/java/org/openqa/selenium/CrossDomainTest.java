package org.openqa.selenium;

import org.testng.annotations.Test;

public class CrossDomainTest extends AbstractTest {
    @Test
    public void crossDomain() {
        if (isBrowser("SAFARI3")) {
            skip("CrossDomainTest.crossDomain");
        }

        try {
            selenium.open("http://www.yahoo.com");
            selenium.open("http://www.google.com");
            selenium.open("http://www.msn.com");
        } catch (Throwable t) {
            fail("CrossDomainTest.crossDomain", t);
        }

        TestReporter.report("CrossDomainTest.crossDomain", true);
    }
}
