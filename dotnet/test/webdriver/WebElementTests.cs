// <copyright file="WebElementTests.cs" company="Selenium Committers">
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
public class WebElementTests : DriverTestFixture
{
    [Test]
    public void ElementShouldImplementWrapsDriver()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement parent = Driver.FindElement(By.Id("containsSomeDiv"));
        Assert.That(parent, Is.InstanceOf<IWrapsDriver>());
    }

    [Test]
    public void ElementShouldReturnOriginDriver()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement parent = Driver.FindElement(By.Id("containsSomeDiv"));
        Assert.That(((IWrapsDriver)parent).WrappedDriver, Is.EqualTo(Driver));
    }

    //------------------------------------------------------------------
    // Tests below here are not included in the Java test suite
    //------------------------------------------------------------------
    [Test]
    public void ShouldToggleElementAndCheckIfElementIsSelected()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement checkbox = Driver.FindElement(By.Id("checkbox1"));
        Assert.That(checkbox.Selected, Is.False);
        checkbox.Click();
        Assert.That(checkbox.Selected, Is.True);
        checkbox.Click();
        Assert.That(checkbox.Selected, Is.False);
    }

    [Test]
    public void ShouldThrowExceptionOnNonExistingElement()
    {
        Driver.Url = Urls.SimpleTestPage;
        Assert.That(() => Driver.FindElement(By.Id("doesnotexist")), Throws.InstanceOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldGetElementName()
    {
        Driver.Url = Urls.SimpleTestPage;

        IWebElement oneliner = Driver.FindElement(By.Id("oneline"));
        Assert.That(oneliner.TagName, Is.EqualTo("p").IgnoreCase);

    }

    [Test]
    public void ShouldGetElementText()
    {
        Driver.Url = Urls.SimpleTestPage;

        IWebElement oneliner = Driver.FindElement(By.Id("oneline"));
        Assert.That(oneliner.Text, Is.EqualTo("A single line of text"));

        IWebElement twoblocks = Driver.FindElement(By.Id("twoblocks"));
        Assert.That(twoblocks.Text, Is.EqualTo("Some text" +
            System.Environment.NewLine +
            "Some more text"));

    }

    [Test]
    public void ShouldReturnWhetherElementIsDisplayed()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement hidden = Driver.FindElement(By.Id("hidden"));
        Assert.That(hidden.Displayed, Is.False, "Element with ID 'hidden' should not be displayed");

        IWebElement none = Driver.FindElement(By.Id("none"));
        Assert.That(none.Displayed, Is.False, "Element with ID 'none' should not be displayed");

        IWebElement displayed = Driver.FindElement(By.Id("displayed"));
        Assert.That(displayed.Displayed, Is.True, "Element with ID 'displayed' should not be displayed");
    }

    [Test]
    public void ShouldClearElement()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement textbox = Driver.FindElement(By.Id("keyUp"));
        textbox.SendKeys("a@#$ç.ó");
        textbox.Clear();
        Assert.That(textbox.GetAttribute("value"), Is.Empty);
    }

    [Test]
    public void ShouldClearRenderedElement()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement textbox = Driver.FindElement(By.Id("keyUp"));
        textbox.SendKeys("a@#$ç.ó");
        textbox.Clear();
        Assert.That(textbox.GetAttribute("value"), Is.Empty);
    }

    [Test]
    public void ShouldSendKeysToElement()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement textbox = Driver.FindElement(By.Id("keyUp"));
        textbox.SendKeys("a@#$ç.ó");
        Assert.That(textbox.GetAttribute("value"), Is.EqualTo("a@#$ç.ó"));
    }

    [Test]
    public void ShouldSubmitElement()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement submit = Driver.FindElement(By.Id("submittingButton"));
        submit.Submit();

        Assert.That(
            () =>
                WaitFor(
                    () => Driver.Url.StartsWith(Urls.ResultPage),
                    "We are not redirected to the resultPage after submitting web element"),
            Throws.Nothing);
    }

    [Test]
    public void ShouldClickLinkElement()
    {
        Driver.Url = Urls.JavascriptPage;
        IWebElement changedDiv = Driver.FindElement(By.Id("dynamo"));
        IWebElement link = Driver.FindElement(By.LinkText("Update a div"));
        link.Click();
        Assert.That(changedDiv.Text, Is.EqualTo("Fish and chips!"));
    }

    [Test]
    public void ShouldGetAttributesFromElement()
    {
        Driver.Url = (Urls.JavascriptPage);

        IWebElement dynamo = Driver.FindElement(By.Id("dynamo"));
        IWebElement mousedown = Driver.FindElement(By.Id("mousedown"));
        Assert.That(mousedown.GetAttribute("id"), Is.EqualTo("mousedown"));
        Assert.That(dynamo.GetAttribute("id"), Is.EqualTo("dynamo"));

    }
}
