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
        [IgnoreBrowser(Browser.ChromeNonWindows)]
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
        [IgnoreBrowser(Browser.ChromeNonWindows)]
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
        [IgnoreBrowser(Browser.ChromeNonWindows)]
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

            Assert.AreEqual(keyReporter.Value, "abc def");
        }

        [Test]
        public void ShouldBeAbleToTypeCapitalLetters()
        {
            driver.Url = javascriptPage;

            IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));
            keyReporter.SendKeys("ABC DEF");

            Assert.AreEqual(keyReporter.Value, "ABC DEF");
        }

        [Test]
        public void ShouldBeAbleToTypeQuoteMarks()
        {
            driver.Url = javascriptPage;

            IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));
            keyReporter.SendKeys("\"");

            Assert.AreEqual(keyReporter.Value, "\"");
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

            Assert.AreEqual(keyReporter.Value, "@");
        }

        [Test]
        public void ShouldBeAbleToMixUpperAndLowerCaseLetters()
        {
            driver.Url = javascriptPage;

            IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));
            keyReporter.SendKeys("me@eXample.com");

            Assert.AreEqual(keyReporter.Value, "me@eXample.com");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows)]
        public void ArrowKeysShouldNotBePrintable()
        {
            driver.Url = javascriptPage;

            IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));
            keyReporter.SendKeys(Keys.ArrowLeft);

            Assert.AreEqual(keyReporter.Value, "");
        }

        [Test]
        [IgnoreBrowser(Browser.ChromeNonWindows)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        public void ShouldBeAbleToUseArrowKeys()
        {
            driver.Url = javascriptPage;

            IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));
            keyReporter.SendKeys("Tet" + Keys.ArrowLeft + "s");

            Assert.AreEqual(keyReporter.Value, "Test");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows)]
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
        [IgnoreBrowser(Browser.ChromeNonWindows)]
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
        [IgnoreBrowser(Browser.ChromeNonWindows)]
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
        [IgnoreBrowser(Browser.ChromeNonWindows)]
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
        [IgnoreBrowser(Browser.ChromeNonWindows)]
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
        [IgnoreBrowser(Browser.ChromeNonWindows)]
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
        [IgnoreBrowser(Browser.ChromeNonWindows, "event firing broken.")]
        [IgnoreBrowser(Browser.Chrome, "event firing broken.")]
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
        [IgnoreBrowser(Browser.Chrome, "firefox-specific")]
        [IgnoreBrowser(Browser.IE, "Firefox-specific test. IE does not report key press event.")]
        [IgnoreBrowser(Browser.HtmlUnit, "firefox-specific")]
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
            Assert.AreEqual(element.Value, "");
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
            Assert.AreEqual(element.Value, string.Empty);
        }

        [Test]
        [Category("Javascript")]
        public void NumericNonShiftKeys()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            String numericLineCharsNonShifted = "`1234567890-=[]\\;,.'/42";
            element.SendKeys(numericLineCharsNonShifted);

            Assert.AreEqual(element.Value, numericLineCharsNonShifted);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "untested user agents")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void NumericShiftKeys()
        {
            driver.Url = javascriptPage;

            IWebElement result = driver.FindElement(By.Id("result"));
            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            String numericShiftsEtc = "~!@#$%^&*()_+{}:\"<>?|END~";
            element.SendKeys(numericShiftsEtc);

            Assert.AreEqual(element.Value, numericShiftsEtc);
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

            Assert.AreEqual(element.Value, lowerAlphas);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "untested user agents")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void UppercaseAlphaKeys()
        {
            driver.Url = javascriptPage;

            IWebElement result = driver.FindElement(By.Id("result"));
            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            String upperAlphas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            element.SendKeys(upperAlphas);

            Assert.AreEqual(element.Value, upperAlphas);
            Assert.IsTrue(result.Text.Trim().Contains(" up: 16"));
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Chrome, "untested user agents")]
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

            Assert.AreEqual(element.Value, allPrintable);
            Assert.IsTrue(result.Text.Trim().Contains(" up: 16"));
        }

        [Test]
        [IgnoreBrowser(Browser.ChromeNonWindows, "untested user agents")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void ArrowKeysAndPageUpAndDown()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            element.SendKeys("a" + Keys.Left + "b" + Keys.Right +
                             Keys.Up + Keys.Down + Keys.PageUp + Keys.PageDown + "1");
            Assert.AreEqual(element.Value, "ba1");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "untested user agents")]
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
            Assert.AreEqual(element.Value, "0000abc1111");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "untested user agents")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void DeleteAndBackspaceKeys()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            element.SendKeys("abcdefghi");
            Assert.AreEqual(element.Value, "abcdefghi");

            element.SendKeys(Keys.Left + Keys.Left + Keys.Delete);
            Assert.AreEqual(element.Value, "abcdefgi");

            element.SendKeys(Keys.Left + Keys.Left + Keys.Backspace);
            Assert.AreEqual(element.Value, "abcdfgi");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "untested user agents")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void SpecialSpaceKeys()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            element.SendKeys("abcd" + Keys.Space + "fgh" + Keys.Space + "ij");
            Assert.AreEqual(element.Value, "abcd fgh ij");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "untested user agents")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void NumberpadAndFunctionKeys()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            element.SendKeys("abcd" + Keys.Multiply + Keys.Subtract + Keys.Add +
                             Keys.Decimal + Keys.Separator + Keys.NumberPad0 + Keys.NumberPad9 +
                             Keys.Add + Keys.Semicolon + Keys.Equal + Keys.Divide +
                             Keys.NumberPad3 + "abcd");
            Assert.AreEqual(element.Value, "abcd*-+.,09+;=/3abcd");

            element.Clear();
            element.SendKeys("FUNCTION" + Keys.F2 + "-KEYS" + Keys.F2);
            element.SendKeys("" + Keys.F2 + "-TOO" + Keys.F2);
            Assert.AreEqual(element.Value, "FUNCTION-KEYS-TOO");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "untested user agents")]
        [IgnoreBrowser(Browser.HtmlUnit, "untested user agents")]
        public void ShiftSelectionDeletes()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("keyReporter"));

            element.SendKeys("abcd efgh");
            Assert.AreEqual(element.Value, "abcd efgh");

            //Could be chord problem
            element.SendKeys(Keys.Shift + Keys.Left + Keys.Left + Keys.Left);
            element.SendKeys(Keys.Delete);
            Assert.AreEqual(element.Value, "abcd e");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "untested user agents")]
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

            Assert.AreEqual(element.Value, string.Empty);
            Assert.IsTrue(result.Text.Contains(" up: 16"));
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "untested user agents")]
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
            Assert.AreEqual(element.Value, "done");

            //Sending chords
            element.SendKeys("" + Keys.Shift + "ALL " + Keys.Home);
            Assert.AreEqual(element.Value, "ALL done");

            element.SendKeys(Keys.Delete);
            Assert.AreEqual(element.Value, "done");

            element.SendKeys("" + Keys.End + Keys.Shift + Keys.Home);
            Assert.AreEqual(element.Value, "done");
            // Note: trailing SHIFT up here
            Assert.IsTrue(result.Text.Trim().Contains(" up: 16"));

            element.SendKeys("" + Keys.Delete);
            Assert.AreEqual(element.Value, string.Empty);
        }

        // control-x control-v here for cut & paste tests, these work on windows
        // and linux, but not on the MAC.

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "untested user agents")]
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
            Assert.AreEqual(element.Value, paste);

            //Chords
            element.SendKeys("" + Keys.Home + Keys.Shift + Keys.End);
            Assert.IsTrue(result.Text.Trim().Contains(" up: 16"));

            element.SendKeys(Keys.Control + "x");
            Assert.AreEqual(element.Value, string.Empty);

            element.SendKeys(Keys.Control + "v");
            Assert.AreEqual(element.Value, paste);

            element.SendKeys("" + Keys.Left + Keys.Left + Keys.Left +
                             Keys.Shift + Keys.End);
            element.SendKeys(Keys.Control + "x" + "v");
            Assert.AreEqual(element.Value, paste);

            element.SendKeys(Keys.Home);
            element.SendKeys(Keys.Control + "v");
            element.SendKeys(Keys.Control + "v" + "v");
            element.SendKeys(Keys.Control + "v" + "v" + "v");
            Assert.AreEqual(element.Value, "EFGEFGEFGEFGEFGEFG" + paste);

            element.SendKeys("" + Keys.End + Keys.Shift + Keys.Home +
                             Keys.Null + Keys.Delete);
            Assert.AreEqual(element.Value, string.Empty);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldTypeIntoInputElementsThatHaveNoTypeAttribute()
        {
            driver.Url = formsPage;

            IWebElement element = driver.FindElement(By.Id("no-type"));

            element.SendKeys("Should Say Cheese");
            Assert.AreEqual(element.Value, "Should Say Cheese");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "untested user agents")]
        public void ShouldNotTypeIntoElementsThatPreventKeyDownEvents()
        {
            driver.Url = javascriptPage;

            IWebElement silent = driver.FindElement(By.Name("suppress"));

            silent.SendKeys("s");
            Assert.AreEqual(silent.Value, string.Empty);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IE, "Firefox-specific test. IE does not report key press event.")]
        [IgnoreBrowser(Browser.Chrome, "firefox-specific")]
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
        [IgnoreBrowser(Browser.Chrome, "See crbug 20773")]
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
