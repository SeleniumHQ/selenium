package com.thoughtworks.selenium.petsoar;

import junit.framework.Test;
import junit.framework.TestSuite;

public class AllTests {

    public static Test suite() {
        TestSuite suite = new TestSuite();
        suite.addTestSuite(FooTestCase.class);
        return suite;
    }

}
