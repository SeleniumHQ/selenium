// <copyright file="JavascriptEnabledBrowserTest.cs" company="Selenium Committers">
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
using NUnit.Framework.Constraints;
using System;
using System.Drawing;

namespace OpenQA.Selenium;

[TestFixture]
public class JavascriptEnabledBrowserTest : DriverTestFixture
{
    [Test]
    public void DocumentShouldReflectLatestTitle()
    {
        driver.Url = javascriptPage;

        Assert.That(driver.Title, Is.EqualTo("Testing Javascript"));
        driver.FindElement(By.LinkText("Change the page title!")).Click();
        Assert.That(driver.Title, Is.EqualTo("Changed"));
    }

    [Test]
    public void DocumentShouldReflectLatestDom()
    {
        driver.Url = javascriptPage;
        String currentText = driver.FindElement(By.XPath("//div[@id='dynamo']")).Text;
        Assert.That(currentText, Is.EqualTo("What's for dinner?"));

        IWebElement element = driver.FindElement(By.LinkText("Update a div"));
        element.Click();

        String newText = driver.FindElement(By.XPath("//div[@id='dynamo']")).Text;
        Assert.That(newText, Is.EqualTo("Fish and chips!"));
    }

    [Test]
    [IgnoreBrowser(Browser.Chrome, "Not working properly in Chrome")]
    [IgnoreBrowser(Browser.Edge, "Not working properly in Edge")]
    public void ShouldWaitForLoadsToCompleteAfterJavascriptCausesANewPageToLoad()
    {
        driver.Url = formsPage;

        driver.FindElement(By.Id("changeme")).Click();
        WaitFor(() => { return driver.Title == "Page3"; }, "Browser title was not 'Page3'");
        Assert.That(driver.Title, Is.EqualTo("Page3"));
    }

    [Test]
    [IgnoreBrowser(Browser.Chrome, "Not working properly in Chrome")]
    [IgnoreBrowser(Browser.Edge, "Not working properly in Edge")]
    public void ShouldBeAbleToFindElementAfterJavascriptCausesANewPageToLoad()
    {
        driver.Url = formsPage;

        driver.FindElement(By.Id("changeme")).Click();

        WaitFor(() => { return driver.Title == "Page3"; }, "Browser title was not 'Page3'");
        Assert.That(driver.FindElement(By.Id("pageNumber")).Text, Is.EqualTo("3"));
    }

    [Test]
    public void ShouldFireOnChangeEventWhenSettingAnElementsValue()
    {
        driver.Url = javascriptPage;
        driver.FindElement(By.Id("change")).SendKeys("foo");
        String result = driver.FindElement(By.Id("result")).Text;

        Assert.That(result, Is.EqualTo("change"));
    }

    [Test]
    public void ShouldBeAbleToSubmitFormsByCausingTheOnClickEventToFire()
    {
        driver.Url = javascriptPage;
        IWebElement element = driver.FindElement(By.Id("jsSubmitButton"));
        element.Click();

        WaitFor(() => { return driver.Title == "We Arrive Here"; }, "Browser title was not 'We Arrive Here'");
        Assert.That(driver.Title, Is.EqualTo("We Arrive Here"));
    }

    [Test]
    public void ShouldBeAbleToClickOnSubmitButtons()
    {
        driver.Url = javascriptPage;
        IWebElement element = driver.FindElement(By.Id("submittingButton"));
        element.Click();

        WaitFor(() => { return driver.Title == "We Arrive Here"; }, "Browser title was not 'We Arrive Here'");
        Assert.That(driver.Title, Is.EqualTo("We Arrive Here"));
    }

    [Test]
    public void Issue80ClickShouldGenerateClickEvent()
    {
        driver.Url = javascriptPage;
        IWebElement element = driver.FindElement(By.Id("clickField"));
        Assert.That(element.GetAttribute("value"), Is.EqualTo("Hello"));

        element.Click();

        Assert.That(element.GetAttribute("value"), Is.EqualTo("Clicked"));
    }

    [Test]
    public void ShouldBeAbleToSwitchToFocusedElement()
    {
        driver.Url = javascriptPage;

        driver.FindElement(By.Id("switchFocus")).Click();

        IWebElement element = driver.SwitchTo().ActiveElement();
        Assert.That(element.GetAttribute("id"), Is.EqualTo("theworks"));
    }

    [Test]
    public void IfNoElementHasFocusTheActiveElementIsTheBody()
    {
        driver.Url = simpleTestPage;

        IWebElement element = driver.SwitchTo().ActiveElement();

        Assert.That(element.GetAttribute("name"), Is.EqualTo("body"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Window demands focus to work.")]
    public void ChangeEventIsFiredAppropriatelyWhenFocusIsLost()
    {
        driver.Url = javascriptPage;

        IWebElement input = driver.FindElement(By.Id("changeable"));
        input.SendKeys("test");
        driver.FindElement(By.Id("clickField")).Click(); // move focus
        EqualConstraint firstConstraint = new EqualConstraint("focus change blur");
        EqualConstraint secondConstraint = new EqualConstraint("focus change blur");


        Assert.That(driver.FindElement(By.Id("result")).Text.Trim(), firstConstraint | secondConstraint);

        input.SendKeys(Keys.Backspace + "t");
        driver.FindElement(By.Id("clickField")).Click();  // move focus

        firstConstraint = new EqualConstraint("focus change blur focus blur");
        secondConstraint = new EqualConstraint("focus blur change focus blur");
        EqualConstraint thirdConstraint = new EqualConstraint("focus blur change focus blur change");
        EqualConstraint fourthConstraint = new EqualConstraint("focus change blur focus change blur"); //What Chrome does
        // I weep.
        Assert.That(driver.FindElement(By.Id("result")).Text.Trim(),
                   firstConstraint | secondConstraint | thirdConstraint | fourthConstraint);
    }

    /**
     * If the click handler throws an exception, the firefox driver freezes. This is suboptimal.
     */
    [Test]
    public void ShouldBeAbleToClickIfEvenSomethingHorribleHappens()
    {
        driver.Url = javascriptPage;

        driver.FindElement(By.Id("error")).Click();

        // If we get this far then the test has passed, but let's do something basic to prove the point
        String text = driver.FindElement(By.Id("error")).Text;

        Assert.That(text, Is.Not.Null);
    }

    [Test]
    public void ShouldBeAbleToGetTheLocationOfAnElement()
    {
        driver.Url = javascriptPage;

        if (!(driver is IJavaScriptExecutor))
        {
            return;
        }

        ((IJavaScriptExecutor)driver).ExecuteScript("window.focus();");
        IWebElement element = driver.FindElement(By.Id("keyUp"));

        if (!(element is ILocatable))
        {
            return;
        }

        Point point = ((ILocatable)element).LocationOnScreenOnceScrolledIntoView;

        Assert.That(point.X, Is.GreaterThan(1));
        Assert.That(point.Y, Is.GreaterThanOrEqualTo(0));
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void ShouldBeAbleToClickALinkThatClosesAWindow()
    {
        driver.Url = javascriptPage;

        String handle = driver.CurrentWindowHandle;
        driver.FindElement(By.Id("new_window")).Click();
        WaitFor(() => { driver.SwitchTo().Window("close_me"); return true; }, "Could not find window with name 'close_me'");

        IWebElement closeElement = WaitFor<IWebElement>(() =>
        {
            try
            {
                return driver.FindElement(By.Id("close"));
            }
            catch (NoSuchElementException)
            {
                return null;
            }
        }, "No element to close window found");
        closeElement.Click();

        driver.SwitchTo().Window(handle);
    }
}
