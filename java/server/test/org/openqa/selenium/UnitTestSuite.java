package org.openqa.selenium;

import org.openqa.selenium.os.WindowsUtilsUnitTest;
import org.openqa.selenium.server.BrowserResponseSequencerUnitTest;
import org.openqa.selenium.rc.HTMLSuiteResultUnitTest;
import org.openqa.selenium.server.BrowserConfigurationOptionsTest;
import org.openqa.selenium.server.BrowserSessionFactoryUnitTest;
import org.openqa.selenium.server.ClasspathResourceLocatorUnitTest;
import org.openqa.selenium.server.CommandHolderUnitTest;
import org.openqa.selenium.server.CommandQueueUnitTest;
import org.openqa.selenium.server.CommandResultHolderUnitTest;
import org.openqa.selenium.server.DefaultRemoteCommandUnitTest;
import org.openqa.selenium.server.FrameGroupCommandQueueUnitTest;
import org.openqa.selenium.server.FsResourceLocatorUnitTest;
import org.openqa.selenium.server.RemoteControlConfigurationUnitTest;
import org.openqa.selenium.server.SeleniumDriverResourceHandlerUnitTest;
import org.openqa.selenium.server.SeleniumServerUnitTest;
import org.openqa.selenium.server.SingleEntryAsyncQueueUnitTest;
import org.openqa.selenium.server.StaticContentHandlerUnitTest;
import org.openqa.selenium.server.browserlaunchers.AbstractBrowserLauncherUnitTest;
import org.openqa.selenium.server.browserlaunchers.BrowserLauncherFactoryUnitTest;
import org.openqa.selenium.server.browserlaunchers.FirefoxChromeLauncherUnitTest;
import org.openqa.selenium.server.browserlaunchers.MakeProxyPacUnitTest;
import org.openqa.selenium.server.mock.MockPIFrameUnitTest;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    CommandHolderUnitTest.class,
    CommandQueueUnitTest.class,
    CommandResultHolderUnitTest.class,
    SingleEntryAsyncQueueUnitTest.class,

    BrowserConfigurationOptionsTest.class,
    BrowserSessionFactoryUnitTest.class,
    SeleniumServerUnitTest.class,
    ClasspathResourceLocatorUnitTest.class,
    FrameGroupCommandQueueUnitTest.class,
    FsResourceLocatorUnitTest.class,
    SeleniumDriverResourceHandlerUnitTest.class,
    StaticContentHandlerUnitTest.class,
    WindowsUtilsUnitTest.class,
    FirefoxChromeLauncherUnitTest.class,
    HTMLSuiteResultUnitTest.class,
    MockPIFrameUnitTest.class,
    BrowserResponseSequencerUnitTest.class,
    MakeProxyPacUnitTest.class,
    DefaultRemoteCommandUnitTest.class,
    RemoteControlConfigurationUnitTest.class,
    BrowserLauncherFactoryUnitTest.class,
    AbstractBrowserLauncherUnitTest.class
})
public class UnitTestSuite {}
