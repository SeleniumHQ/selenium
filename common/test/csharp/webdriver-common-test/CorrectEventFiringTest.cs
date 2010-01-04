using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class CorrectEventFiringTest : DriverTestFixture
    {
        [Test]
        public void ShouldFireFocusEventWhenClicking()
        {
            driver.Url = javascriptPage;

            ClickOnElementWhichRecordsEvents();

            AssertEventFired("focus");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "Failing on OS X")]
        public void ShouldFireClickEventWhenClicking()
        {
            driver.Url = javascriptPage;

            ClickOnElementWhichRecordsEvents();

            AssertEventFired("click");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "Failing on OS X")]
        public void ShouldFireMouseDownEventWhenClicking()
        {
            driver.Url = javascriptPage;

            ClickOnElementWhichRecordsEvents();

            AssertEventFired("mousedown");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "Failing on OS X")]
        public void ShouldFireMouseUpEventWhenClicking()
        {
            driver.Url = javascriptPage;

            ClickOnElementWhichRecordsEvents();

            AssertEventFired("mouseup");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Chrome)]
        public void ShouldFireMouseOverEventWhenClicking()
        {
            driver.Url = javascriptPage;

            ClickOnElementWhichRecordsEvents();

            AssertEventFired("mouseover");
        }

        [Test]
        [Category("Javascript")]
        //[IgnoreBrowser(SELENESE)]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.Firefox)]
        public void ShouldFireMouseMoveEventWhenClicking()
        {
            driver.Url = javascriptPage;

            ClickOnElementWhichRecordsEvents();

            AssertEventFired("mousemove");
        }

        [Test]
        [Category("Javascript")]
        //[IgnoreBrowser(SELENESE)]
        [IgnoreBrowser(Browser.Chrome, "Webkit bug 22261")]
        public void ShouldFireEventsInTheRightOrder()
        {
            driver.Url = javascriptPage;

            ClickOnElementWhichRecordsEvents();

            string text = driver.FindElement(By.Id("result")).Text;

            int lastIndex = -1;
            List<string> eventList = new List<string>() {"mousedown", "focus", "mouseup", "click"};
            foreach(string eventName in eventList)
            {
                int index =  text.IndexOf(eventName);

                Assert.IsTrue(index != -1, eventName + " did not fire at all");
                Assert.IsTrue(index > lastIndex, eventName + " did not fire in the correct order");
                lastIndex = index;
            }
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "Failing on OS X")]
        public void ShouldIssueMouseDownEvents()
        {
            driver.Url = javascriptPage;
            driver.FindElement(By.Id("mousedown")).Click();

            String result = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual(result, "mouse down");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "Failing on OS X")]
        public void ShouldIssueClickEvents()
        {
            driver.Url = javascriptPage;
            driver.FindElement(By.Id("mouseclick")).Click();

            String result = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual(result, "mouse click");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "Failing on OS X")]
        public void ShouldIssueMouseUpEvents()
        {
            driver.Url = javascriptPage;
            driver.FindElement(By.Id("mouseup")).Click();

            String result = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual(result, "mouse up");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "Failing on OS X")]
        public void MouseEventsShouldBubbleUpToContainingElements()
        {
            driver.Url = javascriptPage;
            driver.FindElement(By.Id("child")).Click();

            String result = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual(result, "mouse down");
        }

        [Test]
        [Category("Javascript")]
        //[IgnoreBrowser(SELENESE)]
        //[IgnoreBrowser(Browser.IPHONE)]
        [IgnoreBrowser(Browser.Chrome, "Non-native event firing is broken in Chrome.")]
        public void ShouldEmitOnChangeEventsWhenSelectingElements()
        {
            driver.Url = javascriptPage;
            IWebElement select = driver.FindElement(By.Id("selector"));
            ReadOnlyCollection<IWebElement> allOptions = select.FindElements(By.TagName("option"));

            String initialTextValue = driver.FindElement(By.Id("result")).Text;

            IWebElement foo = allOptions[0];
            IWebElement bar = allOptions[1];

            foo.Select();
            Assert.AreEqual(driver.FindElement(By.Id("result")).Text, initialTextValue);
            bar.Select();
            Assert.AreEqual(driver.FindElement(By.Id("result")).Text, "bar");
        }

        [Test]
        [Category("Javascript")]
        //[IgnoreBrowser(SELENESE)]
        [IgnoreBrowser(Browser.Chrome, "Non-native event firing is broken in Chrome.")]
        public void ShouldEmitOnChangeEventsWhenChangingTheStateOfACheckbox()
        {
            driver.Url = javascriptPage;
            IWebElement checkbox = driver.FindElement(By.Id("checkbox"));

            checkbox.Select();
            Assert.AreEqual(driver.FindElement(By.Id("result")).Text, "checkbox thing");
        }

        [Test]
        [Category("Javascript")]
        public void ShouldEmitClickEventWhenClickingOnATextInputElement()
        {
            driver.Url = javascriptPage;

            IWebElement clicker = driver.FindElement(By.Id("clickField"));
            clicker.Click();

            Assert.AreEqual(clicker.Value, "Clicked");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Chrome, "Non-native event firing is broken in Chrome.")]
        public void ClearingAnElementShouldCauseTheOnChangeHandlerToFire()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("clearMe"));
            element.Clear();

            IWebElement result = driver.FindElement(By.Id("result"));
            Assert.AreEqual(result.Text, "Cleared");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Chrome, "Non-native event firing is broken in Chrome.")]
        public void SendingKeysToAnotherElementShouldCauseTheBlurEventToFire()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("theworks"));
            element.SendKeys("foo");
            IWebElement element2 = driver.FindElement(By.Id("changeable"));
            element2.SendKeys("bar");
            AssertEventFired("blur");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Chrome, "Non-native event firing is broken in Chrome.")]
        public void SendingKeysToAnElementShouldCauseTheFocusEventToFire()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("theworks"));
            element.SendKeys("foo");
            AssertEventFired("focus");
        }

        private void ClickOnElementWhichRecordsEvents()
        {
            driver.FindElement(By.Id("plainButton")).Click();
        }

        private void AssertEventFired(String eventName)
        {
            IWebElement result = driver.FindElement(By.Id("result"));
            string text = result.Text;
            Assert.IsTrue(text.Contains(eventName), "No " + eventName + " fired: " + text);
        }
    }
}
