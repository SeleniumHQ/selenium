package org.openqa.selenium;

import org.openqa.selenium.browserlaunchers.WindowsProxyManagerUnitTest;
import org.openqa.selenium.browserlaunchers.WindowsUtilsUnitTest;
import org.openqa.selenium.server.*;
import org.openqa.selenium.server.browserlaunchers.*;
import org.openqa.selenium.server.mock.MockPIFrameUnitTest;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
 
@RunWith(Suite.class)
@Suite.SuiteClasses({
	SingleEntryAsyncQueueUnitTest.class,
	CommandHolderUnitTest.class,
	CommandResultHolderUnitTest.class,
	CommandQueueUnitTest.class,
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
	MacProxyManagerUnitTest.class,
	MakeProxyPacUnitTest.class,
	WindowsProxyManagerUnitTest.class,
	LauncherUtilsUnitTest.class,
	DefaultRemoteCommandUnitTest.class,
	RemoteControlConfigurationUnitTest.class,
	BrowserLauncherFactoryUnitTest.class,
	AbstractBrowserLauncherUnitTest.class
})
public class UnitTestSuite {
}
