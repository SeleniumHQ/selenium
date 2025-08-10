// <copyright file="WebElementTest.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium;

[TestFixture]
public class WebElementTest : DriverTestFixture
{
    [Test]
    public void ElementShouldImplementWrapsDriver()
    {
        driver.Url = simpleTestPage;
        IWebElement parent = driver.FindElement(By.Id("containsSomeDiv"));
        Assert.That(parent, Is.InstanceOf<IWrapsDriver>());
    }

    [Test]
    public void ElementShouldReturnOriginDriver()
    {
        driver.Url = simpleTestPage;
        IWebElement parent = driver.FindElement(By.Id("containsSomeDiv"));
        Assert.That(((IWrapsDriver)parent).WrappedDriver, Is.EqualTo(driver));
    }

    //------------------------------------------------------------------
    // Tests below here are not included in the Java test suite
    //------------------------------------------------------------------
    [Test]
    public void ShouldToggleElementAndCheckIfElementIsSelected()
    {
        driver.Url = simpleTestPage;
        IWebElement checkbox = driver.FindElement(By.Id("checkbox1"));
        Assert.That(checkbox.Selected, Is.False);
        checkbox.Click();
        Assert.That(checkbox.Selected, Is.True);
        checkbox.Click();
        Assert.That(checkbox.Selected, Is.False);
    }

    [Test]
    public void ShouldThrowExceptionOnNonExistingElement()
    {
        driver.Url = simpleTestPage;
        Assert.That(() => driver.FindElement(By.Id("doesnotexist")), Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldGetElementName()
    {
        driver.Url = simpleTestPage;

        IWebElement oneliner = driver.FindElement(By.Id("oneline"));
        Assert.That(oneliner.TagName, Is.EqualTo("p").IgnoreCase);

    }

    [Test]
    public void ShouldGetElementText()
    {
        driver.Url = simpleTestPage;

        IWebElement oneliner = driver.FindElement(By.Id("oneline"));
        Assert.That(oneliner.Text, Is.EqualTo("A single line of text"));

        IWebElement twoblocks = driver.FindElement(By.Id("twoblocks"));
        Assert.That(twoblocks.Text, Is.EqualTo("Some text" +
            System.Environment.NewLine +
            "Some more text"));

    }

    [Test]
    public void ShouldReturnWhetherElementIsDisplayed()
    {
        driver.Url = javascriptPage;

        IWebElement hidden = driver.FindElement(By.Id("hidden"));
        Assert.That(hidden.Displayed, Is.False, "Element with ID 'hidden' should not be displayed");

        IWebElement none = driver.FindElement(By.Id("none"));
        Assert.That(none.Displayed, Is.False, "Element with ID 'none' should not be displayed");

        IWebElement displayed = driver.FindElement(By.Id("displayed"));
        Assert.That(displayed.Displayed, Is.True, "Element with ID 'displayed' should not be displayed");
    }

    [Test]
    public void ShouldClearElement()
    {
        driver.Url = javascriptPage;

        IWebElement textbox = driver.FindElement(By.Id("keyUp"));
        textbox.SendKeys("a@#$ç.ó");
        textbox.Clear();
        Assert.That(textbox.GetAttribute("value"), Is.Empty);
    }

    [Test]
    public void ShouldClearRenderedElement()
    {
        driver.Url = javascriptPage;

        IWebElement textbox = driver.FindElement(By.Id("keyUp"));
        textbox.SendKeys("a@#$ç.ó");
        textbox.Clear();
        Assert.That(textbox.GetAttribute("value"), Is.Empty);
    }

    [Test]
    public void ShouldSendKeysToElement()
    {
        driver.Url = javascriptPage;

        IWebElement textbox = driver.FindElement(By.Id("keyUp"));
        textbox.SendKeys("a@#$ç.ó");
        Assert.That(textbox.GetAttribute("value"), Is.EqualTo("a@#$ç.ó"));
    }

    [Test]
    public void ShouldSubmitElement()
    {
        driver.Url = javascriptPage;

        IWebElement submit = driver.FindElement(By.Id("submittingButton"));
        submit.Submit();

        Assert.That(driver.Url, Does.StartWith(resultPage));
    }

    [Test]
    public void ShouldClickLinkElement()
    {
        driver.Url = javascriptPage;
        IWebElement changedDiv = driver.FindElement(By.Id("dynamo"));
        IWebElement link = driver.FindElement(By.LinkText("Update a div"));
        link.Click();
        Assert.That(changedDiv.Text, Is.EqualTo("Fish and chips!"));
    }

    [Test]
    public void ShouldGetAttributesFromElement()
    {
        driver.Url = (javascriptPage);

        IWebElement dynamo = driver.FindElement(By.Id("dynamo"));
        IWebElement mousedown = driver.FindElement(By.Id("mousedown"));
        Assert.That(mousedown.GetAttribute("id"), Is.EqualTo("mousedown"));
        Assert.That(dynamo.GetAttribute("id"), Is.EqualTo("dynamo"));

    }
}
