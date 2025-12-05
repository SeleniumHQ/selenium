// <copyright file="SessionHandlingTest.cs" company="Selenium Committers">
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
// </copyright>

using NUnit.Framework;
using OpenQA.Selenium.Environment;
using System;

namespace OpenQA.Selenium;

[TestFixture]
public class SessionHandlingTest : DriverTestFixture
{
    [Test]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void CallingQuitMoreThanOnceOnASessionIsANoOp()
    {
        driver.Url = simpleTestPage;
        driver.Quit();
        driver.Quit();
        driver = EnvironmentManager.Instance.CreateDriverInstance();
        driver.Url = xhtmlTestPage;
        driver.Quit();
    }

    [Test]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void CallingQuitAfterClosingTheLastWindowIsANoOp()
    {
        EnvironmentManager.Instance.CloseCurrentDriver();
        IWebDriver testDriver = EnvironmentManager.Instance.CreateDriverInstance();
        testDriver.Url = simpleTestPage;
        testDriver.Close();
        testDriver.Quit();
        testDriver = EnvironmentManager.Instance.CreateDriverInstance();
        testDriver.Url = xhtmlTestPage;
        Assert.That(testDriver.Title, Is.EqualTo("XHTML Test Page"));
        testDriver.Quit();
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Firefox doesn't shut its server down immediately upon calling Close(), so a subsequent call could succeed.")]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void CallingAnyOperationAfterClosingTheLastWindowShouldThrowAnException()
    {
        EnvironmentManager.Instance.CloseCurrentDriver();
        IWebDriver testDriver = EnvironmentManager.Instance.CreateDriverInstance();
        try
        {
            string url = string.Empty;
            testDriver.Url = simpleTestPage;
            testDriver.Close();
            Assert.That(() => testDriver.Url == formsPage, Throws.InstanceOf<WebDriverException>().Or.InstanceOf<InvalidOperationException>());
        }
        finally
        {
            testDriver.Dispose();
        }
    }

    [Test]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void CallingAnyOperationAfterQuitShouldThrowAnException()
    {
        EnvironmentManager.Instance.CloseCurrentDriver();
        IWebDriver testDriver = EnvironmentManager.Instance.CreateDriverInstance();
        try
        {
            string url = string.Empty;
            testDriver.Url = simpleTestPage;
            testDriver.Quit();
            Assert.That(() => testDriver.Url == formsPage, Throws.InstanceOf<WebDriverException>().Or.InstanceOf<InvalidOperationException>());
        }
        finally
        {
            testDriver.Dispose();
        }
    }

    //------------------------------------------------------------------
    // Tests below here are not included in the Java test suite
    //------------------------------------------------------------------
    [Test]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void ShouldBeAbleToStartNewDriverAfterCallingCloseOnOnlyOpenWindow()
    {
        EnvironmentManager.Instance.CloseCurrentDriver();
        IWebDriver testDriver = EnvironmentManager.Instance.CreateDriverInstance();
        testDriver.Url = simpleTestPage;
        testDriver.Close();
        testDriver.Dispose();
        testDriver = EnvironmentManager.Instance.CreateDriverInstance();
        testDriver.Url = xhtmlTestPage;
        Assert.That(testDriver.Title, Is.EqualTo("XHTML Test Page"));
        testDriver.Close();
        testDriver.Dispose();
    }

    [Test]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void ShouldBeAbleToDisposeOfDriver()
    {
        EnvironmentManager.Instance.CloseCurrentDriver();
        IWebDriver testDriver = EnvironmentManager.Instance.CreateDriverInstance();
        testDriver.Url = simpleTestPage;
        testDriver.Dispose();
    }

    [Test]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void ShouldBeAbleToCallDisposeConsecutively()
    {
        EnvironmentManager.Instance.CloseCurrentDriver();
        IWebDriver testDriver = EnvironmentManager.Instance.CreateDriverInstance();
        testDriver.Url = simpleTestPage;
        testDriver.Dispose();
        testDriver.Dispose();
    }

    [Test]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void ShouldBeAbleToCallDisposeAfterQuit()
    {
        EnvironmentManager.Instance.CloseCurrentDriver();
        IWebDriver testDriver = EnvironmentManager.Instance.CreateDriverInstance();
        testDriver.Url = simpleTestPage;
        testDriver.Quit();
        testDriver.Dispose();
        testDriver = EnvironmentManager.Instance.CreateDriverInstance();
        testDriver.Url = xhtmlTestPage;
        Assert.That(testDriver.Title, Is.EqualTo("XHTML Test Page"));
        testDriver.Quit();
    }

    [Test]
    public void ShouldOpenAndCloseBrowserRepeatedly()
    {
        for (int i = 0; i < 5; i++)
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            CreateFreshDriver();
            driver.Url = simpleTestPage;
            Assert.That(driver.Title, Is.EqualTo(simpleTestTitle));
        }
    }
}
