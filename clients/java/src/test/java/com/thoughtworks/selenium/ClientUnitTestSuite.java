package com.thoughtworks.selenium;

import junit.framework.Test;
import junit.framework.TestSuite;

public class ClientUnitTestSuite {
    public static Test suite() {
        TestSuite suite = new TestSuite(ClientUnitTestSuite.class.getName());
        suite.addTestSuite(CSVTest.class);
        suite.addTestSuite(WaitTest.class);
        return suite;
    }

}
