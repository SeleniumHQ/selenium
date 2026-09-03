// <copyright file="TypingTests.cs" company="Selenium Committers">
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

using System.Runtime.InteropServices;

namespace OpenQA.Selenium.Tests;

[TestFixture]
public class TypingTests : DriverTestFixture
{
    [Test]
    public void ShouldFireKeyPressEvents()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement keyReporter = Driver.FindElement(By.Id("keyReporter"));
        keyReporter.SendKeys("a");

        IWebElement result = Driver.FindElement(By.Id("result"));
        string text = result.Text;
        Assert.That(text, Does.Contain("press:"));
    }

    [Test]
    public void ShouldFireKeyDownEvents()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement keyReporter = Driver.FindElement(By.Id("keyReporter"));
        keyReporter.SendKeys("I");

        IWebElement result = Driver.FindElement(By.Id("result"));
        string text = result.Text;
        Assert.That(text, Does.Contain("down:"));
    }

    [Test]
    public void ShouldFireKeyUpEvents()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement keyReporter = Driver.FindElement(By.Id("keyReporter"));
        keyReporter.SendKeys("a");

        IWebElement result = Driver.FindElement(By.Id("result"));
        string text = result.Text;
        Assert.That(text, Does.Contain("up:"));
    }

    [Test]
    public void ShouldTypeLowerCaseLetters()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement keyReporter = Driver.FindElement(By.Id("keyReporter"));
        keyReporter.SendKeys("abc def");

        Assert.That(keyReporter.GetAttribute("value"), Is.EqualTo("abc def"));
    }

    [Test]
    public void ShouldBeAbleToTypeCapitalLetters()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement keyReporter = Driver.FindElement(By.Id("keyReporter"));
        keyReporter.SendKeys("ABC DEF");

        Assert.That(keyReporter.GetAttribute("value"), Is.EqualTo("ABC DEF"));
    }

    [Test]
    public void ShouldBeAbleToTypeQuoteMarks()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement keyReporter = Driver.FindElement(By.Id("keyReporter"));
        keyReporter.SendKeys("\"");

        Assert.That(keyReporter.GetAttribute("value"), Is.EqualTo("\""));
    }

    [Test]
    public void ShouldBeAbleToTypeTheAtCharacter()
    {
        // simon: I tend to use a US/UK or AUS keyboard layout with English
        // as my primary language. There are consistent reports that we're
        // not handling i18nised keyboards properly. This test exposes this
        // in a lightweight manner when my keyboard is set to the DE mapping
        // and we're using IE.

        Driver.Url = Urls.JavascriptPage;

        IWebElement keyReporter = Driver.FindElement(By.Id("keyReporter"));
        keyReporter.SendKeys("@");

        Assert.That(keyReporter.GetAttribute("value"), Is.EqualTo("@"));
    }

    [Test]
    public void ShouldBeAbleToMixUpperAndLowerCaseLetters()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement keyReporter = Driver.FindElement(By.Id("keyReporter"));
        keyReporter.SendKeys("me@eXample.com");

        Assert.That(keyReporter.GetAttribute("value"), Is.EqualTo("me@eXample.com"));
    }

    [Test]
    public void ArrowKeysShouldNotBePrintable()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement keyReporter = Driver.FindElement(By.Id("keyReporter"));
        keyReporter.SendKeys(Keys.ArrowLeft);

        Assert.That(keyReporter.GetAttribute("value"), Is.Empty);
    }

    [Test]
    public void ShouldBeAbleToUseArrowKeys()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement keyReporter = Driver.FindElement(By.Id("keyReporter"));
        keyReporter.SendKeys("Tet" + Keys.ArrowLeft + "s");

        Assert.That(keyReporter.GetAttribute("value"), Is.EqualTo("Test"));
    }

    [Test]
    public void WillSimulateAKeyUpWhenEnteringTextIntoInputElements()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("keyUp"));
        element.SendKeys("I like cheese");

        IWebElement result = Driver.FindElement(By.Id("result"));
        Assert.That(result.Text, Is.EqualTo("I like cheese"));
    }

    [Test]
    public void WillSimulateAKeyDownWhenEnteringTextIntoInputElements()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("keyDown"));
        element.SendKeys("I like cheese");

        IWebElement result = Driver.FindElement(By.Id("result"));
        // Because the key down gets the result before the input element is
        // filled, we're a letter short here
        Assert.That(result.Text, Is.EqualTo("I like chees"));
    }

    [Test]
    public void WillSimulateAKeyPressWhenEnteringTextIntoInputElements()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("keyPress"));
        element.SendKeys("I like cheese");

        IWebElement result = Driver.FindElement(By.Id("result"));
        // Because the key down gets the result before the input element is
        // filled, we're a letter short here
        Assert.That(result.Text, Is.EqualTo("I like chees"));
    }

    [Test]
    public void WillSimulateAKeyUpWhenEnteringTextIntoTextAreas()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("keyUpArea"));
        element.SendKeys("I like cheese");

        IWebElement result = Driver.FindElement(By.Id("result"));
        Assert.That(result.Text, Is.EqualTo("I like cheese"));
    }

    [Test]
    public void WillSimulateAKeyDownWhenEnteringTextIntoTextAreas()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("keyDownArea"));
        element.SendKeys("I like cheese");

        IWebElement result = Driver.FindElement(By.Id("result"));
        // Because the key down gets the result before the input element is
        // filled, we're a letter short here
        Assert.That(result.Text, Is.EqualTo("I like chees"));
    }

    [Test]
    public void WillSimulateAKeyPressWhenEnteringTextIntoTextAreas()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("keyPressArea"));
        element.SendKeys("I like cheese");

        IWebElement result = Driver.FindElement(By.Id("result"));
        // Because the key down gets the result before the input element is
        // filled, we're a letter short here
        Assert.That(result.Text, Is.EqualTo("I like chees"));
    }

    [Test]
    public void ShouldFireFocusKeyEventsInTheRightOrder()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement result = Driver.FindElement(By.Id("result"));
        IWebElement element = Driver.FindElement(By.Id("theworks"));

        element.SendKeys("a");
        Assert.That(result.Text.Trim(), Is.EqualTo("focus keydown keypress keyup"));
    }

    [Test]
    public void ShouldReportKeyCodeOfArrowKeys()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement result = Driver.FindElement(By.Id("result"));
        IWebElement element = Driver.FindElement(By.Id("keyReporter"));

        element.SendKeys(Keys.ArrowDown);
        CheckRecordedKeySequence(result, 40);

        element.SendKeys(Keys.ArrowUp);
        CheckRecordedKeySequence(result, 38);

        element.SendKeys(Keys.ArrowLeft);
        CheckRecordedKeySequence(result, 37);

        element.SendKeys(Keys.ArrowRight);
        CheckRecordedKeySequence(result, 39);

        // And leave no rubbish/printable keys in the "keyReporter"
        Assert.That(element.GetAttribute("value"), Is.Empty);
    }

    [Test]
    public void ShouldReportKeyCodeOfArrowKeysUpDownEvents()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement result = Driver.FindElement(By.Id("result"));
        IWebElement element = Driver.FindElement(By.Id("keyReporter"));

        element.SendKeys(Keys.ArrowDown);
        string text = result.Text.Trim();
        Assert.That(text, Does.Contain("down: 40"));
        Assert.That(text, Does.Contain("up: 40"));

        element.SendKeys(Keys.ArrowUp);
        text = result.Text.Trim();
        Assert.That(text, Does.Contain("down: 38"));
        Assert.That(text, Does.Contain("up: 38"));

        element.SendKeys(Keys.ArrowLeft);
        text = result.Text.Trim();
        Assert.That(text, Does.Contain("down: 37"));
        Assert.That(text, Does.Contain("up: 37"));

        element.SendKeys(Keys.ArrowRight);
        text = result.Text.Trim();
        Assert.That(text, Does.Contain("down: 39"));
        Assert.That(text, Does.Contain("up: 39"));

        // And leave no rubbish/printable keys in the "keyReporter"
        Assert.That(element.GetAttribute("value"), Is.Empty);
    }

    [Test]
    public void NumericNonShiftKeys()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("keyReporter"));

        string numericLineCharsNonShifted = "`1234567890-=[]\\;,.'/42";
        element.SendKeys(numericLineCharsNonShifted);

        Assert.That(element.GetAttribute("value"), Is.EqualTo(numericLineCharsNonShifted));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/646")]
    public void NumericShiftKeys()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement result = Driver.FindElement(By.Id("result"));
        IWebElement element = Driver.FindElement(By.Id("keyReporter"));

        string numericShiftsEtc = "~!@#$%^&*()_+{}:\"<>?|END~";
        element.SendKeys(numericShiftsEtc);

        Assert.That(element.GetAttribute("value"), Is.EqualTo(numericShiftsEtc));
        string text = result.Text.Trim();
        Assert.That(text, Does.Contain(" up: 16"));
    }

    [Test]
    public void LowerCaseAlphaKeys()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("keyReporter"));

        String lowerAlphas = "abcdefghijklmnopqrstuvwxyz";
        element.SendKeys(lowerAlphas);

        Assert.That(element.GetAttribute("value"), Is.EqualTo(lowerAlphas));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/646")]
    public void UppercaseAlphaKeys()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement result = Driver.FindElement(By.Id("result"));
        IWebElement element = Driver.FindElement(By.Id("keyReporter"));

        String upperAlphas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        element.SendKeys(upperAlphas);

        Assert.That(element.GetAttribute("value"), Is.EqualTo(upperAlphas));
        string text = result.Text.Trim();
        Assert.That(text, Does.Contain(" up: 16"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/646")]
    public void AllPrintableKeys()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement result = Driver.FindElement(By.Id("result"));
        IWebElement element = Driver.FindElement(By.Id("keyReporter"));

        String allPrintable =
            "!\"#$%&'()*+,-./0123456789:;<=>?@ ABCDEFGHIJKLMNO" +
            "PQRSTUVWXYZ [\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
        element.SendKeys(allPrintable);

        Assert.That(element.GetAttribute("value"), Is.EqualTo(allPrintable));
        string text = result.Text.Trim();
        Assert.That(text, Does.Contain(" up: 16"));
    }

    [Test]
    public void ArrowKeysAndPageUpAndDown()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("keyReporter"));

        element.SendKeys("a" + Keys.Left + "b" + Keys.Right +
                         Keys.Up + Keys.Down + Keys.PageUp + Keys.PageDown + "1");
        Assert.That(element.GetAttribute("value"), Is.EqualTo("ba1"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/2015")]
    public void HomeAndEndAndPageUpAndPageDownKeys()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("keyReporter"));

        element.SendKeys("abc" + HomeKey() + "0" + Keys.Left + Keys.Right +
                         Keys.PageUp + Keys.PageDown + EndKey() + "1" + HomeKey() +
                         "0" + Keys.PageUp + EndKey() + "111" + HomeKey() + "00");
        Assert.That(element.GetAttribute("value"), Is.EqualTo("0000abc1111"));
    }

    [Test]
    public void DeleteAndBackspaceKeys()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("keyReporter"));

        element.SendKeys("abcdefghi");
        Assert.That(element.GetAttribute("value"), Is.EqualTo("abcdefghi"));

        element.SendKeys(Keys.Left + Keys.Left + Keys.Delete);
        Assert.That(element.GetAttribute("value"), Is.EqualTo("abcdefgi"));

        element.SendKeys(Keys.Left + Keys.Left + Keys.Backspace);
        Assert.That(element.GetAttribute("value"), Is.EqualTo("abcdfgi"));
    }

    [Test]
    public void SpecialSpaceKeys()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("keyReporter"));

        element.SendKeys("abcd" + Keys.Space + "fgh" + Keys.Space + "ij");
        Assert.That(element.GetAttribute("value"), Is.EqualTo("abcd fgh ij"));
    }

    [Test]
    public void NumberpadKeys()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("keyReporter"));

        element.SendKeys("abcd" + Keys.Multiply + Keys.Subtract + Keys.Add +
                         Keys.Decimal + Keys.Separator + Keys.NumberPad0 + Keys.NumberPad9 +
                         Keys.Add + Keys.Semicolon + Keys.Equal + Keys.Divide +
                         Keys.NumberPad3 + "abcd");
        Assert.That(element.GetAttribute("value"), Is.EqualTo("abcd*-+.,09+;=/3abcd"));
    }

    [Test]
    public void FunctionKeys()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("keyReporter"));

        element.SendKeys("FUNCTION" + Keys.F8 + "-KEYS" + Keys.F8);
        element.SendKeys("" + Keys.F8 + "-TOO" + Keys.F8);
        Assert.That(element.GetAttribute("value"), Is.EqualTo("FUNCTION-KEYS-TOO"));
    }

    [Test]
    public void ShiftSelectionDeletes()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("keyReporter"));

        element.SendKeys("abcd efgh");
        Assert.That(element.GetAttribute("value"), Is.EqualTo("abcd efgh"));

        //Could be chord problem
        element.SendKeys(Keys.Shift + Keys.Left + Keys.Left + Keys.Left);
        element.SendKeys(Keys.Delete);
        Assert.That(element.GetAttribute("value"), Is.EqualTo("abcd e"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/646")]
    public void ChordControlHomeShiftEndDelete()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement result = Driver.FindElement(By.Id("result"));
        IWebElement element = Driver.FindElement(By.Id("keyReporter"));

        element.SendKeys("!\"#$%&'()*+,-./0123456789:;<=>?@ ABCDEFG");

        element.SendKeys(HomeKey());
        element.SendKeys("" + Keys.Shift + EndKey() + Keys.Delete);

        Assert.That(element.GetAttribute("value"), Is.Empty);
        string text = result.Text.Trim();
        Assert.That(text, Does.Contain(" up: 16"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/2015")]
    public void ChordReverseShiftHomeSelectionDeletes()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement result = Driver.FindElement(By.Id("result"));
        IWebElement element = Driver.FindElement(By.Id("keyReporter"));

        element.SendKeys("done" + HomeKey());
        Assert.That(element.GetAttribute("value"), Is.EqualTo("done"));

        //Sending chords
        element.SendKeys("" + Keys.Shift + "ALL " + HomeKey());
        Assert.That(element.GetAttribute("value"), Is.EqualTo("ALL done"));

        element.SendKeys(Keys.Delete);
        Assert.That(element.GetAttribute("value"), Is.EqualTo("done"), "done");

        element.SendKeys("" + EndKey() + Keys.Shift + HomeKey());
        Assert.That(element.GetAttribute("value"), Is.EqualTo("done"));
        // Note: trailing SHIFT up here
        string text = result.Text.Trim();

        element.SendKeys("" + Keys.Delete);
        Assert.That(element.GetAttribute("value"), Is.Empty);
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/2015")]
    public void ChordControlCutAndPaste()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("keyReporter"));

        String paste = "!\"#$%&'()*+,-./0123456789:;<=>?@ ABCDEFG";
        element.SendKeys(paste);
        Assert.That(element.GetAttribute("value"), Is.EqualTo(paste));

        //Chords
        element.SendKeys("" + HomeKey() + Keys.Shift + EndKey());

        element.SendKeys(PrimaryModifier() + "x");
        Assert.That(element.GetAttribute("value"), Is.Empty);

        element.SendKeys(PrimaryModifier() + "v");
        Assert.That(element.GetAttribute("value"), Is.EqualTo(paste));

        element.SendKeys("" + Keys.Left + Keys.Left + Keys.Left +
                         Keys.Shift + EndKey());
        element.SendKeys(PrimaryModifier() + "x" + "v");
        Assert.That(element.GetAttribute("value"), Is.EqualTo(paste));

        element.SendKeys(HomeKey());
        element.SendKeys(PrimaryModifier() + "v");
        element.SendKeys(PrimaryModifier() + "v" + "v");
        element.SendKeys(PrimaryModifier() + "v" + "v" + "v");
        Assert.That(element.GetAttribute("value"), Is.EqualTo("EFGEFGEFGEFGEFGEFG" + paste));

        element.SendKeys("" + EndKey() + Keys.Shift + HomeKey() +
                         Keys.Null + Keys.Delete);
        Assert.That(element.GetAttribute("value"), Is.Empty);
    }

    [Test]
    public void ShouldTypeIntoInputElementsThatHaveNoTypeAttribute()
    {
        Driver.Url = Urls.FormsPage;

        IWebElement element = Driver.FindElement(By.Id("no-type"));

        element.SendKeys("Should Say Cheese");
        Assert.That(element.GetAttribute("value"), Is.EqualTo("Should Say Cheese"));
    }

    [Test]
    public void ShouldNotTypeIntoElementsThatPreventKeyDownEvents()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement silent = Driver.FindElement(By.Name("suppress"));

        silent.SendKeys("s");
        Assert.That(silent.GetAttribute("value"), Is.Empty);
    }

    [Test]
    public void GenerateKeyPressEventEvenWhenElementPreventsDefault()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement silent = Driver.FindElement(By.Name("suppress"));
        IWebElement result = Driver.FindElement(By.Id("result"));

        silent.SendKeys("s");
        string text = result.Text;
    }

    [Test]
    public void ShouldBeAbleToTypeOnAnEmailInputField()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement email = Driver.FindElement(By.Id("email"));
        email.SendKeys("foobar");
        Assert.That(email.GetAttribute("value"), Is.EqualTo("foobar"));
    }

    [Test]
    public void ShouldBeAbleToTypeOnANumberInputField()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement numberElement = Driver.FindElement(By.Id("age"));
        numberElement.SendKeys("33");
        Assert.That(numberElement.GetAttribute("value"), Is.EqualTo("33"));
    }

    [Test]
    public void ShouldThrowIllegalArgumentException()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement email = Driver.FindElement(By.Id("age"));
        Assert.That(() => email.SendKeys(null), Throws.InstanceOf<ArgumentNullException>());
    }

    [Test]
    public void CanSafelyTypeOnElementThatIsRemovedFromTheDomOnKeyPress()
    {
        Driver.Url = Urls.WhereIs("key_tests/remove_on_keypress.html");

        IWebElement input = Driver.FindElement(By.Id("target"));
        IWebElement log = Driver.FindElement(By.Id("log"));

        Assert.That(log.GetAttribute("value"), Is.EqualTo(""));

        input.SendKeys("b");
        string expected = "keydown (target)\nkeyup (target)\nkeyup (body)";
        Assert.That(GetValueText(log), Is.EqualTo(expected));

        input.SendKeys("a");

        // Some drivers (IE, Firefox) do not always generate the final keyup event since the element
        // is removed from the DOM in response to the keypress (note, this is a product of how events
        // are generated and does not match actual user behavior).
        expected += "\nkeydown (target)\na pressed; removing";
        Assert.That(GetValueText(log), Is.EqualTo(expected).Or.EqualTo(expected + "\nkeyup (body)"));
    }

    [Test]
    public void CanClearNumberInputAfterTypingInvalidInput()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement input = Driver.FindElement(By.Id("age"));
        input.SendKeys("e");
        input.Clear();
        input.SendKeys("3");
        Assert.That(input.GetAttribute("value"), Is.EqualTo("3"));
    }

    //------------------------------------------------------------------
    // Tests below here are not included in the Java test suite
    //------------------------------------------------------------------
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

        Assert.That(trusted.Text, Is.EqualTo("[true]").Or.EqualTo("[n/a]").Or.EqualTo("[]"));
        Assert.That(id.Text, Is.EqualTo("[frameHtml]").Or.EqualTo("[theBody]"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Browser does not automatically focus body element in frame")]
    public void NonPrintableCharactersShouldWorkWithContentEditableOrDesignModeSet()
    {
        Driver.Url = Urls.RichTextPage;

        Driver.SwitchTo().Frame("editFrame");
        IWebElement element = Driver.SwitchTo().ActiveElement();

        //Chords
        element.SendKeys("Dishy" + Keys.Backspace + Keys.Left + Keys.Left);
        element.SendKeys(Keys.Left + Keys.Left + "F" + Keys.Delete + EndKey() + "ee!");

        Assert.That(element.Text, Is.EqualTo("Fishee!"));
    }

    [Test]
    public void ShouldBeAbleToTypeIntoEmptyContentEditableElement()
    {
        Driver.Url = Urls.ReadOnlyPage;
        IWebElement editable = Driver.FindElement(By.Id("content-editable"));

        editable.Clear();
        editable.SendKeys("cheese"); // requires focus on OS X

        Assert.That(editable.Text, Is.EqualTo("cheese"));
    }

    [Test]
    // [IgnoreBrowser(Browser.Chrome, "Driver prepends text in contentEditable")]
    // [IgnoreBrowser(Browser.Edge, "Driver prepends text in contentEditable")]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/2015")]
    public void ShouldBeAbleToTypeIntoContentEditableElementWithExistingValue()
    {
        Driver.Url = Urls.ReadOnlyPage;
        IWebElement editable = Driver.FindElement(By.Id("content-editable"));

        string initialText = editable.Text;
        editable.SendKeys(", edited");

        Assert.That(editable.Text, Is.EqualTo(initialText + ", edited"));
    }

    [Test]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
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

    private string GetValueText(IWebElement el)
    {
        // Standardize on \n and strip any trailing whitespace.
        return el.GetAttribute("value").Replace("\r\n", "\n").Trim();
    }

    private void CheckRecordedKeySequence(IWebElement element, int expectedKeyCode)
    {
        string withKeyPress = string.Format("down: {0} press: {0} up: {0}", expectedKeyCode);
        string withoutKeyPress = string.Format("down: {0} up: {0}", expectedKeyCode);
        Assert.That(element.Text.Trim(), Is.AnyOf(withKeyPress, withoutKeyPress));
    }

    private string PrimaryModifier()
    {
        return (RuntimeInformation.IsOSPlatform(OSPlatform.OSX)) ? Keys.Command : Keys.Control;
    }

    private string HomeKey()
    {
        return (RuntimeInformation.IsOSPlatform(OSPlatform.OSX)) ? Keys.Up : Keys.Home;
    }

    private string EndKey()
    {
        return (RuntimeInformation.IsOSPlatform(OSPlatform.OSX)) ? Keys.Down : Keys.End;
    }
}
