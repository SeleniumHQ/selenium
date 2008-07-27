package com.thoughtworks.selenium.thirdparty;

import com.thoughtworks.selenium.SeleneseTestCase;

public class MultiDomainTest extends SeleneseTestCase {

    public void testMultipleDomains() {
        // DGF This test isn't REALLY a multi-domain test; we're visiting /selenium-server on multi-domains
        // still, non-PI & non-proxy modes can't pass this test.
        selenium.open("http://www.google.com/selenium-server/tests/html/test_open.html");
        selenium.open("http://www.openqa.org/selenium-server/tests/html/test_open.html");
        selenium.open("http://www.yahoo.com/selenium-server/tests/html/test_open.html");
    }
}
