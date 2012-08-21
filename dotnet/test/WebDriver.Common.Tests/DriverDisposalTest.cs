using System;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class DriverDisposalTest : DriverTestFixture
    {
        [Test]
        public void ShouldOpenAndCloseBrowserRepeatedly()
        {
            for (int i = 0; i < 5; i++)
            {
                EnvironmentManager.Instance.CloseCurrentDriver();
                CreateFreshDriver();
                driver.Url = simpleTestPage;
                Assert.AreEqual(simpleTestTitle, driver.Title);
            }
        }

        [Test]
        [NeedsFreshDriver(AfterTest = true)]
        public void ShouldBeAbleToStartNewDriverAfterCallingCloseOnOnlyOpenWindow()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            IWebDriver testDriver = EnvironmentManager.Instance.CreateDriverInstance();
            testDriver.Url = simpleTestPage;
            testDriver.Close();
            testDriver.Dispose();
            testDriver = EnvironmentManager.Instance.CreateDriverInstance();
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
            IWebDriver testDriver = EnvironmentManager.Instance.CreateDriverInstance();
            testDriver.Url = simpleTestPage;
            testDriver.Close();
            testDriver.Quit();
            testDriver = EnvironmentManager.Instance.CreateDriverInstance();
            testDriver.Url = xhtmlTestPage;
            Assert.AreEqual("XHTML Test Page", testDriver.Title);
            testDriver.Quit();
        }

        [Test]
        [NeedsFreshDriver(AfterTest = true)]
        public void ShouldBeAbleToCallDisposeAfterQuit()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            IWebDriver testDriver = EnvironmentManager.Instance.CreateDriverInstance();
            testDriver.Url = simpleTestPage;
            testDriver.Quit();
            testDriver.Dispose();
            testDriver = EnvironmentManager.Instance.CreateDriverInstance();
            testDriver.Url = xhtmlTestPage;
            Assert.AreEqual("XHTML Test Page", testDriver.Title);
            testDriver.Quit();
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox, "Firefox doesn't shut its server down immediately upon calling Close(), so a subsequent call could succeed.")]
        [NeedsFreshDriver(AfterTest = true)]
        public void ShouldNotBeAbleToCallDriverMethodAfterCallingCloseOnOnlyOpenWindow()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            IWebDriver testDriver = EnvironmentManager.Instance.CreateDriverInstance();
            try
            {
                testDriver.Url = simpleTestPage;
                testDriver.Close();
                string url = testDriver.Url;
                // Should never reach this line.
                Assert.Fail("Should not be able to access Url property after close of only open window");
            }
            catch (WebDriverException)
            {
            }
            catch (InvalidOperationException)
            {
            }
            finally
            {
                testDriver.Dispose();
            }
        }

        [Test]
        [NeedsFreshDriver(AfterTest = true)]
        public void ShouldNotBeAbleToCallDriverMethodAfterCallingQuit()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            IWebDriver testDriver = EnvironmentManager.Instance.CreateDriverInstance();
            try
            {
                testDriver.Url = simpleTestPage;
                testDriver.Quit();
                string url = testDriver.Url;
                // Should never reach this line.
                Assert.Fail("Should not be able to access Url property after close of only open window");
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
        public void ShouldBeAbleToDisposeOfDriver()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            IWebDriver testDriver = EnvironmentManager.Instance.CreateDriverInstance();
            testDriver.Url = simpleTestPage;
            testDriver.Dispose();
        }

        [Test]
        [NeedsFreshDriver(AfterTest = true)]
        public void ShouldBeAbleToCallDisposeConsecutively()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            IWebDriver testDriver = EnvironmentManager.Instance.CreateDriverInstance();
            testDriver.Url = simpleTestPage;
            testDriver.Dispose();
            testDriver.Dispose();
        }

        [Test]
        [NeedsFreshDriver(AfterTest = true)]
        public void ShouldBeAbleToCallQuitConsecutively()
        {
            driver.Url = simpleTestPage;
            driver.Quit();
            driver.Quit();
            driver = EnvironmentManager.Instance.CreateDriverInstance();
            driver.Url = xhtmlTestPage;
            driver.Quit();
        }
    }
}
