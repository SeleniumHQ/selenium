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
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.Chrome, "Webkit bug 22261")]
        public void ShouldFireFocusEventWhenClicking()
        {
            driver.Url = javascriptPage;

            ClickOnElementWhichRecordsEvents();

            AssertEventFired("focus");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Android)]
        public void ShouldFireClickEventWhenClicking()
        {
            driver.Url = javascriptPage;

            ClickOnElementWhichRecordsEvents();

            AssertEventFired("click");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Android)]
        public void ShouldFireMouseDownEventWhenClicking()
        {
            driver.Url = javascriptPage;

            ClickOnElementWhichRecordsEvents();

            AssertEventFired("mousedown");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Android)]
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
        [IgnoreBrowser(Browser.Chrome, "Chrome does not report mouse move event when clicking")]
        [IgnoreBrowser(Browser.Firefox, "Firefox does not report mouse move event when clicking")]
        public void ShouldFireMouseMoveEventWhenClicking()
        {
            driver.Url = javascriptPage;

            ClickOnElementWhichRecordsEvents();

            AssertEventFired("mousemove");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        public void ShouldNotThrowIfEventHandlerThrows()
        {
            driver.Url = javascriptPage;
            driver.FindElement(By.Id("throwing-mouseover")).Click();
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.Chrome, "Webkit bug 22261")]
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

                Assert.IsTrue(index != -1, eventName + " did not fire at all");
                Assert.IsTrue(index > lastIndex, eventName + " did not fire in the correct order");
                lastIndex = index;
            }
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Android)]
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
        [IgnoreBrowser(Browser.IPhone)]
        public void MouseEventsShouldBubbleUpToContainingElements()
        {
            driver.Url = javascriptPage;
            driver.FindElement(By.Id("child")).Click();

            String result = driver.FindElement(By.Id("result")).Text;
            Assert.AreEqual(result, "mouse down");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IPhone)]
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
        [IgnoreBrowser(Browser.Android)]
        public void ShouldFireTwoClickEventsWhenClickingOnALabel()
        {
            driver.Url = javascriptPage;

            driver.FindElement(By.Id("labelForCheckbox")).Click();

            IWebElement result = driver.FindElement(By.Id("result"));
            Assert.IsTrue(WaitFor(() => { return result.Text.Contains("labelclick chboxclick"); }));
        }


        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Android)]
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
        [IgnoreBrowser(Browser.IPhone, "SendKeys implementation is incorrect.")]
        [IgnoreBrowser(Browser.Android)]
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
        [IgnoreBrowser(Browser.IPhone, "SendKeys implementation is incorrect.")]
        [IgnoreBrowser(Browser.Android)]
        public void SendingKeysToAnElementShouldCauseTheFocusEventToFire()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("theworks"));
            element.SendKeys("foo");
            AssertEventFired("focus");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IPhone, "Input elements are blurred when the keyboard is closed.")]
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
        [IgnoreBrowser(Browser.IPhone, "Does not yet support file uploads")]
        [IgnoreBrowser(Browser.Android, "Does not yet support file uploads")]
        public void UploadingFileShouldFireOnChangeEvent()
        {
            driver.Url = formsPage;
            IWebElement uploadElement = driver.FindElement(By.Id("upload"));
            IWebElement result = driver.FindElement(By.Id("fileResults"));
            Assert.AreEqual(string.Empty, result.Text);

            System.IO.FileInfo inputFile = new System.IO.FileInfo("test.txt");
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

            driver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromSeconds(2));
            string clientX = driver.FindElement(By.Id("clientX")).Text;
            string clientY = driver.FindElement(By.Id("clientY")).Text;
            driver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromSeconds(0));

            Assert.AreNotEqual("0", clientX);
            Assert.AreNotEqual("0", clientY);
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
