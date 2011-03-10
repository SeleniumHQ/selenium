using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;

namespace OpenQA.Selenium.Interactions
{
    [TestFixture]
    public class BasicKeyboardInterfaceTest : DriverTestFixture
    {
        [Test]
        [IgnoreBrowser(Browser.Firefox, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Chrome, "API not implemented in driver")]
        [IgnoreBrowser(Browser.IPhone, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        public void ShouldAllowBasicKeyboardInput()
        {
            driver.Url = javascriptPage;

            IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));

            IAction sendLowercase = GetBuilder().SendKeys(keyReporter, "abc def").Build();

            sendLowercase.Perform();

            Assert.AreEqual("abc def", keyReporter.Value);

        }

        [Test]
        [IgnoreBrowser(Browser.Firefox, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Chrome, "API not implemented in driver")]
        [IgnoreBrowser(Browser.IPhone, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        public void ShouldAllowSendingKeyDownOnly()
        {
            driver.Url = javascriptPage;

            IWebElement keysEventInput = driver.FindElement(By.Id("theworks"));

            IAction pressShift = GetBuilder().KeyDown(keysEventInput, Keys.Shift).Build();

            pressShift.Perform();

            IWebElement keyLoggingElement = driver.FindElement(By.Id("result"));

            Assert.IsTrue(keyLoggingElement.Text.EndsWith("keydown"), "Key down event not isolated, got: " + keyLoggingElement.Text);
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Chrome, "API not implemented in driver")]
        [IgnoreBrowser(Browser.IPhone, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        public void ShouldAllowSendingKeyUp()
        {
            driver.Url = javascriptPage;
            IWebElement keysEventInput = driver.FindElement(By.Id("theworks"));

            IAction pressShift = GetBuilder().KeyDown(keysEventInput, Keys.Shift).Build();
            pressShift.Perform();

            IWebElement keyLoggingElement = driver.FindElement(By.Id("result"));

            string eventsText = keyLoggingElement.Text;
            Assert.IsTrue(keyLoggingElement.Text.EndsWith("keydown"), "Key down should be isolated for this test to be meaningful. Got events: " + eventsText);

            IAction releaseShift = GetBuilder().KeyUp(keysEventInput, Keys.Shift).Build();

            releaseShift.Perform();

            eventsText = keyLoggingElement.Text;
            Assert.IsTrue(keyLoggingElement.Text.EndsWith("keyup"), "Key up event not isolated, got: " + eventsText);
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Chrome, "API not implemented in driver")]
        [IgnoreBrowser(Browser.IPhone, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        public void ShouldAllowSendingKeysWithShiftPressed()
        {
            driver.Url = javascriptPage;

            IWebElement keysEventInput = driver.FindElement(By.Id("theworks"));

            keysEventInput.Click();

            IAction pressShift = GetBuilder().KeyDown(keysEventInput, Keys.Shift).Build();
            pressShift.Perform();

            IAction sendLowercase = GetBuilder().SendKeys(keysEventInput, "ab").Build();
            sendLowercase.Perform();

            IAction releaseShift = GetBuilder().KeyUp(keysEventInput, Keys.Shift).Build();
            releaseShift.Perform();

            IWebElement keyLoggingElement = driver.FindElement(By.Id("result"));
            Assert.AreEqual("focus keydown keydown keypress keyup keydown keypress keyup keyup", keyLoggingElement.Text, "Shift key not held, events: " + keyLoggingElement.Text);

            Assert.AreEqual("AB", keysEventInput.Value);
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Chrome, "API not implemented in driver")]
        [IgnoreBrowser(Browser.IPhone, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        public void ShouldAllowSendingKeysToActiveElement()
        {
            driver.Url = bodyTypingPage;

            IAction someKeys = GetBuilder().SendKeys("ab").Build();
            someKeys.Perform();

            IWebElement bodyLoggingElement = driver.FindElement(By.Id("body_result"));
            Assert.AreEqual("keypress keypress", bodyLoggingElement.Text);

            IWebElement formLoggingElement = driver.FindElement(By.Id("result"));
            Assert.AreEqual("", formLoggingElement.Text);
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Chrome, "API not implemented in driver")]
        [IgnoreBrowser(Browser.IPhone, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Remote, "API not implemented in driver")]
        [IgnoreBrowser(Browser.Android, "API not implemented in driver")]
        public void ShouldAllowBasicKeyboardInputOnActiveElement()
        {
            driver.Url = javascriptPage;

            IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));

            keyReporter.Click();

            IAction sendLowercase = GetBuilder().SendKeys("abc def").Build();

            sendLowercase.Perform();

            Assert.AreEqual("abc def", keyReporter.Value);
        }

        private IActionSequenceBuilder GetBuilder()
        {
            IHasInputDevices inputDevicesDriver = driver as IHasInputDevices;
            return inputDevicesDriver.ActionBuilder;
        }
    }
}
