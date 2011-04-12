using NUnit.Framework;
using OpenQA.Selenium.IE;
using System;
using OpenQA.Selenium.Environment;
using System.Collections.ObjectModel;

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
        [IgnoreBrowser(Browser.IE, "Race condition can cause test to occasionally hang")]
        public void ShouldHandleShowModalDialogWindows()
        {
            driver.Url = alertsPage;
            string originalWindowHandle = driver.CurrentWindowHandle;
            IWebElement element = driver.FindElement(By.Id("dialog"));
            element.Click();

            DateTime end = DateTime.Now.Add(TimeSpan.FromSeconds(5));
            ReadOnlyCollection<string> windowHandles = driver.WindowHandles;
            while (windowHandles.Count < 2 && DateTime.Now < end)
            {
                System.Threading.Thread.Sleep(100);
                windowHandles = driver.WindowHandles;
            }
            
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
            
            end = DateTime.Now.Add(TimeSpan.FromSeconds(5));
            windowHandles = driver.WindowHandles;
            while (windowHandles.Count > 1 && DateTime.Now < end)
            {
                System.Threading.Thread.Sleep(100);
                windowHandles = driver.WindowHandles;
            }
            
            Assert.AreEqual(1, windowHandles.Count);
            driver.SwitchTo().Window(originalWindowHandle);
        }
    }
}
