using System;
using System.Collections.Generic;
using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class WindowSwitchingTest : DriverTestFixture
    {
        [Test]
        [IgnoreBrowser(Browser.WindowsPhone, "Driver does not support multiple windows")]
        public void ShouldSwitchFocusToANewWindowWhenItIsOpenedAndNotStopFutureOperations()
        {
            driver.Url = xhtmlTestPage;
            String current = driver.CurrentWindowHandle;

            driver.FindElement(By.LinkText("Open new window")).Click();
            Assert.AreEqual("XHTML Test Page", driver.Title);

            WaitFor(WindowCountToBe(2), "Window count was not 2");
            WaitFor(WindowWithName("result"), "Could not find window with name 'result'");
            WaitFor(() => { return driver.Title == "We Arrive Here"; }, "Browser title was not 'We Arrive Here'");
            Assert.AreEqual("We Arrive Here", driver.Title);

            driver.Url = iframesPage;
            string handle = driver.CurrentWindowHandle;
            driver.FindElement(By.Id("iframe_page_heading"));
            driver.SwitchTo().Frame("iframe1");
            Assert.AreEqual(driver.CurrentWindowHandle, handle);
            driver.SwitchTo().DefaultContent();
            driver.Close();

            driver.SwitchTo().Window(current);
            //Assert.AreEqual("XHTML Test Page", driver.Title);
        }

        [Test]
        public void ShouldThrowNoSuchWindowException() {
            driver.Url = xhtmlTestPage;
            String current = driver.CurrentWindowHandle;
            try
            {
                driver.SwitchTo().Window("invalid name");
            }
            catch (NoSuchWindowException)
            {
                // This is expected.
            }

            driver.SwitchTo().Window(current);
        }

        [Test]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.WindowsPhone, "Driver does not support multiple windows")]
        public void ShouldThrowNoSuchWindowExceptionOnAnAttemptToGetItsHandle()
        {
            driver.Url = (xhtmlTestPage);
            String current = driver.CurrentWindowHandle;
            int currentWindowHandles = driver.WindowHandles.Count;

            driver.FindElement(By.LinkText("Open new window")).Click();

            WaitFor(WindowCountToBe(2), "Window count was not 2");
            Assert.AreEqual(2, driver.WindowHandles.Count);

            WaitFor(WindowWithName("result"), "Could not find window with name 'result'");
            driver.SwitchTo().Window("result");
            driver.Close();

            try
            {
                string currentHandle = driver.CurrentWindowHandle;
                Assert.Fail("NoSuchWindowException expected");
            }
            catch (NoSuchWindowException)
            {
                // Expected.
            }
            finally
            {
                driver.SwitchTo().Window(current);
            }
        }

        [Test]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.WindowsPhone, "Driver does not support multiple windows")]
        public void ShouldThrowNoSuchWindowExceptionOnAnyOperationIfAWindowIsClosed()
        {
            driver.Url = (xhtmlTestPage);
            String current = driver.CurrentWindowHandle;
            int currentWindowHandles = driver.WindowHandles.Count;

            driver.FindElement(By.LinkText("Open new window")).Click();

            WaitFor(WindowCountToBe(2), "Window count was not 2");
            Assert.AreEqual(2, driver.WindowHandles.Count);

            WaitFor(WindowWithName("result"), "Could not find window with name 'result'");
            driver.SwitchTo().Window("result");
            driver.Close();

            try
            {
                try
                {
                    string title = driver.Title;
                    Assert.Fail("NoSuchWindowException expected");
                }
                catch (NoSuchWindowException)
                {
                    // Expected.
                }

                try
                {
                    driver.FindElement(By.TagName("body"));
                    Assert.Fail("NoSuchWindowException expected");
                }
                catch (NoSuchWindowException)
                {
                    // Expected.
                }
            }
            finally
            {
                driver.SwitchTo().Window(current);
            }
        }

        [Test]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.WindowsPhone, "Driver does not support multiple windows")]
        public void ShouldThrowNoSuchWindowExceptionOnAnyElementOperationIfAWindowIsClosed()
        {
            driver.Url = (xhtmlTestPage);
            String current = driver.CurrentWindowHandle;
            int currentWindowHandles = driver.WindowHandles.Count;

            driver.FindElement(By.LinkText("Open new window")).Click();

            WaitFor(WindowCountToBe(2), "Window count was not 2");
            Assert.AreEqual(2, driver.WindowHandles.Count);

            WaitFor(WindowWithName("result"), "Could not find window with name 'result'");
            driver.SwitchTo().Window("result");
            IWebElement body = driver.FindElement(By.TagName("body"));
            driver.Close();

            try
            {
                string bodyText = body.Text;
                Assert.Fail("NoSuchWindowException expected");
            }
            catch (NoSuchWindowException)
            {
                // Expected.
            }
            finally
            {
                driver.SwitchTo().Window(current);
            }
        }

        [Test]
        [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
        [IgnoreBrowser(Browser.IE)]
        public void ShouldBeAbleToIterateOverAllOpenWindows()
        {
            driver.Url = xhtmlTestPage;
            driver.FindElement(By.Name("windowOne")).Click();
            WaitFor(WindowCountToBe(2), "Window count was not 2");
            driver.FindElement(By.Name("windowTwo")).Click();
            WaitFor(WindowCountToBe(3), "Window count was not 3");

            ReadOnlyCollection<string> allWindowHandles = driver.WindowHandles;

            // There should be three windows. We should also see each of the window titles at least once.
            List<string> seenHandles = new List<string>();
            foreach (string handle in allWindowHandles)
            {
                Assert.IsFalse(seenHandles.Contains(handle));
                driver.SwitchTo().Window(handle);
                seenHandles.Add(handle);
            }

            Assert.AreEqual(3, allWindowHandles.Count);
        }

        [Test]
        public void ClickingOnAButtonThatClosesAnOpenWindowDoesNotCauseTheBrowserToHang()
        {
            bool isIEDriver = TestUtilities.IsInternetExplorer(driver);
            bool isIE6 = TestUtilities.IsIE6(driver);
            bool isMarionette = TestUtilities.IsMarionette(driver);

            if (isMarionette)
            {
                Assert.Ignore("Hangs Firefox under Marionette");
            }

            driver.Url = xhtmlTestPage;

            String currentHandle = driver.CurrentWindowHandle;

            driver.FindElement(By.Name("windowThree")).Click();

            driver.SwitchTo().Window("result");

            try
            {
                IWebElement closeElement = WaitFor(() => { return driver.FindElement(By.Id("close")); }, "Could not find element with id 'close'");
                closeElement.Click();
                if (isIEDriver && !isIE6)
                {
                    IAlert alert = WaitFor<IAlert>(AlertToBePresent(), "No alert found");
                    alert.Accept();
                }
                // If we make it this far, we're all good.
            }
            finally
            {
                driver.SwitchTo().Window(currentHandle);
                driver.FindElement(By.Id("linkId"));
            }
        }

        [Test]
        [Category("Javascript")]
        public void CanCallGetWindowHandlesAfterClosingAWindow()
        {
            bool isIEDriver = TestUtilities.IsInternetExplorer(driver);
            bool isIE6 = TestUtilities.IsIE6(driver);
            bool isMarionette = TestUtilities.IsMarionette(driver);

            if (isMarionette)
            {
                Assert.Ignore("Clicking on element that closes window can hang Marionette.");
            }

            driver.Url = xhtmlTestPage;

            String currentHandle = driver.CurrentWindowHandle;

            driver.FindElement(By.Name("windowThree")).Click();

            driver.SwitchTo().Window("result");

            try
            {
                IWebElement closeElement = WaitFor(() => { return driver.FindElement(By.Id("close")); }, "Could not find element with id 'close'");
                closeElement.Click();
                if (isIEDriver && !isIE6)
                {
                    IAlert alert = WaitFor<IAlert>(AlertToBePresent(), "No alert found");
                    alert.Accept();
                }
                ReadOnlyCollection<string> handles = driver.WindowHandles;
                // If we make it this far, we're all good.
            }
            finally
            {
                driver.SwitchTo().Window(currentHandle);
            }
        }

        [Test]
        public void CanObtainAWindowHandle()
        {
            driver.Url = xhtmlTestPage;

            String currentHandle = driver.CurrentWindowHandle;

            Assert.IsNotNull(currentHandle);
        }

        [Test]
        public void FailingToSwitchToAWindowLeavesTheCurrentWindowAsIs()
        {
            driver.Url = xhtmlTestPage;
            String current = driver.CurrentWindowHandle;

            try
            {
                driver.SwitchTo().Window("i will never exist");
                Assert.Fail("Should not be ablt to change to a non-existant window");
            }
            catch (NoSuchWindowException)
            {
                // expected
            }

            String newHandle = driver.CurrentWindowHandle;

            Assert.AreEqual(current, newHandle);
        }

        [Test]
        [IgnoreBrowser(Browser.WindowsPhone, "Driver does not support multiple windows")]
        [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
        public void CanCloseWindowWhenMultipleWindowsAreOpen()
        {
            driver.Url = xhtmlTestPage;
            driver.FindElement(By.Name("windowOne")).Click();

            WaitFor(WindowCountToBe(2), "Window count was not 2");

            ReadOnlyCollection<string> allWindowHandles = driver.WindowHandles;

            // There should be two windows. We should also see each of the window titles at least once.
            Assert.AreEqual(2, allWindowHandles.Count);
            string handle1 = allWindowHandles[1];
            driver.SwitchTo().Window(handle1);
            driver.Close();

            WaitFor(WindowCountToBe(1), "Window count was not 1");

            allWindowHandles = driver.WindowHandles;
            Assert.AreEqual(1, allWindowHandles.Count);
        }

        [Test]
        [NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
        public void ClosingOnlyWindowShouldNotCauseTheBrowserToHang()
        {
            driver.Url = xhtmlTestPage;
            driver.Close();
        }

        //////////////////////////////////////////////////////////
        // Tests below here do not exist in the Java unit tests.
        //////////////////////////////////////////////////////////

        [Test]
        [IgnoreBrowser(Browser.WindowsPhone, "Driver does not support multiple windows")]
        public void ShouldGetBrowserHandles()
        {
            driver.Url = xhtmlTestPage;
            driver.FindElement(By.LinkText("Open new window")).Click();

            WaitFor(WindowCountToBe(2), "Window count was not 2");

            string handle1, handle2;
            handle1 = driver.CurrentWindowHandle;

            System.Threading.Thread.Sleep(1000);
            driver.SwitchTo().Window("result");
            handle2 = driver.CurrentWindowHandle;

            ReadOnlyCollection<string> handles = driver.WindowHandles;

            // At least the two handles we want should be there.
            Assert.Contains(handle1, handles, "Should have contained current handle");
            Assert.Contains(handle2, handles, "Should have contained result handle");

            // Some (semi-)clean up..
            driver.SwitchTo().Window(handle2);
            driver.Close();
            driver.SwitchTo().Window(handle1);
            driver.Url = macbethPage;
        }

        [Test]
        [Ignore("Ignored for all browsers")]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        public void CloseShouldCloseCurrentHandleOnly()
        {
            driver.Url = xhtmlTestPage;
            driver.FindElement(By.LinkText("Open new window")).Click();

            WaitFor(WindowCountToBe(2), "Window count was not 2");

            string handle1, handle2;
            handle1 = driver.CurrentWindowHandle;

            driver.SwitchTo().Window("result");
            handle2 = driver.CurrentWindowHandle;
           
            driver.Close();

            SleepBecauseWindowsTakeTimeToOpen();

            ReadOnlyCollection<string> handles = driver.WindowHandles;

            Assert.IsFalse(handles.Contains(handle2), "Invalid handle still in handle list");
            Assert.IsTrue(handles.Contains(handle1), "Valid handle not in handle list");
        }


        private void SleepBecauseWindowsTakeTimeToOpen()
        {
            try
            {
                System.Threading.Thread.Sleep(1000);
            }
            catch (Exception)
            {
                Assert.Fail("Interrupted");
            }
        }

        private Func<bool> WindowCountToBe(int desiredCount)
        {
            return () =>
            {
                return driver.WindowHandles.Count == desiredCount;
            };
        }

        private Func<bool> WindowWithName(string name)
        {
            return () =>
            {
                try
                {
                    driver.SwitchTo().Window(name);
                    return true;
                }
                catch (NoSuchWindowException)
                {
                }

                return false;
            };
        }

        private Func<IAlert> AlertToBePresent()
        {
            return () =>
            {
                IAlert alert = null;
                try
                {
                    alert = driver.SwitchTo().Alert();
                }
                catch (NoAlertPresentException)
                {
                }

                return alert;
            };
        }
    }
}
