using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class TypingTest : DriverTestFixture
    {
        [Test]
        [Category("Javascript")]
        public void ShouldFireKeyPressEvents()
        {
            driver.Url = javascriptPage;

            IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));
            keyReporter.SendKeys("a");

            IWebElement result = driver.FindElement(By.Id("result"));
            Assert.IsTrue(result.Text.Contains("press:"));
        }

        [Test]
        [Category("Javascript")]
        public void ShouldFireKeyDownEvents()
        {
            driver.Url = javascriptPage;

            IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));
            keyReporter.SendKeys("I");

            IWebElement result = driver.FindElement(By.Id("result"));
            Assert.IsTrue(result.Text.Contains("down:"));
        }

        [Test]
        [Category("Javascript")]
        public void ShouldFireKeyUpEvents()
        {
            driver.Url = javascriptPage;

            IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));
            keyReporter.SendKeys("a");

            IWebElement result = driver.FindElement(By.Id("result"));
            Assert.IsTrue(result.Text.Contains("up:"));
        }

        [Test]
        public void ShouldTypeLowerCaseLetters()
        {
            driver.Url = javascriptPage;

            IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));
            keyReporter.SendKeys("abc def");

            Assert.AreEqual(keyReporter.GetAttribute("value"), "abc def");
        }

        [Test]
        public void ShouldBeAbleToTypeCapitalLetters()
        {
            driver.Url = javascriptPage;

            IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));
            keyReporter.SendKeys("ABC DEF");

            Assert.AreEqual(keyReporter.GetAttribute("value"), "ABC DEF");
        }

        [Test]
        public void ShouldBeAbleToTypeQuoteMarks()
        {
            driver.Url = javascriptPage;

            IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));
            keyReporter.SendKeys("\"");

            Assert.AreEqual(keyReporter.GetAttribute("value"), "\"");
        }

        [Test]
        public void ShouldBeAbleToTypeTheAtCharacter()
        {
            // simon: I tend to use a US/UK or AUS keyboard layout with English
            // as my primary language. There are consistent reports that we're
            // not handling i18nised keyboards properly. This test exposes this
            // in a lightweight manner when my keyboard is set to the DE mapping
            // and we're using IE.

            driver.Url = javascriptPage;

            IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));
            keyReporter.SendKeys("@");

            Assert.AreEqual(keyReporter.GetAttribute("value"), "@");
        }

        [Test]
        public void ShouldBeAbleToMixUpperAndLowerCaseLetters()
        {
            driver.Url = javascriptPage;

            IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));
            keyReporter.SendKeys("me@eXample.com");

            Assert.AreEqual(keyReporter.GetAttribute("value"), "me@eXample.com");
        }

        [Test]
        [Category("Javascript")]
        public void ArrowKeysShouldNotBePrintable()
        {
            driver.Url = javascriptPage;

            IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));
            keyReporter.SendKeys(Keys.ArrowLeft);

            Assert.AreEqual(keyReporter.GetAttribute("value"), "");
        }

        [Test]
        [IgnoreBrowser(Browser.HtmlUnit)]
        public void ShouldBeAbleToUseArrowKeys()
        {
            driver.Url = javascriptPage;

            IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));
            keyReporter.SendKeys("Tet" + Keys.ArrowLeft + "s");

            Assert.AreEqual(keyReporter.GetAttribute("value"), "Test");
        }

        [Test]
        [Category("Javascript")]
        public void WillSimulateAKeyUpWhenEnteringTextIntoInputElements()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyUp"));
            element.SendKeys("I like cheese");

            IWebElement result = driver.FindElement(By.Id("result"));
            Assert.AreEqual(result.Text, "I like cheese");
        }

        [Test]
        [Category("Javascript")]
        public void WillSimulateAKeyDownWhenEnteringTextIntoInputElements()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyDown"));
            element.SendKeys("I like cheese");

            IWebElement result = driver.FindElement(By.Id("result"));
            // Because the key down gets the result before the input element is
            // filled, we're a letter short here
            Assert.AreEqual(result.Text, "I like chees");
        }

        [Test]
        [Category("Javascript")]
        public void WillSimulateAKeyPressWhenEnteringTextIntoInputElements()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyPress"));
            element.SendKeys("I like cheese");

            IWebElement result = driver.FindElement(By.Id("result"));
            // Because the key down gets the result before the input element is
            // filled, we're a letter short here
            Assert.AreEqual(result.Text, "I like chees");
        }

        [Test]
        [Category("Javascript")]
        public void WillSimulateAKeyUpWhenEnteringTextIntoTextAreas()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyUpArea"));
            element.SendKeys("I like cheese");

            IWebElement result = driver.FindElement(By.Id("result"));
            Assert.AreEqual(result.Text, "I like cheese");
        }

        [Test]
        [Category("Javascript")]
        public void WillSimulateAKeyDownWhenEnteringTextIntoTextAreas()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyDownArea"));
            element.SendKeys("I like cheese");

            IWebElement result = driver.FindElement(By.Id("result"));
            // Because the key down gets the result before the input element is
            // filled, we're a letter short here
            Assert.AreEqual(result.Text, "I like chees");
        }

        [Test]
        [Category("Javascript")]
        public void WillSimulateAKeyPressWhenEnteringTextIntoTextAreas()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyPressArea"));
            element.SendKeys("I like cheese");

            IWebElement result = driver.FindElement(By.Id("result"));
            // Because the key down gets the result before the input element is
            // filled, we're a letter short here
            Assert.AreEqual(result.Text, "I like chees");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Firefox, "Firefox demands to have the focus on the window already.")]
        public void ShouldFireFocusKeyEventsInTheRightOrder()
        {
            driver.Url = javascriptPage;

            IWebElement result = driver.FindElement(By.Id("result"));
            IWebElement element = driver.FindElement(By.Id("theworks"));

            element.SendKeys("a");
            Assert.AreEqual(result.Text.Trim(), "focus keydown keypress keyup");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IE, "Firefox-specific test. IE does not report key press event.")]
        [IgnoreBrowser(Browser.HtmlUnit, "firefox-specific")]
        [IgnoreBrowser(Browser.Chrome, "Firefox-specific test. Chrome does not report key press event.")]
        [IgnoreBrowser(Browser.PhantomJS, "Firefox-specific test. PhantomJS does not report key press event.")]
        public void ShouldReportKeyCodeOfArrowKeys()
        {
            driver.Url = javascriptPage;

            IWebElement result = driver.FindElement(By.Id("result"));
            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            element.SendKeys(Keys.ArrowDown);
            Assert.AreEqual(result.Text.Trim(), "down: 40 press: 40 up: 40");

            element.SendKeys(Keys.ArrowUp);
            Assert.AreEqual(result.Text.Trim(), "down: 38 press: 38 up: 38");

            element.SendKeys(Keys.ArrowLeft);
            Assert.AreEqual(result.Text.Trim(), "down: 37 press: 37 up: 37");

            element.SendKeys(Keys.ArrowRight);
            Assert.AreEqual(result.Text.Trim(), "down: 39 press: 39 up: 39");

            // And leave no rubbish/printable keys in the "keyReporter"
            Assert.AreEqual(element.GetAttribute("value"), "");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Chrome, "untested user agents")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void ShouldReportKeyCodeOfArrowKeysUpDownEvents()
        {
            driver.Url = javascriptPage;

            IWebElement result = driver.FindElement(By.Id("result"));
            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            element.SendKeys(Keys.ArrowDown);
            Assert.IsTrue(result.Text.Trim().Contains("down: 40"));
            Assert.IsTrue(result.Text.Trim().Contains("up: 40"));

            element.SendKeys(Keys.ArrowUp);
            Assert.IsTrue(result.Text.Trim().Contains("down: 38"));
            Assert.IsTrue(result.Text.Trim().Contains("up: 38"));

            element.SendKeys(Keys.ArrowLeft);
            Assert.IsTrue(result.Text.Trim().Contains("down: 37"));
            Assert.IsTrue(result.Text.Trim().Contains("up: 37"));

            element.SendKeys(Keys.ArrowRight);
            Assert.IsTrue(result.Text.Trim().Contains("down: 39"));
            Assert.IsTrue(result.Text.Trim().Contains("up: 39"));

            // And leave no rubbish/printable keys in the "keyReporter"
            Assert.AreEqual(element.GetAttribute("value"), string.Empty);
        }

        [Test]
        [Category("Javascript")]
        public void NumericNonShiftKeys()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            String numericLineCharsNonShifted = "`1234567890-=[]\\;,.'/42";
            element.SendKeys(numericLineCharsNonShifted);

            Assert.AreEqual(element.GetAttribute("value"), numericLineCharsNonShifted);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void NumericShiftKeys()
        {
            driver.Url = javascriptPage;

            IWebElement result = driver.FindElement(By.Id("result"));
            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            String numericShiftsEtc = "~!@#$%^&*()_+{}:\"<>?|END~";
            element.SendKeys(numericShiftsEtc);

            Assert.AreEqual(element.GetAttribute("value"), numericShiftsEtc);
            Assert.IsTrue(result.Text.Trim().Contains(" up: 16"));
        }

        [Test]
        [Category("Javascript")]
        public void LowerCaseAlphaKeys()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            String lowerAlphas = "abcdefghijklmnopqrstuvwxyz";
            element.SendKeys(lowerAlphas);

            Assert.AreEqual(element.GetAttribute("value"), lowerAlphas);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void UppercaseAlphaKeys()
        {
            driver.Url = javascriptPage;

            IWebElement result = driver.FindElement(By.Id("result"));
            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            String upperAlphas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            element.SendKeys(upperAlphas);

            Assert.AreEqual(element.GetAttribute("value"), upperAlphas);
            Assert.IsTrue(result.Text.Trim().Contains(" up: 16"));
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void AllPrintableKeys()
        {
            driver.Url = javascriptPage;

            IWebElement result = driver.FindElement(By.Id("result"));
            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            String allPrintable =
                "!\"#$%&'()*+,-./0123456789:;<=>?@ ABCDEFGHIJKLMNO" +
                "PQRSTUVWXYZ [\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
            element.SendKeys(allPrintable);

            Assert.AreEqual(element.GetAttribute("value"), allPrintable);
            Assert.IsTrue(result.Text.Trim().Contains(" up: 16"));
        }

        [Test]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void ArrowKeysAndPageUpAndDown()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            element.SendKeys("a" + Keys.Left + "b" + Keys.Right +
                             Keys.Up + Keys.Down + Keys.PageUp + Keys.PageDown + "1");
            Assert.AreEqual(element.GetAttribute("value"), "ba1");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void HomeAndEndAndPageUpAndPageDownKeys()
        {
            // FIXME: macs don't have HOME keys, would PGUP work?
            if (System.Environment.OSVersion.Platform == PlatformID.MacOSX)
            {
                return;
            }

            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            element.SendKeys("abc" + Keys.Home + "0" + Keys.Left + Keys.Right +
                             Keys.PageUp + Keys.PageDown + Keys.End + "1" + Keys.Home +
                             "0" + Keys.PageUp + Keys.End + "111" + Keys.Home + "00");
            Assert.AreEqual(element.GetAttribute("value"), "0000abc1111");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void DeleteAndBackspaceKeys()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            element.SendKeys("abcdefghi");
            Assert.AreEqual(element.GetAttribute("value"), "abcdefghi");

            element.SendKeys(Keys.Left + Keys.Left + Keys.Delete);
            Assert.AreEqual(element.GetAttribute("value"), "abcdefgi");

            element.SendKeys(Keys.Left + Keys.Left + Keys.Backspace);
            Assert.AreEqual(element.GetAttribute("value"), "abcdfgi");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void SpecialSpaceKeys()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            element.SendKeys("abcd" + Keys.Space + "fgh" + Keys.Space + "ij");
            Assert.AreEqual(element.GetAttribute("value"), "abcd fgh ij");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void NumberpadKeys()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            element.SendKeys("abcd" + Keys.Multiply + Keys.Subtract + Keys.Add +
                             Keys.Decimal + Keys.Separator + Keys.NumberPad0 + Keys.NumberPad9 +
                             Keys.Add + Keys.Semicolon + Keys.Equal + Keys.Divide +
                             Keys.NumberPad3 + "abcd");
            Assert.AreEqual(element.GetAttribute("value"), "abcd*-+.,09+;=/3abcd");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void NumberpadAndFunctionKeys()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            element.SendKeys("FUNCTION" + Keys.F4 + "-KEYS" + Keys.F4);
            element.SendKeys("" + Keys.F4 + "-TOO" + Keys.F4);
            Assert.AreEqual(element.GetAttribute("value"), "FUNCTION-KEYS-TOO");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void ShiftSelectionDeletes()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            element.SendKeys("abcd efgh");
            Assert.AreEqual(element.GetAttribute("value"), "abcd efgh");

            //Could be chord problem
            element.SendKeys(Keys.Shift + Keys.Left + Keys.Left + Keys.Left);
            element.SendKeys(Keys.Delete);
            Assert.AreEqual(element.GetAttribute("value"), "abcd e");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void ChordControlHomeShiftEndDelete()
        {
            // FIXME: macs don't have HOME keys, would PGUP work?
            if (System.Environment.OSVersion.Platform == PlatformID.MacOSX)
            {
                return;
            }

            driver.Url = javascriptPage;

            IWebElement result = driver.FindElement(By.Id("result"));
            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            element.SendKeys("!\"#$%&'()*+,-./0123456789:;<=>?@ ABCDEFG");

            element.SendKeys(Keys.Home);
            element.SendKeys("" + Keys.Shift + Keys.End + Keys.Delete);

            Assert.AreEqual(element.GetAttribute("value"), string.Empty);
            Assert.IsTrue(result.Text.Contains(" up: 16"));
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void ChordReveseShiftHomeSelectionDeletes()
        {
            // FIXME: macs don't have HOME keys, would PGUP work?
            if (System.Environment.OSVersion.Platform == PlatformID.MacOSX)
            {
                return;
            }
            driver.Url = javascriptPage;

            IWebElement result = driver.FindElement(By.Id("result"));
            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            element.SendKeys("done" + Keys.Home);
            Assert.AreEqual(element.GetAttribute("value"), "done");

            //Sending chords
            element.SendKeys("" + Keys.Shift + "ALL " + Keys.Home);
            Assert.AreEqual(element.GetAttribute("value"), "ALL done");

            element.SendKeys(Keys.Delete);
            Assert.AreEqual(element.GetAttribute("value"), "done");

            element.SendKeys("" + Keys.End + Keys.Shift + Keys.Home);
            Assert.AreEqual(element.GetAttribute("value"), "done");
            // Note: trailing SHIFT up here
            Assert.IsTrue(result.Text.Trim().Contains(" up: 16"));

            element.SendKeys("" + Keys.Delete);
            Assert.AreEqual(element.GetAttribute("value"), string.Empty);
        }

        // control-x control-v here for cut & paste tests, these work on windows
        // and linux, but not on the MAC.

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void ChordControlCutAndPaste()
        {
            // FIXME: macs don't have HOME keys, would PGUP work?
            if (System.Environment.OSVersion.Platform == PlatformID.MacOSX)
            {
                return;
            }

            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyReporter"));
            IWebElement result = driver.FindElement(By.Id("result"));

            String paste = "!\"#$%&'()*+,-./0123456789:;<=>?@ ABCDEFG";
            element.SendKeys(paste);
            Assert.AreEqual(element.GetAttribute("value"), paste);

            //Chords
            element.SendKeys("" + Keys.Home + Keys.Shift + Keys.End);
            Assert.IsTrue(result.Text.Trim().Contains(" up: 16"));

            element.SendKeys(Keys.Control + "x");
            Assert.AreEqual(element.GetAttribute("value"), string.Empty);

            element.SendKeys(Keys.Control + "v");
            Assert.AreEqual(element.GetAttribute("value"), paste);

            element.SendKeys("" + Keys.Left + Keys.Left + Keys.Left +
                             Keys.Shift + Keys.End);
            element.SendKeys(Keys.Control + "x" + "v");
            Assert.AreEqual(element.GetAttribute("value"), paste);

            element.SendKeys(Keys.Home);
            element.SendKeys(Keys.Control + "v");
            element.SendKeys(Keys.Control + "v" + "v");
            element.SendKeys(Keys.Control + "v" + "v" + "v");
            Assert.AreEqual(element.GetAttribute("value"), "EFGEFGEFGEFGEFGEFG" + paste);

            element.SendKeys("" + Keys.End + Keys.Shift + Keys.Home +
                             Keys.Null + Keys.Delete);
            Assert.AreEqual(element.GetAttribute("value"), string.Empty);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldTypeIntoInputElementsThatHaveNoTypeAttribute()
        {
            driver.Url = formsPage;

            IWebElement element = driver.FindElement(By.Id("no-type"));

            element.SendKeys("Should Say Cheese");
            Assert.AreEqual(element.GetAttribute("value"), "Should Say Cheese");
        }

        [Test]
        [Category("Javascript")]
        public void ShouldNotTypeIntoElementsThatPreventKeyDownEvents()
        {
            driver.Url = javascriptPage;

            IWebElement silent = driver.FindElement(By.Name("suppress"));

            silent.SendKeys("s");
            Assert.AreEqual(silent.GetAttribute("value"), string.Empty);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IE, "Firefox-specific test. IE does not report key press event.")]
        [IgnoreBrowser(Browser.Chrome, "firefox-specific")]
        [IgnoreBrowser(Browser.PhantomJS, "firefox-specific")]
        public void GenerateKeyPressEventEvenWhenElementPreventsDefault()
        {
            driver.Url = javascriptPage;

            IWebElement silent = driver.FindElement(By.Name("suppress"));
            IWebElement result = driver.FindElement(By.Id("result"));

            silent.SendKeys("s");
            Assert.IsTrue(result.Text.Contains("press"));
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.IE, "IFrame content not updating in IE page.")]
        [IgnoreBrowser(Browser.Chrome, "See crbug 20773")]
        public void TypingIntoAnIFrameWithContentEditableOrDesignModeSet()
        {
            driver.Url = richTextPage;

            driver.SwitchTo().Frame("editFrame");
            IWebElement element = driver.SwitchTo().ActiveElement();
            element.SendKeys("Fishy");

            driver.SwitchTo().DefaultContent();
            IWebElement trusted = driver.FindElement(By.Id("istrusted"));
            IWebElement id = driver.FindElement(By.Id("tagId"));

            Assert.AreEqual("[true]", trusted.Text);
            Assert.AreEqual("[frameHtml]", id.Text);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        public void NonPrintableCharactersShouldWorkWithContentEditableOrDesignModeSet()
        {
            driver.Url = richTextPage;

            // not tested on mac
            // FIXME: macs don't have HOME keys, would PGUP work?
            if (System.Environment.OSVersion.Platform == PlatformID.MacOSX)
            {
                return;
            }

            driver.SwitchTo().Frame("editFrame");
            IWebElement element = driver.SwitchTo().ActiveElement();

            //Chords
            element.SendKeys("Dishy" + Keys.Backspace + Keys.Left + Keys.Left);
            element.SendKeys(Keys.Left + Keys.Left + "F" + Keys.Delete + Keys.End + "ee!");

            Assert.AreEqual("Fishee!", element.Text);
        }
    }
}
