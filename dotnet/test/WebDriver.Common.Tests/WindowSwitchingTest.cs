using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using OpenQA.Selenium.Environment;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class WindowSwitchingTest : DriverTestFixture
    {
        [Test]
        public void ShouldSwitchFocusToANewWindowWhenItIsOpenedAndNotStopFutureOperations()
        {
            driver.Url = xhtmlTestPage;
            String current = driver.CurrentWindowHandle;

            driver.FindElement(By.LinkText("Open new window")).Click();
            Assert.AreEqual("XHTML Test Page", driver.Title);

            WaitFor(WindowCountToBe(2));

            driver.SwitchTo().Window("result");
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
        [NeedsFreshDriver(BeforeTest = true, AfterTest = true)]
        //[IgnoreBrowser(Browser.Firefox)]
        public void ShouldBeAbleToIterateOverAllOpenWindows()
        {
            driver.Url = xhtmlTestPage;
            driver.FindElement(By.Name("windowOne")).Click();
            WaitFor(WindowCountToBe(2));
            driver.FindElement(By.Name("windowTwo")).Click();
            WaitFor(WindowCountToBe(3));

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
        [IgnoreBrowser(Browser.IE, "IE prompts with an alert when closing. Revisit when alert handling is done")]
        public void ClickingOnAButtonThatClosesAnOpenWindowDoesNotCauseTheBrowserToHang()
        {
            driver.Url = xhtmlTestPage;

            String currentHandle = driver.CurrentWindowHandle;

            driver.FindElement(By.Name("windowThree")).Click();

            driver.SwitchTo().Window("result");

            try
            {
                driver.FindElement(By.Id("close")).Click();
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
        [IgnoreBrowser(Browser.IE, "IE prompts with an alert when closing. Revisit when alert handling is done")]
        public void CanCallGetWindowHandlesAfterClosingAWindow()
        {
            driver.Url = xhtmlTestPage;

            String currentHandle = driver.CurrentWindowHandle;

            driver.FindElement(By.Name("windowThree")).Click();

            driver.SwitchTo().Window("result");

            try
            {
                driver.FindElement(By.Id("close")).Click();
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
        [NeedsFreshDriver(BeforeTest = true, AfterTest = true)]
        public void CanCloseWindowWhenMultipleWindowsAreOpen()
        {
            driver.Url = xhtmlTestPage;
            driver.FindElement(By.Name("windowOne")).Click();

            WaitFor(WindowCountToBe(2));

            ReadOnlyCollection<string> allWindowHandles = driver.WindowHandles;

            // There should be two windows. We should also see each of the window titles at least once.
            Assert.AreEqual(2, allWindowHandles.Count);
            string handle1 = allWindowHandles[1];
            driver.SwitchTo().Window(handle1);
            driver.Close();

            WaitFor(WindowCountToBe(1));

            allWindowHandles = driver.WindowHandles;
            Assert.AreEqual(1, allWindowHandles.Count);
        }

        [Test]
        [NeedsFreshDriver(BeforeTest = true, AfterTest = true)]
        public void ClosingOnlyWindowShouldNotCauseTheBrowserToHang()
        {
            driver.Url = xhtmlTestPage;
            driver.Close();
        }

        //////////////////////////////////////////////////////////
        // Tests below here do not exist in the Java unit tests.
        //////////////////////////////////////////////////////////

        [Test]
        public void ShouldGetBrowserHandles()
        {
            driver.Url = xhtmlTestPage;
            driver.FindElement(By.LinkText("Open new window")).Click();

            WaitFor(WindowCountToBe(2));

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
        [Ignore]
        [NeedsFreshDriver(AfterTest = true)]
        public void CloseShouldCloseCurrentHandleOnly()
        {
            driver.Url = xhtmlTestPage;
            driver.FindElement(By.LinkText("Open new window")).Click();

            WaitFor(WindowCountToBe(2));

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
    }
}
