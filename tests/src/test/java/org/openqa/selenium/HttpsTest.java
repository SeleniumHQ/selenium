package org.openqa.selenium;

import org.testng.annotations.Test;

public class HttpsTest extends AbstractTest {
    @Test
    public void fidelity() {
        if (isBrowser("SAFARI3")) {
            skip("HttpsTest.fidelity");
        }

        try {
            selenium.open("https://www.fidelity.com");
        } catch (Throwable t) {
            fail("HttpsTest.fidelity", t);
        }

        TestReporter.report("HttpsTest.fidelity", true);
    }

}
