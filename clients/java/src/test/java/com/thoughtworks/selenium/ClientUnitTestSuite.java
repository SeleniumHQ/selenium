package com.thoughtworks.selenium;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

public class ClientUnitTestSuite extends TestCase {
    public static Test suite() {
        TestSuite suite = new TestSuite(ClientUnitTestSuite.class.getName());
        suite.addTestSuite(CSVTest.class);
        suite.addTestSuite(WaitTest.class);
        return suite;
    }

}
