package org.openqa.selenium;

import org.testng.annotations.Test;
import org.testng.SkipException;
import org.openqa.selenium.utils.TestReporter;

public class CrossDomainTest extends AbstractTest {
    @Test
    public void crossDomain() {
        selenium.open("http://www.yahoo.com");
        selenium.open("http://www.google.com");
        selenium.open("http://www.msn.com");
    }
}
