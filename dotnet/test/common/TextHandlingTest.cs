// <copyright file="TextHandlingTest.cs" company="Selenium Committers">
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
using System.Text.RegularExpressions;

namespace OpenQA.Selenium;

[TestFixture]
public class TextHandlingTest : DriverTestFixture
{
    private readonly string NewLine = System.Environment.NewLine;

    [Test]
    public void ShouldReturnTheTextContentOfASingleElementWithNoChildren()
    {
        driver.Url = simpleTestPage;
        string selectText = driver.FindElement(By.Id("oneline")).Text;
        Assert.That(selectText, Is.EqualTo("A single line of text"));

        string getText = driver.FindElement(By.Id("oneline")).Text;
        Assert.That(getText, Is.EqualTo("A single line of text"));
    }

    [Test]
    public void ShouldReturnTheEntireTextContentOfChildElements()
    {
        driver.Url = (simpleTestPage);
        string text = driver.FindElement(By.Id("multiline")).Text;

        Assert.That(text, Does.Contain("A div containing"));
        Assert.That(text, Does.Contain("More than one line of text"));
        Assert.That(text, Does.Contain("and block level elements"));
    }

    [Test]
    public void ShouldIgnoreScriptElements()
    {
        driver.Url = javascriptEnhancedForm;
        IWebElement labelForUsername = driver.FindElement(By.Id("labelforusername"));
        string text = labelForUsername.Text;

        Assert.That(labelForUsername.FindElements(By.TagName("script")).Count, Is.EqualTo(1));
        Assert.That(text, Does.Not.Contain("document.getElementById"));
        Assert.That(text, Is.EqualTo("Username:"));
    }

    [Test]
    public void ShouldRepresentABlockLevelElementAsANewline()
    {
        driver.Url = (simpleTestPage);
        string text = driver.FindElement(By.Id("multiline")).Text;

        Assert.That(text, Does.StartWith("A div containing" + NewLine));
        Assert.That(text, Does.Contain("More than one line of text" + NewLine));
        Assert.That(text, Does.EndWith("and block level elements"));
    }

    [Test]
    public void ShouldCollapseMultipleWhitespaceCharactersIntoASingleSpace()
    {
        driver.Url = (simpleTestPage);
        string text = driver.FindElement(By.Id("lotsofspaces")).Text;

        Assert.That(text, Is.EqualTo("This line has lots of spaces."));
    }

    [Test]
    public void ShouldTrimText()
    {
        driver.Url = (simpleTestPage);
        string text = driver.FindElement(By.Id("multiline")).Text;

        Assert.That(text, Does.StartWith("A div containing"));
        Assert.That(text, Does.EndWith("block level elements"));
    }

    [Test]
    public void ShouldConvertANonBreakingSpaceIntoANormalSpaceCharacter()
    {
        driver.Url = (simpleTestPage);
        string text = driver.FindElement(By.Id("nbsp")).Text;

        Assert.That(text, Is.EqualTo("This line has a non-breaking space"));
    }

    [Test]
    public void ShouldNotCollapseANonBreakingSpaces()
    {
        driver.Url = simpleTestPage;
        IWebElement element = driver.FindElement(By.Id("nbspandspaces"));
        string text = element.Text;

        Assert.That(text, Is.EqualTo("This line has a   non-breaking space and spaces"));
    }

    [Test]
    public void ShouldNotTrimNonBreakingSpacesAtTheEndOfALineInTheMiddleOfText()
    {
        driver.Url = simpleTestPage;
        IWebElement element = driver.FindElement(By.Id("multilinenbsp"));
        string text = element.Text;
        string expectedStart = "These lines  " + NewLine;
        Assert.That(text, Does.StartWith(expectedStart));
    }

    [Test]
    public void ShouldNotTrimNonBreakingSpacesAtTheStartOfALineInTheMiddleOfText()
    {
        driver.Url = simpleTestPage;
        IWebElement element = driver.FindElement(By.Id("multilinenbsp"));
        string text = element.Text;
        string expectedContent = NewLine + "  have";
        Assert.That(text, Does.Contain(expectedContent));
    }

    [Test]
    public void ShouldNotTrimTrailingNonBreakingSpacesInMultilineText()
    {
        driver.Url = simpleTestPage;
        IWebElement element = driver.FindElement(By.Id("multilinenbsp"));
        string text = element.Text;
        string expectedEnd = "trailing NBSPs  ";
        Assert.That(text, Does.EndWith(expectedEnd));
    }

    [Test]
    public void HavingInlineElementsShouldNotAffectHowTextIsReturned()
    {
        driver.Url = (simpleTestPage);
        string text = driver.FindElement(By.Id("inline")).Text;
        Assert.That(text, Is.EqualTo("This line has text within elements that are meant to be displayed inline"));
    }

    [Test]
    public void ShouldReturnTheEntireTextOfInlineElements()
    {
        driver.Url = (simpleTestPage);
        string text = driver.FindElement(By.Id("span")).Text;

        Assert.That(text, Is.EqualTo("An inline element"));
    }

    [Test]
    public void ShouldRetainTheFormatingOfTextWithinAPreElement()
    {
        driver.Url = simpleTestPage;
        string text = driver.FindElement(By.Id("preformatted")).Text;

        Assert.That(text, Is.EqualTo("   This section has a preformatted" + NewLine +
            "    text block    " + NewLine +
            "  split in four lines" + NewLine +
            "         "));
    }

    [Test]
    public void ShouldRetainTheFormatingOfTextWithinAPreElementThatIsWithinARegularBlock()
    {
        driver.Url = simpleTestPage;
        string text = driver.FindElement(By.Id("div-with-pre")).Text;
        Assert.That(text, Is.EqualTo("before pre" + NewLine +
            "   This section has a preformatted" + NewLine +
            "    text block    " + NewLine +
            "  split in four lines" + NewLine +
            "         " + NewLine +
            "after pre"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Firefox is doubling the new lines")]
    public void ShouldBeAbleToSetMoreThanOneLineOfTextInATextArea()
    {
        driver.Url = formsPage;
        IWebElement textarea = driver.FindElement(By.Id("withText"));
        textarea.Clear();
        string expectedText = "I like cheese" + NewLine + NewLine + "It's really nice";
        textarea.SendKeys(expectedText);

        string seenText = textarea.GetAttribute("value");
        Assert.That(seenText, Is.EqualTo(expectedText));
    }

    [Test]
    public void ShouldBeAbleToEnterDatesAfterFillingInOtherValuesFirst()
    {
        driver.Url = formsPage;
        IWebElement input = driver.FindElement(By.Id("working"));
        string expectedValue = "10/03/2007 to 30/07/1993";
        input.SendKeys(expectedValue);
        string seenValue = input.GetAttribute("value");

        Assert.That(expectedValue, Is.EqualTo(seenValue));
    }

    [Test]
    public void ShouldReturnEmptyStringWhenTextIsOnlySpaces()
    {
        driver.Url = (xhtmlTestPage);

        string text = driver.FindElement(By.Id("spaces")).Text;
        Assert.That(text, Is.Empty);
    }

    [Test]
    public void ShouldReturnEmptyStringWhenTextIsEmpty()
    {
        driver.Url = (xhtmlTestPage);

        string text = driver.FindElement(By.Id("empty")).Text;
        Assert.That(text, Is.Empty);
    }

    [Test]
    public void ShouldReturnEmptyStringWhenTagIsSelfClosing()
    {
        driver.Url = (xhtmlFormPage);

        string text = driver.FindElement(By.Id("self-closed")).Text;
        Assert.That(text, Is.Empty);
    }

    [Test]
    public void ShouldNotTrimSpacesWhenLineWraps()
    {
        driver.Url = simpleTestPage;

        string text = driver.FindElement(By.XPath("//table/tbody/tr[1]/td[1]")).Text;
        Assert.That(text, Is.EqualTo("beforeSpace afterSpace"));
    }

    [Test]
    public void ShouldHandleSiblingBlockLevelElements()
    {
        driver.Url = simpleTestPage;

        string text = driver.FindElement(By.Id("twoblocks")).Text;

        Assert.That(text, Is.EqualTo("Some text" + NewLine + "Some more text"));
    }

    [Test]
    public void ShouldHandleNestedBlockLevelElements()
    {
        driver.Url = (simpleTestPage);

        string text = driver.FindElement(By.Id("nestedblocks")).Text;

        Assert.That(text, Is.EqualTo("Cheese" + NewLine + "Some text" + NewLine + "Some more text" + NewLine
                            + "and also" + NewLine + "Brie"));
    }

    [Test]
    public void ShouldHandleWhitespaceInInlineElements()
    {
        driver.Url = (simpleTestPage);

        string text = driver.FindElement(By.Id("inlinespan")).Text;

        Assert.That(text, Is.EqualTo("line has text"));
    }

    [Test]
    public void ReadALargeAmountOfData()
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("macbeth.html");
        string source = driver.PageSource.Trim().ToLower();

        Assert.That(source, Does.EndWith("</html>"));
    }

    [Test]
    public void GetTextWithLineBreakForInlineElement()
    {
        driver.Url = simpleTestPage;

        IWebElement label = driver.FindElement(By.Id("label1"));
        string labelText = label.Text;

        Assert.That(new Regex("foo[\\n\\r]+bar").IsMatch(labelText), "Label text '" + labelText + "' did not match regular expression 'foo[\\n\\r]+bar'");
    }

    [Test]
    public void ShouldOnlyIncludeVisibleText()
    {
        driver.Url = javascriptPage;

        string empty = driver.FindElement(By.Id("suppressedParagraph")).Text;
        string explicitText = driver.FindElement(By.Id("outer")).Text;

        Assert.That(empty, Is.Empty);
        Assert.That(explicitText, Is.EqualTo("sub-element that is explicitly visible"));
    }

    [Test]
    public void ShouldGetTextFromTableCells()
    {
        driver.Url = tables;

        IWebElement tr = driver.FindElement(By.Id("hidden_text"));
        String text = tr.Text;

        Assert.That(text, Does.Contain("some text"));
        Assert.That(text, Does.Not.Contain("some more text"));
    }

    [Test]
    public void TextOfAnInputFieldShouldBeEmpty()
    {
        driver.Url = formsPage;
        IWebElement input = driver.FindElement(By.Id("inputWithText"));
        Assert.That(input.Text, Is.Empty);
    }

    [Test]
    public void TextOfATextAreaShouldBeEqualToItsDefaultText()
    {
        driver.Url = formsPage;
        IWebElement area = driver.FindElement(By.Id("withText"));
        Assert.That(area.Text, Is.EqualTo("Example text"));
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Fails on IE")]
    public void TextOfATextAreaShouldBeEqualToItsDefaultTextEvenAfterTyping()
    {
        driver.Url = formsPage;
        IWebElement area = driver.FindElement(By.Id("withText"));
        string oldText = area.Text;
        area.SendKeys("New Text");
        Assert.That(area.Text, Is.EqualTo(oldText));
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Fails on IE")]
    public void TextOfATextAreaShouldBeEqualToItsDefaultTextEvenAfterChangingTheValue()
    {
        driver.Url = formsPage;
        IWebElement area = driver.FindElement(By.Id("withText"));
        string oldText = area.GetAttribute("value");
        ((IJavaScriptExecutor)driver).ExecuteScript("arguments[0].value = arguments[1]", area, "New Text");
        Assert.That(area.Text, Is.EqualTo(oldText));
    }

    [Test]
    public void ShouldGetTextWhichIsAValidJSONObject()
    {
        driver.Url = simpleTestPage;
        IWebElement element = driver.FindElement(By.Id("simpleJsonText"));
        Assert.That(element.Text, Is.EqualTo("{a=\"b\", c=1, d=true}"));
        //assertEquals("{a=\"b\", \"c\"=d, e=true, f=\\123\\\\g\\\\\"\"\"\\\'}", element.getText());
    }

    [Test]
    public void ShouldGetTextWhichIsAValidComplexJSONObject()
    {
        driver.Url = simpleTestPage;
        IWebElement element = driver.FindElement(By.Id("complexJsonText"));
        Assert.That(element.Text, Is.EqualTo("{a=\"\\\\b\\\\\\\"\'\\\'\"}"));
    }

    [Test]
    [IgnoreBrowser(Browser.All, "Hidden LTR Unicode marks are currently returned by WebDriver but shouldn't, issue 4473")]
    public void ShouldNotReturnLtrMarks()
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("utf8/unicode_ltr.html");
        IWebElement element = driver.FindElement(By.Id("EH")).FindElement(By.TagName("nobr"));
        string text = element.Text;
        String expected = "Some notes";
        Assert.That((int)text[0], Is.Not.EqualTo(8206), "RTL mark should not be present");
        // Note: If this assertion fails but the content of the strings *looks* the same
        // it may be because of hidden unicode LTR character being included in the string.
        // That's the reason for the previous assert.
        Assert.That(element.Text, Is.EqualTo(expected));
    }

    [Test]
    [IgnoreBrowser(Browser.All, "Not all unicode whitespace characters are trimmed, issue 6072")]
    public void ShouldTrimTextWithMultiByteWhitespaces()
    {
        driver.Url = simpleTestPage;
        String text = driver.FindElement(By.Id("trimmedSpace")).Text;

        Assert.That(text, Is.EqualTo("test"));
    }

    [Test]
    [IgnoreTarget("net48", "Cannot create inline page with UrlBuilder")]
    public void CanHandleTextThatLooksLikeANumber()
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(
            new InlinePage().WithBody("<div id='point'>12.345</div>",
                                      "<div id='comma'>12,345</div>",
                                      "<div id='space'>12 345</div>"));

        Assert.That(driver.FindElement(By.Id("point")).Text, Is.EqualTo("12.345"));
        Assert.That(driver.FindElement(By.Id("comma")).Text, Is.EqualTo("12,345"));
        Assert.That(driver.FindElement(By.Id("space")).Text, Is.EqualTo("12 345"));
    }

    [Test]
    [IgnoreBrowser(Browser.Safari, "getText does not normalize spaces")]
    public void CanHandleTextTransformProperty()
    {
        driver.Url = simpleTestPage;
        Assert.That(driver.FindElement(By.Id("capitalized")).Text, Is.EqualTo("Hello, World! Bla-Bla-BLA").Or.EqualTo("Hello, World! Bla-bla-BLA"));
        Assert.That(driver.FindElement(By.Id("lowercased")).Text, Is.EqualTo("hello, world! bla-bla-bla"));
        Assert.That(driver.FindElement(By.Id("uppercased")).Text, Is.EqualTo("HELLO, WORLD! BLA-BLA-BLA"));
    }
}
