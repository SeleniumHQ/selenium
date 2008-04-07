package org.openqa.selenium;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import org.openqa.selenium.server.*;
import org.openqa.selenium.server.browserlaunchers.LauncherUtilsTest;
import org.openqa.selenium.server.browserlaunchers.MacProxyManagerTest;
import org.openqa.selenium.server.browserlaunchers.MakeProxyPacTest;
import org.openqa.selenium.server.browserlaunchers.WindowsProxyManagerTest;
import org.openqa.selenium.server.browserlaunchers.WindowsUtilsTest;
import org.openqa.selenium.server.browserlaunchers.FirefoxChromeLauncherTest;
import org.openqa.selenium.server.mock.MockPIFrameTest;

public class UnitTestSuite extends TestCase {

    public static Test suite() {
        TestSuite suite = new TestSuite(UnitTestSuite.class.getName());
        suite.addTestSuite(SingleEntryAsyncQueueTest.class);
        suite.addTestSuite(CommandHolderTest.class);
        suite.addTestSuite(CommandResultHolderTest.class);
        suite.addTestSuite(CommandQueueTest.class);
        suite.addTestSuite(BrowserSessionFactoryTest.class);
        suite.addTestSuite(SeleniumServerTest.class);
        suite.addTestSuite(ClasspathResourceLocatorTest.class);
        suite.addTestSuite(FrameGroupCommandQueueTest.class);
        suite.addTestSuite(FsResourceLocatorTest.class);
        suite.addTestSuite(SeleniumDriverResourceHandlerTest.class);
        suite.addTestSuite(StaticContentHandlerTest.class);
        suite.addTestSuite(WindowsUtilsTest.class);
        suite.addTestSuite(FirefoxChromeLauncherTest.class);
        suite.addTestSuite(HTMLSuiteResultTest.class);
        suite.addTestSuite(MockPIFrameTest.class);
        suite.addTestSuite(BrowserResponseSequencerTest.class);
        suite.addTestSuite(MacProxyManagerTest.class);
        suite.addTestSuite(MakeProxyPacTest.class);
        suite.addTestSuite(WindowsProxyManagerTest.class);
        suite.addTestSuite(LauncherUtilsTest.class);
        suite.addTestSuite(DefaultRemoteCommandTest.class);
        suite.addTestSuite(RemoteControlConfigurationTest.class);
        return suite;
    }
}
