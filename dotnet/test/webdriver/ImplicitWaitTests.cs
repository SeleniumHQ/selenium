// <copyright file="ImplicitWaitTests.cs" company="Selenium Committers">
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

using System.Collections.ObjectModel;

namespace OpenQA.Selenium.Tests;

[TestFixture]
public class ImplicitWaitTests : DriverTestFixture
{
    [TearDown]
    public void ResetImplicitWaitTimeout()
    {
        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(0);
    }

    [Test]
    public void ShouldImplicitlyWaitForASingleElement()
    {
        Driver.Url = Urls.DynamicPage;
        IWebElement add = Driver.FindElement(By.Id("adder"));

        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(3000);

        add.Click();
        Driver.FindElement(By.Id("box0"));  // All is well if this doesn't throw.
    }

    [Test]
    public void ShouldStillFailToFindAnElementWhenImplicitWaitsAreEnabled()
    {
        Driver.Url = Urls.DynamicPage;
        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(500);
        Assert.That(() => Driver.FindElement(By.Id("box0")), Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    [NeedsFreshDriver]
    public void ShouldReturnAfterFirstAttemptToFindOneAfterDisablingImplicitWaits()
    {
        Driver.Url = Urls.DynamicPage;
        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(3000);
        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(0);
        Assert.That(() => Driver.FindElement(By.Id("box0")), Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    [NeedsFreshDriver]
    public void ShouldImplicitlyWaitUntilAtLeastOneElementIsFoundWhenSearchingForMany()
    {
        Driver.Url = Urls.DynamicPage;
        IWebElement add = Driver.FindElement(By.Id("adder"));

        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(2000);
        add.Click();
        add.Click();

        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.ClassName("redbox"));
        Assert.That(elements, Has.Count.GreaterThanOrEqualTo(1));
    }

    [Test]
    [NeedsFreshDriver]
    public void ShouldStillFailToFindElementsWhenImplicitWaitsAreEnabled()
    {
        Driver.Url = Urls.DynamicPage;

        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(500);
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.ClassName("redbox"));
        Assert.That(elements, Is.Empty);
    }

    [Test]
    [NeedsFreshDriver]
    public void ShouldReturnAfterFirstAttemptToFindManyAfterDisablingImplicitWaits()
    {
        Driver.Url = Urls.DynamicPage;
        IWebElement add = Driver.FindElement(By.Id("adder"));
        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(1100);
        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(0);
        add.Click();
        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(By.ClassName("redbox"));
        Assert.That(elements, Is.Empty);
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Driver does not implement waiting for element visible for interaction")]
    [IgnoreBrowser(Browser.Firefox, "Driver does not implement waiting for element visible for interaction")]
    [IgnoreBrowser(Browser.Safari, "Driver does not implement waiting for element visible for interaction")]
    public void ShouldImplicitlyWaitForAnElementToBeVisibleBeforeInteracting()
    {
        Driver.Url = Urls.DynamicPage;

        IWebElement reveal = Driver.FindElement(By.Id("reveal"));
        IWebElement revealed = Driver.FindElement(By.Id("revealed"));
        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(5000);

        Assert.That(revealed.Displayed, Is.False, "revealed should not be visible");
        reveal.Click();

        try
        {
            revealed.SendKeys("hello world");
            // This is what we want
        }
        catch (ElementNotInteractableException)
        {
            Assert.Fail("Element should have been visible");
        }
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    public void ShouldRetainImplicitlyWaitFromTheReturnedWebDriverOfWindowSwitchTo()
    {
        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(1);
        Driver.Url = Urls.XhtmlTestPage;
        Driver.FindElement(By.Name("windowOne")).Click();

        string originalHandle = Driver.CurrentWindowHandle;
        WaitFor(() => Driver.WindowHandles.Count == 2, "Window handle count was not 2");
        List<string> handles = new List<string>(Driver.WindowHandles);
        handles.Remove(originalHandle);

        IWebDriver newWindow = Driver.SwitchTo().Window(handles[0]);

        DateTime start = DateTime.Now;
        newWindow.FindElements(By.Id("this-crazy-thing-does-not-exist"));
        DateTime end = DateTime.Now;
        TimeSpan time = end - start;

        Driver.Close();
        Driver.SwitchTo().Window(originalHandle);
        Assert.That(time.TotalMilliseconds, Is.GreaterThanOrEqualTo(1000));
    }
}
