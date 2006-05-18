/*
 * Created on May 18, 2006
 *
 */
package org.openqa.selenium;

import org.openqa.selenium.server.*;
import org.openqa.selenium.server.browserlaunchers.*;

import junit.framework.*;

public class ServerTestSuite extends TestCase {

    public static Test suite() {
        TestSuite suite = new TestSuite(ServerTestSuite.class.getName());
        suite.addTestSuite(QueueTest.class);
        suite.addTestSuite(HTMLRunnerTest.class);
        suite.addTestSuite(FirefoxCustomProfileLauncher.class);
        suite.addTestSuite(InternetExplorerCustomProxyLauncher.class);
        suite.addTestSuite(WindowsUtilsTest.class);
        return suite;
    }
}
