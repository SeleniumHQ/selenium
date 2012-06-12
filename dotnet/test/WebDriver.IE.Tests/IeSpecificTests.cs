using NUnit.Framework;
using System;
using OpenQA.Selenium.Environment;
using System.Collections.ObjectModel;
using OpenQA.Selenium.Interactions;

namespace OpenQA.Selenium.IE
{
    [TestFixture]
    public class IeSpecificTests : DriverTestFixture
    {
        [Test]
        public void ShouldBeAbleToBrowseTransformedXml()
        {
            driver.Url = xhtmlTestPage;
            driver.FindElement(By.Id("linkId")).Click();

            // Using transformed XML (Issue 1203)
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("transformable.xml");
            driver.FindElement(By.Id("x")).Click();
            // Sleep is required; driver may not be fast enough after this Click().
            System.Threading.Thread.Sleep(2000);
            Assert.AreEqual("XHTML Test Page", driver.Title);

            // Act on the result page to make sure the window handling is still valid.
            driver.FindElement(By.Id("linkId")).Click();
            Assert.AreEqual("We Arrive Here", driver.Title);
        }

        [Test]
        public void ShouldBeAbleToStartMoreThanOneInstanceOfTheIEDriverSimultaneously()
        {
            IWebDriver secondDriver = new InternetExplorerDriver();

            driver.Url = xhtmlTestPage;
            secondDriver.Url = formsPage;

            Assert.AreEqual("XHTML Test Page", driver.Title);
            Assert.AreEqual("We Leave From Here", secondDriver.Title);

            // We only need to quit the second driver if the test passes
            secondDriver.Quit();
        }

        [Test]
        public void ShouldPropagateSessionCookies()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("sessionCookie.html");
            IWebElement setColorButton = driver.FindElement(By.Id("setcolorbutton"));
            setColorButton.Click();
            IWebElement openWindowButton = driver.FindElement(By.Id("openwindowbutton"));
            openWindowButton.Click();
            System.Threading.Thread.Sleep(2000);
            string startWindow = driver.CurrentWindowHandle;
            driver.SwitchTo().Window("cookiedestwindow");
            string bodyStyle = driver.FindElement(By.TagName("body")).GetAttribute("style");
            driver.Close();
            driver.SwitchTo().Window(startWindow);
            Assert.IsTrue(bodyStyle.Contains("BACKGROUND-COLOR: #80ffff") || bodyStyle.Contains("background-color: rgb(128, 255, 255)"));
        }

        [Test]
        public void ShouldHandleShowModalDialogWindows()
        {
            driver.Url = alertsPage;
            string originalWindowHandle = driver.CurrentWindowHandle;
            IWebElement element = driver.FindElement(By.Id("dialog"));
            element.Click();

            WaitFor(() => { return driver.WindowHandles.Count > 1; });

            ReadOnlyCollection<string> windowHandles = driver.WindowHandles;
            Assert.AreEqual(2, windowHandles.Count);
            
            string dialogHandle = string.Empty;
            foreach (string handle in windowHandles)
            {
                if (handle != originalWindowHandle)
                {
                    dialogHandle = handle;
                    break;
                }
            }
            
            Assert.AreNotEqual(string.Empty, dialogHandle);
            
            driver.SwitchTo().Window(dialogHandle);
            IWebElement closeElement = driver.FindElement(By.Id("close"));
            closeElement.Click();

            WaitFor(() => { return driver.WindowHandles.Count == 1; });

            windowHandles = driver.WindowHandles;
            Assert.AreEqual(1, windowHandles.Count);
            driver.SwitchTo().Window(originalWindowHandle);
        }

        [Test]
        public void ScrollTest()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll.html");
            driver.FindElement(By.Id("line8")).Click();
            Assert.AreEqual("line8", driver.FindElement(By.Id("clicked")).Text);
        }

        [Test]
        public void ShouldNotScrollOverflowElementsWhichAreVisible()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll2.html");
            var list = driver.FindElement(By.TagName("ul"));
            var item = list.FindElement(By.Id("desired"));
            item.Click();
            Assert.AreEqual(0, ((IJavaScriptExecutor)driver).ExecuteScript("return arguments[0].scrollTop;", list), "Should not have scrolled");
        }

        [Test]
        public void ShouldNotScrollIfAlreadyScrolledAndElementIsInView()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll3.html");
            driver.FindElement(By.Id("button1")).Click();
            var scrollTop = GetScrollTop();
            driver.FindElement(By.Id("button2")).Click();
            Assert.AreEqual(scrollTop, GetScrollTop());
        }

        private long GetScrollTop()
        {
            return (long)((IJavaScriptExecutor)driver).ExecuteScript("return document.body.scrollTop;");
        }
    }
}
