/*
 * Created on May 18, 2006
 *
 */
package org.openqa.selenium;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;
import org.openqa.selenium.server.LinuxHTMLRunnerTest;
import org.openqa.selenium.server.WindowsHTMLRunnerTest;
import org.openqa.selenium.server.browserlaunchers.WindowsUtils;


public class ServerTestSuite extends TestCase {

    public static Test suite() {
        TestSuite suite = new TestSuite(ServerTestSuite.class.getName());
        if (WindowsUtils.thisIsWindows()) {
            suite.addTestSuite(WindowsHTMLRunnerTest.class);
        } else {
            suite.addTestSuite(LinuxHTMLRunnerTest.class);
        }
        return suite;
    }
}
