// <copyright file="SessionHandlingTests.cs" company="Selenium Committers">
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


namespace OpenQA.Selenium.Tests;

[TestFixture]
public class SessionHandlingTests : DriverTestFixture
{
    [Test]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void CallingQuitMoreThanOnceOnASessionIsANoOp()
    {
        Driver.Url = Urls.SimpleTestPage;
        Driver.Quit();
        Driver.Quit();
        Driver = CreateDriverInstance();
        Driver.Url = Urls.XhtmlTestPage;
        Driver.Quit();
    }

    [Test]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void CallingQuitAfterClosingTheLastWindowIsANoOp()
    {
        CloseDriver();
        IWebDriver testDriver = CreateDriverInstance();
        testDriver.Url = Urls.SimpleTestPage;
        testDriver.Close();
        testDriver.Quit();
        testDriver = CreateDriverInstance();
        testDriver.Url = Urls.XhtmlTestPage;
        Assert.That(testDriver.Title, Is.EqualTo("XHTML Test Page"));
        testDriver.Quit();
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Firefox doesn't shut its server down immediately upon calling Close(), so a subsequent call could succeed.")]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void CallingAnyOperationAfterClosingTheLastWindowShouldThrowAnException()
    {
        CloseDriver();
        IWebDriver testDriver = CreateDriverInstance();
        try
        {
            string url = string.Empty;
            testDriver.Url = Urls.SimpleTestPage;
            testDriver.Close();
            Assert.That(() => testDriver.Url == Urls.FormsPage, Throws.InstanceOf<WebDriverException>().Or.InstanceOf<InvalidOperationException>());
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
        CloseDriver();
        IWebDriver testDriver = CreateDriverInstance();
        try
        {
            string url = string.Empty;
            testDriver.Url = Urls.SimpleTestPage;
            testDriver.Quit();
            Assert.That(() => testDriver.Url == Urls.FormsPage, Throws.InstanceOf<WebDriverException>().Or.InstanceOf<InvalidOperationException>());
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
        CloseDriver();
        IWebDriver testDriver = CreateDriverInstance();
        testDriver.Url = Urls.SimpleTestPage;
        testDriver.Close();
        testDriver.Dispose();
        testDriver = CreateDriverInstance();
        testDriver.Url = Urls.XhtmlTestPage;
        Assert.That(testDriver.Title, Is.EqualTo("XHTML Test Page"));
        testDriver.Close();
        testDriver.Dispose();
    }

    [Test]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void ShouldBeAbleToDisposeOfDriver()
    {
        CloseDriver();
        IWebDriver testDriver = CreateDriverInstance();
        testDriver.Url = Urls.SimpleTestPage;
        testDriver.Dispose();
    }

    [Test]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void ShouldBeAbleToCallDisposeConsecutively()
    {
        CloseDriver();
        IWebDriver testDriver = CreateDriverInstance();
        testDriver.Url = Urls.SimpleTestPage;
        testDriver.Dispose();
        testDriver.Dispose();
    }

    [Test]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void ShouldBeAbleToCallDisposeAfterQuit()
    {
        CloseDriver();
        IWebDriver testDriver = CreateDriverInstance();
        testDriver.Url = Urls.SimpleTestPage;
        testDriver.Quit();
        testDriver.Dispose();
        testDriver = CreateDriverInstance();
        testDriver.Url = Urls.XhtmlTestPage;
        Assert.That(testDriver.Title, Is.EqualTo("XHTML Test Page"));
        testDriver.Quit();
    }

    [Test]
    public void ShouldOpenAndCloseBrowserRepeatedly()
    {
        for (int i = 0; i < 5; i++)
        {
            CreateFreshDriver();
            Driver.Url = Urls.SimpleTestPage;
            Assert.That(Driver.Title, Is.EqualTo("Hello WebDriver"));
        }
    }
}
