// <copyright file="ContentEditableTests.cs" company="Selenium Committers">
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
public class ContentEditableTests : DriverTestFixture
{
    [TearDown]
    public void SwitchToDefaultContent()
    {
        Driver.SwitchTo().DefaultContent();
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Browser does not automatically focus body element in frame")]
    public void TypingIntoAnIFrameWithContentEditableOrDesignModeSet()
    {
        Driver.Url = Urls.RichTextPage;

        Driver.SwitchTo().Frame("editFrame");
        IWebElement element = Driver.SwitchTo().ActiveElement();
        element.SendKeys("Fishy");

        Driver.SwitchTo().DefaultContent();
        IWebElement trusted = Driver.FindElement(By.Id("istrusted"));
        IWebElement id = Driver.FindElement(By.Id("tagId"));

        // Chrome does not set a trusted flag.
        Assert.That(trusted.Text, Is.AnyOf("[true]", "[n/a]", "[]"));
        Assert.That(id.Text, Is.AnyOf("[frameHtml]", "[theBody]"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Browser does not automatically focus body element in frame")]
    [IgnoreBrowser(Browser.Safari, "Non-printable characters do not navigate within element")]
    public void NonPrintableCharactersShouldWorkWithContentEditableOrDesignModeSet()
    {
        Driver.Url = Urls.RichTextPage;

        Driver.SwitchTo().Frame("editFrame");
        IWebElement element = Driver.SwitchTo().ActiveElement();
        element.SendKeys("Dishy" + Keys.Backspace + Keys.Left + Keys.Left);
        element.SendKeys(Keys.Left + Keys.Left + "F" + Keys.Delete + Keys.End + "ee!");

        Assert.That(element.Text, Is.EqualTo("Fishee!"));
    }

    [Test]
    public void ShouldBeAbleToTypeIntoEmptyContentEditableElement()
    {
        Driver.Url = Urls.ReadOnlyPage;
        IWebElement editable = Driver.FindElement(By.Id("content-editable-blank"));

        editable.SendKeys("cheese");

        Assert.That(editable.Text, Is.EqualTo("cheese"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Driver prepends text in contentEditable areas")]
    [IgnoreBrowser(Browser.Safari, "Driver prepends text to contentEditable areas")]
    public void ShouldBeAbleToTypeIntoContentEditableElementWithExistingValue()
    {
        Driver.Url = Urls.ReadOnlyPage;
        IWebElement editable = Driver.FindElement(By.Id("content-editable"));

        String initialText = editable.Text;
        editable.SendKeys(", edited");

        Assert.That(editable.Text, Is.EqualTo(initialText + ", edited"));
    }

    [Test]
    [IgnoreBrowser(Browser.Chrome, "Typing into rich text editors broken since 149")]
    [IgnoreBrowser(Browser.Edge, "Typing into rich text editors broken since 149")]
    public void ShouldBeAbleToTypeIntoTinyMCE()
    {
        Driver.Url = Urls.WhereIs("tinymce.html");
        Driver.SwitchTo().Frame("mce_0_ifr");

        IWebElement editable = Driver.FindElement(By.Id("tinymce"));

        editable.Clear();
        editable.SendKeys("cheese"); // requires focus on OS X

        Assert.That(editable.Text, Is.EqualTo("cheese"));
    }

    [Test]
    [IgnoreBrowser(Browser.Chrome, "Typing into rich text editors broken since 149")]
    [IgnoreBrowser(Browser.Edge, "Typing into rich text editors broken since 149")]
    [IgnoreBrowser(Browser.Firefox, "Driver prepends text in contentEditable areas")]
    [IgnoreBrowser(Browser.IE, "Prepends text")]
    [IgnoreBrowser(Browser.Safari, "Driver prepends text to contentEditable areas")]
    public void ShouldAppendToTinyMCE()
    {
        Driver.Url = Urls.WhereIs("tinymce.html");
        Driver.SwitchTo().Frame("mce_0_ifr");

        IWebElement editable = Driver.FindElement(By.Id("tinymce"));

        editable.SendKeys(" and cheese"); // requires focus on OS X
        WaitFor(() => editable.Text != "Initial content", "Text remained the original text");

        Assert.That(editable.Text, Is.EqualTo("Initial content and cheese"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Browser does not automatically focus body element in frame")]
    [IgnoreBrowser(Browser.Safari, "Driver prepends text to contentEditable areas")]
    public void AppendsTextToEndOfContentEditableWithMultipleTextNodes()
    {
        Driver.Url = Urls.WhereIs("content-editable.html");
        IWebElement input = Driver.FindElement(By.Id("editable"));
        input.SendKeys(", world!");
        WaitFor(() => input.Text != "Why hello", "Text remained the original text");
        Assert.That(input.Text, Is.EqualTo("Why hello, world!"));
    }
}
