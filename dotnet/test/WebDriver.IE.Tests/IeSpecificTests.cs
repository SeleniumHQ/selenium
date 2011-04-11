using NUnit.Framework;
using OpenQA.Selenium.IE;
using System;
using OpenQA.Selenium.Environment;

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
        public void FrameTest()
        {
            driver.Url = "http://www.google.com/ig/tm/creator";

            //// Will go to log in page.
            //WaitForElement(By.Id("Email"));
            //WaitForElement(By.Id("Passwd"));
            //WaitForElement(By.Id("signIn"));

            //IWebElement userNameInputBox = driver.FindElement(By.Id("Email"));
            //IWebElement passWordInputBox = driver.FindElement(By.Id("Passwd"));
            //IWebElement submitButton = driver.FindElement(By.Id("signIn"));

            //// Log in.
            //userNameInputBox.SendKeys("ig.wd.thememaker.3");
            //passWordInputBox.SendKeys("wd.thememaker.3");
            //submitButton.Click();

            // Will redirect to the theme maker page.
            WaitForElement(By.Id("uploadImgBtn"));
            IWebElement uploadImageButton = driver.FindElement(By.Id("uploadImgBtn"));
            uploadImageButton.Click();

            // Wait for the upload image box, it is an iframe.
            WaitForElement(By.ClassName("onepick"));
            IWebElement uploadImageBox = driver.FindElement(By.ClassName("onepick"));

            // Switch to this frame and wait for the "From the web" option. Here you can also use the frame
            // index 2.
            driver.SwitchTo().Frame(uploadImageBox);
            //driver.switchTo().frame(2);
            Console.WriteLine(driver.Url);
            // Firefox could find this element and exit the process, but IE couldn't wait to this element
            // present. In fact, IE driver couldn't get any page source or element after switching to this
            // iframe.
            WaitForElement(By.XPath("//div[@id='doclist']/div/div/div/div[3]"));
        }

        private void WaitForElement(By elementFoundBy)
        {
            DateTime start = DateTime.Now;
            DateTime end = start.Add(TimeSpan.FromSeconds(20));
            // Will wait for 20 seconds.
            while (DateTime.Now < end)
            {
                try
                {
                    driver.FindElement(elementFoundBy);
                    return;
                }
                catch (NoSuchElementException)
                {
                    // Just try again.
                }
            }

            throw new NoSuchElementException("Can't find element after 20 seconds' waiting: " +
                elementFoundBy.ToString());
        }
    }
}
