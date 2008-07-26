package com.thoughtworks.selenium;

import junit.framework.Test;
import junit.framework.TestSuite;

/** Run I18nTest with a real browser */
public class I18nIntegrationTest extends I18nTest {

    public static Test suite() {
        return new I18nTestSetup(new TestSuite(I18nTest.class), "*firefox", false);
    }

}
