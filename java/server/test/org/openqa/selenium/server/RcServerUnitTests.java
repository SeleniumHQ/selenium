// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.server;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.openqa.selenium.remote.server.log.LoggingTests;
import org.openqa.selenium.server.browserlaunchers.AbstractBrowserLauncherUnitTest;
import org.openqa.selenium.server.browserlaunchers.BrowserConfigurationOptionsTest;
import org.openqa.selenium.server.browserlaunchers.BrowserLauncherFactoryUnitTest;
import org.openqa.selenium.server.browserlaunchers.FirefoxChromeLauncherUnitTest;
import org.openqa.selenium.server.browserlaunchers.LauncherUtilsUnitTest;
import org.openqa.selenium.server.browserlaunchers.MacProxyManagerUnitTest;
import org.openqa.selenium.server.browserlaunchers.MakeProxyPacUnitTest;
import org.openqa.selenium.server.browserlaunchers.ProxyPacTest;
import org.openqa.selenium.server.browserlaunchers.WindowsProxyManagerUnitTest;
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
    LauncherUtilsUnitTest.class,
    LoggingTests.class,
    MacProxyManagerUnitTest.class,
    MakeProxyPacUnitTest.class,
    MockPIFrameUnitTest.class,
    ProxyHandlerUnitTest.class,
    ProxyPacTest.class,
    RemoteControlConfigurationUnitTest.class,
    SeleniumDriverResourceHandlerUnitTest.class,
    SeleniumServerUnitTest.class,
    SingleEntryAsyncQueueUnitTest.class,
    StaticContentHandlerUnitTest.class,
    WindowsProxyManagerUnitTest.class
})
public class RcServerUnitTests {}
