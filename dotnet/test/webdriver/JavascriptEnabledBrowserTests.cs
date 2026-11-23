// <copyright file="JavascriptEnabledBrowserTests.cs" company="Selenium Committers">
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

using System.Drawing;
using NUnit.Framework.Constraints;

namespace OpenQA.Selenium.Tests;

[TestFixture]
public class JavascriptEnabledBrowserTests : DriverTestFixture
{
    [Test]
    public void DocumentShouldReflectLatestTitle()
    {
        Driver.Url = Urls.JavascriptPage;

        Assert.That(Driver.Title, Is.EqualTo("Testing Javascript"));
        Driver.FindElement(By.LinkText("Change the page title!")).Click();
        Assert.That(Driver.Title, Is.EqualTo("Changed"));
    }

    [Test]
    public void DocumentShouldReflectLatestDom()
    {
        Driver.Url = Urls.JavascriptPage;
        String currentText = Driver.FindElement(By.XPath("//div[@id='dynamo']")).Text;
        Assert.That(currentText, Is.EqualTo("What's for dinner?"));

        IWebElement element = Driver.FindElement(By.LinkText("Update a div"));
        element.Click();

        String newText = Driver.FindElement(By.XPath("//div[@id='dynamo']")).Text;
        Assert.That(newText, Is.EqualTo("Fish and chips!"));
    }

    [Test]
    [IgnoreBrowser(Browser.Chrome, "Not working properly in Chrome")]
    [IgnoreBrowser(Browser.Edge, "Not working properly in Edge")]
    public void ShouldWaitForLoadsToCompleteAfterJavascriptCausesANewPageToLoad()
    {
        Driver.Url = Urls.FormsPage;

        Driver.FindElement(By.Id("changeme")).Click();
        WaitFor(() => { return Driver.Title == "Page3"; }, "Browser title was not 'Page3'");
        Assert.That(Driver.Title, Is.EqualTo("Page3"));
    }

    [Test]
    [IgnoreBrowser(Browser.Chrome, "Not working properly in Chrome")]
    [IgnoreBrowser(Browser.Edge, "Not working properly in Edge")]
    public void ShouldBeAbleToFindElementAfterJavascriptCausesANewPageToLoad()
    {
        Driver.Url = Urls.FormsPage;

        Driver.FindElement(By.Id("changeme")).Click();

        WaitFor(() => { return Driver.Title == "Page3"; }, "Browser title was not 'Page3'");
        Assert.That(Driver.FindElement(By.Id("pageNumber")).Text, Is.EqualTo("3"));
    }

    [Test]
    public void ShouldFireOnChangeEventWhenSettingAnElementsValue()
    {
        Driver.Url = Urls.JavascriptPage;
        Driver.FindElement(By.Id("change")).SendKeys("foo");
        String result = Driver.FindElement(By.Id("result")).Text;

        Assert.That(result, Is.EqualTo("change"));
    }

    [Test]
    public void ShouldBeAbleToSubmitFormsByCausingTheOnClickEventToFire()
    {
        Driver.Url = Urls.JavascriptPage;
        IWebElement element = Driver.FindElement(By.Id("jsSubmitButton"));
        element.Click();

        WaitFor(() => { return Driver.Title == "We Arrive Here"; }, "Browser title was not 'We Arrive Here'");
        Assert.That(Driver.Title, Is.EqualTo("We Arrive Here"));
    }

    [Test]
    public void ShouldBeAbleToClickOnSubmitButtons()
    {
        Driver.Url = Urls.JavascriptPage;
        IWebElement element = Driver.FindElement(By.Id("submittingButton"));
        element.Click();

        WaitFor(() => { return Driver.Title == "We Arrive Here"; }, "Browser title was not 'We Arrive Here'");
        Assert.That(Driver.Title, Is.EqualTo("We Arrive Here"));
    }

    [Test]
    public void Issue80ClickShouldGenerateClickEvent()
    {
        Driver.Url = Urls.JavascriptPage;
        IWebElement element = Driver.FindElement(By.Id("clickField"));
        Assert.That(element.GetAttribute("value"), Is.EqualTo("Hello"));

        element.Click();

        Assert.That(element.GetAttribute("value"), Is.EqualTo("Clicked"));
    }

    [Test]
    public void ShouldBeAbleToSwitchToFocusedElement()
    {
        Driver.Url = Urls.JavascriptPage;

        Driver.FindElement(By.Id("switchFocus")).Click();

        IWebElement element = Driver.SwitchTo().ActiveElement();
        Assert.That(element.GetAttribute("id"), Is.EqualTo("theworks"));
    }

    [Test]
    public void IfNoElementHasFocusTheActiveElementIsTheBody()
    {
        Driver.Url = Urls.SimpleTestPage;

        IWebElement element = Driver.SwitchTo().ActiveElement();

        Assert.That(element.GetAttribute("name"), Is.EqualTo("body"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Window demands focus to work.")]
    public void ChangeEventIsFiredAppropriatelyWhenFocusIsLost()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement input = Driver.FindElement(By.Id("changeable"));
        input.SendKeys("test");
        Driver.FindElement(By.Id("clickField")).Click(); // move focus
        EqualConstraint firstConstraint = new EqualConstraint("focus change blur");
        EqualConstraint secondConstraint = new EqualConstraint("focus change blur");

        Assert.That(Driver.FindElement(By.Id("result")).Text.Trim(), firstConstraint | secondConstraint);

        input.SendKeys(Keys.Backspace + "t");
        Driver.FindElement(By.Id("clickField")).Click();  // move focus

        firstConstraint = new EqualConstraint("focus change blur focus blur");
        secondConstraint = new EqualConstraint("focus blur change focus blur");
        EqualConstraint thirdConstraint = new EqualConstraint("focus blur change focus blur change");
        EqualConstraint fourthConstraint = new EqualConstraint("focus change blur focus change blur"); //What Chrome does
        // I weep.
        Assert.That(Driver.FindElement(By.Id("result")).Text.Trim(),
                   firstConstraint | secondConstraint | thirdConstraint | fourthConstraint);
    }

    /**
     * If the click handler throws an exception, the firefox driver freezes. This is suboptimal.
     */
    [Test]
    public void ShouldBeAbleToClickIfEvenSomethingHorribleHappens()
    {
        Driver.Url = Urls.JavascriptPage;

        Driver.FindElement(By.Id("error")).Click();

        // If we get this far then the test has passed, but let's do something basic to prove the point
        String text = Driver.FindElement(By.Id("error")).Text;

        Assert.That(text, Is.Not.Null);
    }

    [Test]
    public void ShouldBeAbleToGetTheLocationOfAnElement()
    {
        Driver.Url = Urls.JavascriptPage;

        if (!(Driver is IJavaScriptExecutor))
        {
            return;
        }

        ((IJavaScriptExecutor)Driver).ExecuteScript("window.focus();");
        IWebElement element = Driver.FindElement(By.Id("keyUp"));

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
        Driver.Url = Urls.JavascriptPage;

        String handle = Driver.CurrentWindowHandle;
        Driver.FindElement(By.Id("new_window")).Click();
        WaitFor(() => { Driver.SwitchTo().Window("close_me"); return true; }, "Could not find window with name 'close_me'");

        IWebElement closeElement = WaitFor<IWebElement>(() =>
        {
            try
            {
                return Driver.FindElement(By.Id("close"));
            }
            catch (NoSuchElementException)
            {
                return null;
            }
        }, "No element to close window found");
        closeElement.Click();

        Driver.SwitchTo().Window(handle);
    }
}
