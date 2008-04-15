package org.openqa.selenium;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import org.openqa.selenium.server.*;
import org.openqa.selenium.server.browserlaunchers.*;
import org.openqa.selenium.server.mock.MockPIFrameUnitTest;

public class UnitTestSuite extends TestCase {

    public static Test suite() {
        TestSuite suite = new TestSuite(UnitTestSuite.class.getName());
        suite.addTestSuite(SingleEntryAsyncQueueUnitTest.class);
        suite.addTestSuite(CommandHolderUnitTest.class);
        suite.addTestSuite(CommandResultHolderUnitTest.class);
        suite.addTestSuite(CommandQueueUnitTest.class);
        suite.addTestSuite(BrowserSessionFactoryUnitTest.class);
        suite.addTestSuite(SeleniumServerUnitTest.class);
        suite.addTestSuite(ClasspathResourceLocatorUnitTest.class);
        suite.addTestSuite(FrameGroupCommandQueueUnitTest.class);
        suite.addTestSuite(FsResourceLocatorUnitTest.class);
        suite.addTestSuite(SeleniumDriverResourceHandlerUnitTest.class);
        suite.addTestSuite(StaticContentHandlerUnitTest.class);
        suite.addTestSuite(WindowsUtilsUnitTest.class);
        suite.addTestSuite(FirefoxChromeLauncherUnitTest.class);
        suite.addTestSuite(HTMLSuiteResultUnitTest.class);
        suite.addTestSuite(MockPIFrameUnitTest.class);
        suite.addTestSuite(BrowserResponseSequencerUnitTest.class);
        suite.addTestSuite(MacProxyManagerUnitTest.class);
        suite.addTestSuite(MakeProxyPacUnitTest.class);
        suite.addTestSuite(WindowsProxyManagerUnitTest.class);
        suite.addTestSuite(LauncherUtilsUnitTest.class);
        suite.addTestSuite(DefaultRemoteCommandUnitTest.class);
        suite.addTestSuite(RemoteControlConfigurationUnitTest.class);
        suite.addTestSuite(BrowserLauncherFactoryUnitTest.class);
        suite.addTestSuite(AbstractBrowserLauncherUnitTest.class);
        return suite;
    }
}
