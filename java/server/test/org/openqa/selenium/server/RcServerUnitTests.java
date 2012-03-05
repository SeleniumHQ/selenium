package org.openqa.selenium.server;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.openqa.selenium.server.browserlaunchers.AbstractBrowserLauncherUnitTest;
import org.openqa.selenium.server.browserlaunchers.BrowserConfigurationOptionsTest;
import org.openqa.selenium.server.browserlaunchers.BrowserLauncherFactoryUnitTest;
import org.openqa.selenium.server.browserlaunchers.FirefoxChromeLauncherUnitTest;
import org.openqa.selenium.server.browserlaunchers.MakeProxyPacUnitTest;
import org.openqa.selenium.server.htmlrunner.HTMLSuiteResultUnitTest;
import org.openqa.selenium.server.mock.MockPIFrameUnitTest;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    AbstractBrowserLauncherUnitTest.class,
    BrowserConfigurationOptionsTest.class,
    BrowserLauncherFactoryUnitTest.class,
    BrowserResponseSequencerUnitTest.class,
    BrowserSessionFactoryUnitTest.class,
    ClasspathResourceLocatorUnitTest.class,
    CommandHolderUnitTest.class,
    CommandQueueUnitTest.class,
    CommandResultHolderUnitTest.class,
    DefaultRemoteCommandUnitTest.class,
    FirefoxChromeLauncherUnitTest.class,
    FrameGroupCommandQueueUnitTest.class,
    FsResourceLocatorUnitTest.class,
    HTMLSuiteResultUnitTest.class,
    MakeProxyPacUnitTest.class,
    MockPIFrameUnitTest.class,
    RemoteControlConfigurationUnitTest.class,
    SeleniumDriverResourceHandlerUnitTest.class,
    SeleniumServerUnitTest.class
//    SingleEntryAsyncQueueUnitTest.class,
//    StaticContentHandlerUnitTest.class
})
public class RcServerUnitTests {}
