// <copyright file="ContentEditableTest.cs" company="Selenium Committers">
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
public class ContentEditableTest : DriverTestFixture
{
    [TearDown]
    public void SwitchToDefaultContent()
    {
        driver.SwitchTo().DefaultContent();
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Browser does not automatically focus body element in frame")]
    public void TypingIntoAnIFrameWithContentEditableOrDesignModeSet()
    {
        driver.Url = richTextPage;

        driver.SwitchTo().Frame("editFrame");
        IWebElement element = driver.SwitchTo().ActiveElement();
        element.SendKeys("Fishy");

        driver.SwitchTo().DefaultContent();
        IWebElement trusted = driver.FindElement(By.Id("istrusted"));
        IWebElement id = driver.FindElement(By.Id("tagId"));

        // Chrome does not set a trusted flag.
        Assert.That(trusted.Text, Is.AnyOf("[true]", "[n/a]", "[]"));
        Assert.That(id.Text, Is.AnyOf("[frameHtml]", "[theBody]"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Browser does not automatically focus body element in frame")]
    [IgnoreBrowser(Browser.Safari, "Non-printable characters do not navigate within element")]
    public void NonPrintableCharactersShouldWorkWithContentEditableOrDesignModeSet()
    {
        driver.Url = richTextPage;

        driver.SwitchTo().Frame("editFrame");
        IWebElement element = driver.SwitchTo().ActiveElement();
        element.SendKeys("Dishy" + Keys.Backspace + Keys.Left + Keys.Left);
        element.SendKeys(Keys.Left + Keys.Left + "F" + Keys.Delete + Keys.End + "ee!");

        Assert.That(element.Text, Is.EqualTo("Fishee!"));
    }

    [Test]
    public void ShouldBeAbleToTypeIntoEmptyContentEditableElement()
    {
        driver.Url = readOnlyPage;
        IWebElement editable = driver.FindElement(By.Id("content-editable-blank"));

        editable.SendKeys("cheese");

        Assert.That(editable.Text, Is.EqualTo("cheese"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Driver prepends text in contentEditable areas")]
    [IgnoreBrowser(Browser.Safari, "Driver prepends text to contentEditable areas")]
    public void ShouldBeAbleToTypeIntoContentEditableElementWithExistingValue()
    {
        driver.Url = readOnlyPage;
        IWebElement editable = driver.FindElement(By.Id("content-editable"));

        String initialText = editable.Text;
        editable.SendKeys(", edited");

        Assert.That(editable.Text, Is.EqualTo(initialText + ", edited"));
    }

    [Test]
    public void ShouldBeAbleToTypeIntoTinyMCE()
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("tinymce.html");
        driver.SwitchTo().Frame("mce_0_ifr");

        IWebElement editable = driver.FindElement(By.Id("tinymce"));

        editable.Clear();
        editable.SendKeys("cheese"); // requires focus on OS X

        Assert.That(editable.Text, Is.EqualTo("cheese"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Driver prepends text in contentEditable areas")]
    [IgnoreBrowser(Browser.IE, "Prepends text")]
    [IgnoreBrowser(Browser.Safari, "Driver prepends text to contentEditable areas")]
    public void ShouldAppendToTinyMCE()
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("tinymce.html");
        driver.SwitchTo().Frame("mce_0_ifr");

        IWebElement editable = driver.FindElement(By.Id("tinymce"));

        editable.SendKeys(" and cheese"); // requires focus on OS X
        WaitFor(() => editable.Text != "Initial content", "Text remained the original text");

        Assert.That(editable.Text, Is.EqualTo("Initial content and cheese"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Browser does not automatically focus body element in frame")]
    [IgnoreBrowser(Browser.Safari, "Driver prepends text to contentEditable areas")]
    public void AppendsTextToEndOfContentEditableWithMultipleTextNodes()
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("content-editable.html");
        IWebElement input = driver.FindElement(By.Id("editable"));
        input.SendKeys(", world!");
        WaitFor(() => input.Text != "Why hello", "Text remained the original text");
        Assert.That(input.Text, Is.EqualTo("Why hello, world!"));
    }
}
