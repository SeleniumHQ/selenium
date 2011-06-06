using NUnit.Framework;
using System;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium.IE
{
    [TestFixture]
    public class DriverDisposalTests : DriverTestFixture
    {
        [Test]
        public void ShouldOpenAndCloseBrowserRepeatedly()
        {
            for (int i = 0; i < 5; i++)
            {
                Environment.EnvironmentManager.Instance.CloseCurrentDriver();
                CreateFreshDriver();
            }
        }

        [Test]
        [NeedsFreshDriver(AfterTest = true)]
        public void ShouldBeAbleToStartNewDriverAfterCallingCloseOnOnlyOpenWindow()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            IWebDriver testDriver = new InternetExplorerDriver();
            testDriver.Url = simpleTestPage;
            testDriver.Close();
            testDriver.Dispose();
            testDriver = new InternetExplorerDriver();
            testDriver.Url = xhtmlTestPage;
            Assert.AreEqual("XHTML Test Page", testDriver.Title);
            testDriver.Close();
            testDriver.Dispose();
        }

        [Test]
        [NeedsFreshDriver(AfterTest = true)]
        public void ShouldBeAbleToCallQuitAfterCallingCloseOnOnlyOpenWindow()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            IWebDriver testDriver = new InternetExplorerDriver();
            testDriver.Url = simpleTestPage;
            testDriver.Close();
            testDriver.Quit();
            testDriver = new InternetExplorerDriver();
            testDriver.Url = xhtmlTestPage;
            Assert.AreEqual("XHTML Test Page", testDriver.Title);
            testDriver.Quit();
        }

        [Test]
        [NeedsFreshDriver(AfterTest = true)]
        public void ShouldBeAbleToCallDisposeAfterQuit()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            IWebDriver testDriver = new InternetExplorerDriver();
            testDriver.Url = simpleTestPage;
            testDriver.Quit();
            testDriver.Dispose();
            testDriver = new InternetExplorerDriver();
            testDriver.Url = xhtmlTestPage;
            Assert.AreEqual("XHTML Test Page", testDriver.Title);
            testDriver.Quit();
        }

        [Test]
        [NeedsFreshDriver(AfterTest = true)]
        public void ShouldNotBeAbleToCallDriverMethodAfterCallingCloseOnOnlyOpenWindow()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            IWebDriver testDriver = new InternetExplorerDriver();
            try
            {
                testDriver.Url = simpleTestPage;
                testDriver.Close();
                string url = testDriver.Url;
                // Should never reach this line.
                Assert.AreEqual(string.Empty, url);
            }
            catch (WebDriverException)
            {
            }
            finally
            {
                testDriver.Dispose();
            }
        }

        [Test]
        [NeedsFreshDriver(AfterTest = true)]
        public void ShouldBeAbleToCallQuitConsecutively()
        {
            driver.Url = simpleTestPage;
            driver.Quit();
            driver.Quit();
            driver = new InternetExplorerDriver();
            driver.Url = xhtmlTestPage;
            driver.Quit();
        }
    }
}
