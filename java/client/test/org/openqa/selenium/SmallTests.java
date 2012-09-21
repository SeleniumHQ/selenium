/*
Copyright 2011 Selenium committers

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
package org.openqa.selenium;

import org.openqa.selenium.interactions.ActionsTest;
import org.openqa.selenium.interactions.CompositeActionTest;
import org.openqa.selenium.interactions.IndividualKeyboardActionsTest;
import org.openqa.selenium.interactions.IndividualMouseActionsTest;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.openqa.selenium.internal.Base64EncoderTest;
import org.openqa.selenium.io.FileHandlerTest;
import org.openqa.selenium.io.TemporaryFilesystemTest;
import org.openqa.selenium.io.ZipTest;
import org.openqa.selenium.logging.LoggingTest;
import org.openqa.selenium.logging.PerformanceLoggingMockTest;
import org.openqa.selenium.net.NetworkUtilsTest;
import org.openqa.selenium.os.CommandLineTest;
import org.openqa.selenium.os.WindowsUtilsUnitTest;
import org.openqa.selenium.testing.IgnoreComparitorUnitTest;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    ActionsTest.class,
    Base64EncoderTest.class,
    ByTest.class,
    CommandLineTest.class,
    CookieTest.class,
    CompositeActionTest.class,
    DimensionTest.class,
    FileHandlerTest.class,
    IgnoreComparitorUnitTest.class,
    IndividualKeyboardActionsTest.class,
    IndividualMouseActionsTest.class,
    LoggingTest.class,
    NetworkUtilsTest.class,
    OutputTypeTest.class,
    PerformanceLoggingMockTest.class,
    PlatformTest.class,
    PointTest.class,
    ProxyTest.class,
    TemporaryFilesystemTest.class,
    WebDriverExceptionTest.class,
    WindowsUtilsUnitTest.class,
    ZipTest.class,

    org.openqa.selenium.v1.SmallTests.class
})
public class SmallTests {}
