// <copyright file="BasicKeyboardInterfaceTests.cs" company="Selenium Committers">
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
using System.Runtime.InteropServices;
using OpenQA.Selenium.Interactions;

namespace OpenQA.Selenium.Tests.Interactions;

[TestFixture]
public class BasicKeyboardInterfaceTests : DriverTestFixture
{
    [SetUp]
    public void Setup()
    {
        //new Actions(driver).SendKeys(Keys.Null).Perform();
        if (Driver is IActionExecutor actionExecutor)
        {
            actionExecutor.ResetInputState();
        }
    }

    [TearDown]
    public void ReleaseModifierKeys()
    {
        //new Actions(driver).SendKeys(Keys.Null).Perform();
        if (Driver is IActionExecutor actionExecutor)
        {
            actionExecutor.ResetInputState();
        }
    }

    [Test]
    public void ShouldSetActiveKeyboard()
    {
        Actions actionProvider = new Actions(Driver);
        actionProvider.SetActiveKeyboard("test keyboard");

        KeyInputDevice device = actionProvider.GetActiveKeyboard();

        Assert.That(device.DeviceName, Is.EqualTo("test keyboard"));
    }

    [Test]
    [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
    public void ShouldAllowBasicKeyboardInput()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement keyReporter = Driver.FindElement(By.Id("keyReporter"));

        // Scroll the element into view before attempting any actions on it.
        ((IJavaScriptExecutor)Driver).ExecuteScript("arguments[0].scrollIntoView();", keyReporter);

        Actions actionProvider = new Actions(Driver);
        IAction sendLowercase = actionProvider.SendKeys(keyReporter, "abc def").Build();

        sendLowercase.Perform();

        Assert.That(keyReporter.GetAttribute("value"), Is.EqualTo("abc def"));

    }

    [Test]
    [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
    public void ShouldAllowSendingKeyDownOnly()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement keysEventInput = Driver.FindElement(By.Id("theworks"));

        // Scroll the element into view before attempting any actions on it.
        ((IJavaScriptExecutor)Driver).ExecuteScript("arguments[0].scrollIntoView();", keysEventInput);

        Actions actionProvider = new Actions(Driver);

        IAction pressShift = actionProvider.KeyDown(keysEventInput, Keys.Shift).Build();
        pressShift.Perform();

        IWebElement keyLoggingElement = Driver.FindElement(By.Id("result"));
        string logText = keyLoggingElement.Text;

        IAction releaseShift = actionProvider.KeyDown(keysEventInput, Keys.Shift).Build();
        releaseShift.Perform();

        Assert.That(logText, Does.EndWith("keydown"));
    }

    [Test]
    [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
    public void ShouldAllowSendingKeyUp()
    {
        Driver.Url = Urls.JavascriptPage;
        IWebElement keysEventInput = Driver.FindElement(By.Id("theworks"));

        // Scroll the element into view before attempting any actions on it.
        ((IJavaScriptExecutor)Driver).ExecuteScript("arguments[0].scrollIntoView();", keysEventInput);

        IAction pressShift = new Actions(Driver).KeyDown(keysEventInput, Keys.Shift).Build();
        pressShift.Perform();

        IWebElement keyLoggingElement = Driver.FindElement(By.Id("result"));

        string eventsText = keyLoggingElement.Text;
        Assert.That(keyLoggingElement.Text, Does.EndWith("keydown"));

        IAction releaseShift = new Actions(Driver).KeyUp(keysEventInput, Keys.Shift).Build();

        releaseShift.Perform();

        eventsText = keyLoggingElement.Text;
        Assert.That(keyLoggingElement.Text, Does.EndWith("keyup"));
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Keypress and Keyup are getting switched")]
    [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
    public void ShouldAllowSendingKeysWithShiftPressed()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement keysEventInput = Driver.FindElement(By.Id("theworks"));

        keysEventInput.Click();

        IAction pressShift = new Actions(Driver).KeyDown(Keys.Shift).Build();
        pressShift.Perform();

        IAction sendLowercase = new Actions(Driver).SendKeys("ab").Build();
        sendLowercase.Perform();

        IAction releaseShift = new Actions(Driver).KeyUp(Keys.Shift).Build();
        releaseShift.Perform();

        AssertThatFormEventsFiredAreExactly("focus keydown keydown keypress keyup keydown keypress keyup keyup");

        Assert.That(keysEventInput.GetAttribute("value"), Is.EqualTo("AB"));
    }

    [Test]
    [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
    public void ShouldAllowSendingKeysToActiveElement()
    {
        Driver.Url = Urls.BodyTypingPage;

        Actions actionProvider = new Actions(Driver);
        IAction someKeys = actionProvider.SendKeys("ab").Build();
        someKeys.Perform();

        AssertThatBodyEventsFiredAreExactly("keypress keypress");
        IWebElement formLoggingElement = Driver.FindElement(By.Id("result"));
        AssertThatFormEventsFiredAreExactly(string.Empty);
    }

    [Test]
    public void ThrowsIllegalArgumentExceptionWithNullKeys()
    {
        Driver.Url = Urls.JavascriptPage;
        Assert.That(() => Driver.FindElement(By.Id("keyReporter")).SendKeys(null), Throws.InstanceOf<ArgumentNullException>());
    }

    [Test]
    public void CanGenerateKeyboardShortcuts()
    {
        Driver.Url = Urls.WhereIs("keyboard_shortcut.html");

        IWebElement body = Driver.FindElement(By.XPath("//body"));
        AssertBackgroundColor(body, Color.White);

        new Actions(Driver).KeyDown(Keys.Shift).SendKeys("1").KeyUp(Keys.Shift).Perform();
        AssertBackgroundColor(body, Color.Green);

        new Actions(Driver).KeyDown(Keys.Alt).SendKeys("1").KeyUp(Keys.Alt).Perform();
        AssertBackgroundColor(body, Color.LightBlue);

        new Actions(Driver)
            .KeyDown(Keys.Shift).KeyDown(Keys.Alt)
            .SendKeys("1")
            .KeyUp(Keys.Shift).KeyUp(Keys.Alt)
            .Perform();
        AssertBackgroundColor(body, Color.Silver);
    }

    [Test]
    public void SelectionSelectBySymbol()
    {
        Driver.Url = Urls.WhereIs("single_text_input.html");

        IWebElement input = Driver.FindElement(By.Id("textInput"));

        new Actions(Driver).Click(input).SendKeys("abc def").Perform();

        WaitFor(() => input.GetAttribute("value") == "abc def", "did not send initial keys");

        if (!TestUtilities.IsInternetExplorer(Driver))
        {
            // When using drivers other than the IE, the click in
            // the below action sequence may fall inside the double-
            // click threshold (the IE driver has guards to prevent
            // inadvertent double-clicks with multiple actions calls),
            // so we call the "release actions" end point before
            // doing the second action.
            if (Driver is IActionExecutor executor)
            {
                executor.ResetInputState();
            }
        }

        new Actions(Driver).Click(input)
            .KeyDown(Keys.Shift)
            .SendKeys(Keys.Left)
            .SendKeys(Keys.Left)
            .KeyUp(Keys.Shift)
            .SendKeys(Keys.Delete)
            .Perform();

        Assert.That(input.GetAttribute("value"), Is.EqualTo("abc d"));
    }

    [Test]
    public void SelectionSelectByWord()
    {
        string controlModifier = Keys.Control;
        if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
        {
            controlModifier = Keys.Alt;
        }

        Driver.Url = Urls.WhereIs("single_text_input.html");

        IWebElement input = Driver.FindElement(By.Id("textInput"));

        new Actions(Driver).Click(input).SendKeys("abc def").Perform();

        WaitFor(() => input.GetAttribute("value") == "abc def", "did not send initial keys");

        if (!TestUtilities.IsInternetExplorer(Driver))
        {
            // When using drivers other than the IE, the click in
            // the below action sequence may fall inside the double-
            // click threshold (the IE driver has guards to prevent
            // inadvertent double-clicks with multiple actions calls),
            // so we call the "release actions" end point before
            // doing the second action.
            if (Driver is IActionExecutor executor)
            {
                executor.ResetInputState();
            }
        }

        new Actions(Driver).Click(input)
            .KeyDown(Keys.Shift)
            .KeyDown(controlModifier)
            .SendKeys(Keys.Left)
            .KeyUp(controlModifier)
            .KeyUp(Keys.Shift)
            .SendKeys(Keys.Delete)
            .Perform();

        WaitFor(() => input.GetAttribute("value") == "abc ", "did not send editing keys");
    }

    [Test]
    public void SelectionSelectAll()
    {
        string controlModifier = Keys.Control;
        if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
        {
            controlModifier = Keys.Command;
        }

        Driver.Url = Urls.WhereIs("single_text_input.html");

        IWebElement input = Driver.FindElement(By.Id("textInput"));

        new Actions(Driver).Click(input).SendKeys("abc def").Perform();

        WaitFor(() => input.GetAttribute("value") == "abc def", "did not send initial keys");

        new Actions(Driver).Click(input)
            .KeyDown(controlModifier)
            .SendKeys("a")
            .KeyUp(controlModifier)
            .SendKeys(Keys.Delete)
            .Perform();

        Assert.That(input.GetAttribute("value"), Is.EqualTo(string.Empty));
    }

    //------------------------------------------------------------------
    // Tests below here are not included in the Java test suite
    //------------------------------------------------------------------
    [Test]
    [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
    public void ShouldAllowSendingKeysWithLeftShiftPressed()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement keysEventInput = Driver.FindElement(By.Id("theworks"));

        keysEventInput.Click();

        IAction pressShift = new Actions(Driver).KeyDown(Keys.LeftShift).Build();
        pressShift.Perform();

        IAction sendLowercase = new Actions(Driver).SendKeys("ab").Build();
        sendLowercase.Perform();

        IAction releaseShift = new Actions(Driver).KeyUp(Keys.LeftShift).Build();
        releaseShift.Perform();

        AssertThatFormEventsFiredAreExactly("focus keydown keydown keypress keyup keydown keypress keyup keyup");

        Assert.That(keysEventInput.GetAttribute("value"), Is.EqualTo("AB"));
    }

    private void AssertThatFormEventsFiredAreExactly(string message, string expected)
    {
        Assert.That(Driver.FindElement(By.Id("result")).Text.Trim(), Is.EqualTo(expected), message);
    }

    private void AssertThatFormEventsFiredAreExactly(string expected)
    {
        AssertThatFormEventsFiredAreExactly(string.Empty, expected);
    }

    private void AssertThatBodyEventsFiredAreExactly(string expected)
    {
        Assert.That(Driver.FindElement(By.Id("body_result")).Text.Trim(), Is.EqualTo(expected));
    }

    private Func<bool> BackgroundColorToChangeFrom(IWebElement element, Color currentColor)
    {
        return () =>
        {
            string hexValue = string.Format("#{0:x2}{1:x2}{2:x2}", currentColor.R, currentColor.G, currentColor.B);
            string rgbValue = string.Format("rgb({0}, {1}, {2})", currentColor.R, currentColor.G, currentColor.B);
            string rgbaValue = string.Format("rgba({0}, {1}, {2}, 1)", currentColor.R, currentColor.G, currentColor.B);
            string actual = element.GetCssValue("background-color");
            return actual != hexValue && actual != rgbValue && actual != rgbaValue;
        };
    }

    private void AssertBackgroundColor(IWebElement el, Color expected)
    {
        string hexValue = string.Format("#{0:x2}{1:x2}{2:x2}", expected.R, expected.G, expected.B);
        string rgbValue = string.Format("rgb({0}, {1}, {2})", expected.R, expected.G, expected.B);
        string rgbaValue = string.Format("rgba({0}, {1}, {2}, 1)", expected.R, expected.G, expected.B);
        string actual = el.GetCssValue("background-color");
        Assert.That(actual, Is.EqualTo(hexValue).Or.EqualTo(rgbValue).Or.EqualTo(rgbaValue));
    }
}
