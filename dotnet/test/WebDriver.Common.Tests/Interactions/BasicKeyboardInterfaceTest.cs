using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NUnit.Framework;

namespace OpenQA.Selenium.Interactions
{
    [Ignore]
    [TestFixture]
    public class BasicKeyboardInterfaceTest : DriverTestFixture
    {
        [Test]
        public void testBasicKeyboardInput()
        {
            driver.Url = javascriptPage;

            IWebElement keyReporter = driver.FindElement(By.Id("keyReporter"));

            IAction sendLowercase = GetBuilder().SendKeys(keyReporter, "abc def").Build();

            sendLowercase.Perform();

            Assert.AreEqual("abc def", keyReporter.Value);

        }

        [Test]
        public void testSendingKeyDownOnly()
        {
            driver.Url = javascriptPage;

            IWebElement keysEventInput = driver.FindElement(By.Id("theworks"));

            IAction pressShift = GetBuilder().KeyDown(keysEventInput, Keys.Shift).Build();

            pressShift.Perform();

            IWebElement keyLoggingElement = driver.FindElement(By.Id("result"));

            Assert.IsTrue(keyLoggingElement.Text.EndsWith("keydown"), "Key down event not isolated, got: " + keyLoggingElement.Text);
        }

        [Test]
        public void testSendingKeyUp()
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
        public void testSendingKeysWithShiftPressed()
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
        public void testSendingKeysToActiveElement()
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
        public void testBasicKeyboardInputOnActiveElement()
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
