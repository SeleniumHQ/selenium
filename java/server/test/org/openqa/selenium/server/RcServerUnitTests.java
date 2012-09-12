/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.server;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.openqa.selenium.server.browserlaunchers.AbstractBrowserLauncherUnitTest;
import org.openqa.selenium.server.browserlaunchers.BrowserConfigurationOptionsTest;
import org.openqa.selenium.server.browserlaunchers.BrowserLauncherFactoryUnitTest;
import org.openqa.selenium.server.browserlaunchers.FirefoxChromeLauncherUnitTest;
import org.openqa.selenium.server.browserlaunchers.MakeProxyPacUnitTest;
import org.openqa.selenium.server.htmlrunner.HTMLSuiteResultUnitTest;
import org.openqa.selenium.server.log.DefaultPerSessionLogHandlerUnitTest;
import org.openqa.selenium.server.log.LoggingManagerUnitTest;
import org.openqa.selenium.server.log.ShortTermMemoryHandlerUnitTest;
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
    DefaultPerSessionLogHandlerUnitTest.class,
    FirefoxChromeLauncherUnitTest.class,
    FrameGroupCommandQueueUnitTest.class,
    FsResourceLocatorUnitTest.class,
    HTMLSuiteResultUnitTest.class,
    LoggingManagerUnitTest.class,
    MakeProxyPacUnitTest.class,
    MockPIFrameUnitTest.class,
    ProxyHandlerUnitTest.class,
    RemoteControlConfigurationUnitTest.class,
    SeleniumDriverResourceHandlerUnitTest.class,
    SeleniumServerUnitTest.class,
    ShortTermMemoryHandlerUnitTest.class,
    SingleEntryAsyncQueueUnitTest.class,
    StaticContentHandlerUnitTest.class
})
public class RcServerUnitTests {}
