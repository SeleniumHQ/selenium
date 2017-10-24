using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Collections.ObjectModel;
using OpenQA.Selenium.Environment;

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
        public void ShouldFireClickEventWhenClicking()
        {
            driver.Url = javascriptPage;

            ClickOnElementWhichRecordsEvents();

            AssertEventFired("click");
        }

        [Test]
        [Category("Javascript")]
        public void ShouldFireMouseDownEventWhenClicking()
        {
            driver.Url = javascriptPage;

            ClickOnElementWhichRecordsEvents();

            AssertEventFired("mousedown");
        }

        [Test]
        [Category("Javascript")]
        public void ShouldFireMouseUpEventWhenClicking()
        {
            driver.Url = javascriptPage;

            ClickOnElementWhichRecordsEvents();

            AssertEventFired("mouseup");
        }

        [Test]
        [Category("Javascript")]
        public void ShouldFireMouseOverEventWhenClicking()
        {
            driver.Url = javascriptPage;

            ClickOnElementWhichRecordsEvents();

            AssertEventFired("mouseover");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Firefox, "Firefox does not report mouse move event when clicking")]
        public void ShouldFireMouseMoveEventWhenClicking()
        {
            driver.Url = javascriptPage;

            ClickOnElementWhichRecordsEvents();

            AssertEventFired("mousemove");
        }

        [Test]
        [Category("Javascript")]
        public void ShouldNotThrowIfEventHandlerThrows()
        {
            driver.Url = javascriptPage;
            driver.FindElement(By.Id("throwing-mouseover")).Click();
        }

        [Test]
        [Category("Javascript")]
        public void ShouldFireEventsInTheRightOrder()
        {
            driver.Url = javascriptPage;

            ClickOnElementWhichRecordsEvents();

            string text = driver.FindElement(By.Id("result")).Text;

            int lastIndex = -1;
            List<string> eventList = new List<string>() { "mousedown", "focus", "mouseup", "click" };
            foreach (string eventName in eventList)
            {
                int index = text.IndexOf(eventName);

                Assert.IsTrue(index != -1, eventName + " did not fire at all. Text is " + text);
                Assert.IsTrue(index > lastIndex, eventName + " did not fire in the correct order. Text is " + text);
                lastIndex = index;
            }
        }

        [Test]
        [Category("Javascript")]
        public void ShouldIssueMouseDownEvents()
        {
            driver.Url = javascriptPage;
            driver.FindElement(By.Id("mousedown")).Click();

            String result = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual(result, "mouse down");
        }

        [Test]
        [Category("Javascript")]
        public void ShouldIssueClickEvents()
        {
            driver.Url = javascriptPage;
            driver.FindElement(By.Id("mouseclick")).Click();

            String result = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual(result, "mouse click");
        }

        [Test]
        [Category("Javascript")]
        public void ShouldIssueMouseUpEvents()
        {
            driver.Url = javascriptPage;
            driver.FindElement(By.Id("mouseup")).Click();

            String result = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual(result, "mouse up");
        }

        [Test]
        [Category("Javascript")]
        public void MouseEventsShouldBubbleUpToContainingElements()
        {
            driver.Url = javascriptPage;
            driver.FindElement(By.Id("child")).Click();

            String result = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual(result, "mouse down");
        }

        [Test]
        [Category("Javascript")]
        public void ShouldEmitOnChangeEventsWhenSelectingElements()
        {
            driver.Url = javascriptPage;
            //Intentionally not looking up the select tag.  See selenium r7937 for details.
            ReadOnlyCollection<IWebElement> allOptions = driver.FindElements(By.XPath("//select[@id='selector']//option"));

            String initialTextValue = driver.FindElement(By.Id("result")).Text;

            IWebElement foo = allOptions[0];
            IWebElement bar = allOptions[1];

            foo.Click();
            Assert.AreEqual(driver.FindElement(By.Id("result")).Text, initialTextValue);
            bar.Click();
            Assert.AreEqual(driver.FindElement(By.Id("result")).Text, "bar");
        }

        [Test]
        [Category("Javascript")]
        public void ShouldEmitOnClickEventsWhenSelectingElements()
        {
            driver.Url = javascriptPage;
            // Intentionally not looking up the select tag. See selenium r7937 for details.
            ReadOnlyCollection<IWebElement> allOptions = driver.FindElements(By.XPath("//select[@id='selector2']//option"));

            IWebElement foo = allOptions[0];
            IWebElement bar = allOptions[1];

            foo.Click();
            Assert.AreEqual(driver.FindElement(By.Id("result")).Text, "foo");
            bar.Click();
            Assert.AreEqual(driver.FindElement(By.Id("result")).Text, "bar");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IE, "IE does not fire change event when clicking on checkbox")]
        public void ShouldEmitOnChangeEventsWhenChangingTheStateOfACheckbox()
        {
            driver.Url = javascriptPage;
            IWebElement checkbox = driver.FindElement(By.Id("checkbox"));

            checkbox.Click();
            Assert.AreEqual(driver.FindElement(By.Id("result")).Text, "checkbox thing");
        }

        [Test]
        [Category("Javascript")]
        public void ShouldEmitClickEventWhenClickingOnATextInputElement()
        {
            driver.Url = javascriptPage;

            IWebElement clicker = driver.FindElement(By.Id("clickField"));
            clicker.Click();

            Assert.AreEqual(clicker.GetAttribute("value"), "Clicked");
        }

        [Test]
        [Category("Javascript")]
        public void ShouldFireTwoClickEventsWhenClickingOnALabel()
        {
            driver.Url = javascriptPage;

            driver.FindElement(By.Id("labelForCheckbox")).Click();

            IWebElement result = driver.FindElement(By.Id("result"));
            Assert.IsTrue(WaitFor(() => { return result.Text.Contains("labelclick chboxclick"); }, "Did not find text: " + result.Text));
        }


        [Test]
        [Category("Javascript")]
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
        public void SendingKeysToAnElementShouldCauseTheFocusEventToFire()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("theworks"));
            element.SendKeys("foo");
            AssertEventFired("focus");
        }

        [Test]
        [Category("Javascript")]
        public void SendingKeysToAFocusedElementShouldNotBlurThatElement()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("theworks"));
            element.Click();

            //Wait until focused
            bool focused = false;
            IWebElement result = driver.FindElement(By.Id("result"));
            for (int i = 0; i < 5; ++i)
            {
                string fired = result.Text;
                if (fired.Contains("focus"))
                {
                    focused = true;
                    break;
                }
                try
                {
                    System.Threading.Thread.Sleep(200);
                }
                catch (Exception e)
                {
                    throw e;
                }
            }
            if (!focused)
            {
                Assert.Fail("Clicking on element didn't focus it in time - can't proceed so failing");
            }

            element.SendKeys("a");
            AssertEventNotFired("blur");
        }

        [Test]
        [Category("Javascript")]
        public void SubmittingFormFromFormElementShouldFireOnSubmitForThatForm()
        {
            driver.Url = javascriptPage;
            IWebElement formElement = driver.FindElement(By.Id("submitListeningForm"));
            formElement.Submit();
            AssertEventFired("form-onsubmit");
        }

        [Test]
        [Category("Javascript")]
        public void SubmittingFormFromFormInputSubmitElementShouldFireOnSubmitForThatForm()
        {
            driver.Url = javascriptPage;
            IWebElement submit = driver.FindElement(By.Id("submitListeningForm-submit"));
            submit.Submit();
            AssertEventFired("form-onsubmit");
        }

        [Test]
        [Category("Javascript")]
        public void SubmittingFormFromFormInputTextElementShouldFireOnSubmitForThatFormAndNotClickOnThatInput()
        {
            driver.Url = javascriptPage;
            IWebElement submit = driver.FindElement(By.Id("submitListeningForm-submit"));
            submit.Submit();
            AssertEventFired("form-onsubmit");
            AssertEventNotFired("text-onclick");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.WindowsPhone, "Does not yet support file uploads")]
        public void UploadingFileShouldFireOnChangeEvent()
        {
            driver.Url = formsPage;
            IWebElement uploadElement = driver.FindElement(By.Id("upload"));
            IWebElement result = driver.FindElement(By.Id("fileResults"));
            Assert.AreEqual(string.Empty, result.Text);

            string filePath = System.IO.Path.Combine(EnvironmentManager.Instance.CurrentDirectory, "test.txt");
            System.IO.FileInfo inputFile = new System.IO.FileInfo(filePath);
            System.IO.StreamWriter inputFileWriter = inputFile.CreateText();
            inputFileWriter.WriteLine("Hello world");
            inputFileWriter.Close();

            uploadElement.SendKeys(inputFile.FullName);
            // Shift focus to something else because send key doesn't make the focus leave
            driver.FindElement(By.Id("id-name1")).Click();

            inputFile.Delete();
            Assert.AreEqual("changed", result.Text);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        public void ShouldReportTheXAndYCoordinatesWhenClicking()
        {
            driver.Url = clickEventPage;

            IWebElement element = driver.FindElement(By.Id("eventish"));
            element.Click();

            driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(2);
            string clientX = driver.FindElement(By.Id("clientX")).Text;
            string clientY = driver.FindElement(By.Id("clientY")).Text;
            driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(0);

            Assert.AreNotEqual("0", clientX);
            Assert.AreNotEqual("0", clientY);
        }

        [Test]
        public void ClickEventsShouldBubble()
        {
            driver.Url = clicksPage;
            driver.FindElement(By.Id("bubblesFrom")).Click();
            bool eventBubbled = (bool)((IJavaScriptExecutor)driver).ExecuteScript("return !!window.bubbledClick;");
            Assert.IsTrue(eventBubbled, "Event didn't bubble up");
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "IE doesn't support detecting overlapped elements")]
        public void ClickOverlappingElements()
        {
            if (TestUtilities.IsOldIE(driver))
            {
                Assert.Ignore("Not supported on IE < 9");
            }

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_tests/overlapping_elements.html");
            var ex = Assert.Throws<WebDriverException>(() => driver.FindElement(By.Id("under")).Click());
            Assert.That(ex.Message.Contains("Other element would receive the click"));
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "IE doesn't support detecting overlapped elements")]
        [IgnoreBrowser(Browser.Chrome)]
        public void ClickPartiallyOverlappingElements()
        {
            if (TestUtilities.IsOldIE(driver))
            {
                Assert.Ignore("Not supported on IE < 9");
            }

            StringBuilder expectedLogBuilder = new StringBuilder();
            expectedLogBuilder.AppendLine("Log:");
            expectedLogBuilder.AppendLine("mousedown in under (handled by under)");
            expectedLogBuilder.AppendLine("mousedown in under (handled by body)");
            expectedLogBuilder.AppendLine("mouseup in under (handled by under)");
            expectedLogBuilder.AppendLine("mouseup in under (handled by body)");
            expectedLogBuilder.AppendLine("click in under (handled by under)");
            expectedLogBuilder.Append("click in under (handled by body)");

            for (int i = 1; i < 6; i++)
            {
                driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_tests/partially_overlapping_elements.html");
                IWebElement over = driver.FindElement(By.Id("over" + i));
                ((IJavaScriptExecutor)driver).ExecuteScript("arguments[0].style.display = 'none'", over);
                driver.FindElement(By.Id("under")).Click();
                Assert.AreEqual(expectedLogBuilder.ToString(), driver.FindElement(By.Id("log")).Text);
            }
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox)]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.Safari)]
        public void NativelyClickOverlappingElements()
        {
            if (TestUtilities.IsOldIE(driver))
            {
                Assert.Ignore("Not supported on IE < 9");
            }

            StringBuilder expectedLogBuilder = new StringBuilder();
            expectedLogBuilder.AppendLine("Log:");
            expectedLogBuilder.AppendLine("mousedown in over (handled by over)");
            expectedLogBuilder.AppendLine("mousedown in over (handled by body)");
            expectedLogBuilder.AppendLine("mouseup in over (handled by over)");
            expectedLogBuilder.AppendLine("mouseup in over (handled by body)");
            expectedLogBuilder.AppendLine("click in over (handled by over)");
            expectedLogBuilder.Append("click in over (handled by body)");

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_tests/overlapping_elements.html");
            driver.FindElement(By.Id("under")).Click();
            Assert.AreEqual(expectedLogBuilder.ToString(), driver.FindElement(By.Id("log")).Text);
        }

        [Test]
        public void ClickAnElementThatDisappear()
        {
            if (TestUtilities.IsOldIE(driver))
            {
                Assert.Ignore("Not supported on IE < 9");
            }

            StringBuilder expectedLogBuilder = new StringBuilder();
            expectedLogBuilder.AppendLine("Log:");
            expectedLogBuilder.AppendLine("mousedown in over (handled by over)");
            expectedLogBuilder.AppendLine("mousedown in over (handled by body)");
            expectedLogBuilder.AppendLine("mouseup in under (handled by under)");
            expectedLogBuilder.Append("mouseup in under (handled by body)");

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_tests/disappearing_element.html");
            driver.FindElement(By.Id("over")).Click();
            Assert.That(driver.FindElement(By.Id("log")).Text.StartsWith(expectedLogBuilder.ToString()));
        }

        private void AssertEventNotFired(string eventName)
        {
            IWebElement result = driver.FindElement(By.Id("result"));
            string text = result.Text;
            Assert.IsFalse(text.Contains(eventName), eventName + " fired: " + text);
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
