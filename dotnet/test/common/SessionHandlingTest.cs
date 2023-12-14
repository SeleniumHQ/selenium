using System;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class SessionHandlingTest : DriverTestFixture
    {
        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        public void CallingQuitMoreThanOnceOnASessionIsANoOp()
        {
            driver.Url = simpleTestPage;
            driver.Quit();
            driver.Quit();
            driver = EnvironmentManager.Instance.CreateDriverInstance();
            driver.Url = xhtmlTestPage;
            driver.Quit();
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        public void CallingQuitAfterClosingTheLastWindowIsANoOp()
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
        [IgnoreBrowser(Browser.Firefox, "Firefox doesn't shut its server down immediately upon calling Close(), so a subsequent call could succeed.")]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        public void CallingAnyOperationAfterClosingTheLastWindowShouldThrowAnException()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            IWebDriver testDriver = EnvironmentManager.Instance.CreateDriverInstance();
            try
            {
                string url = string.Empty;
                testDriver.Url = simpleTestPage;
                testDriver.Close();
                Assert.That(() => testDriver.Url == formsPage, Throws.InstanceOf<WebDriverException>().Or.InstanceOf<InvalidOperationException>());
            }
            finally
            {
                testDriver.Dispose();
            }
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        public void CallingAnyOperationAfterQuitShouldThrowAnException()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            IWebDriver testDriver = EnvironmentManager.Instance.CreateDriverInstance();
            try
            {
                string url = string.Empty;
                testDriver.Url = simpleTestPage;
                testDriver.Quit();
                Assert.That(() => testDriver.Url == formsPage, Throws.InstanceOf<WebDriverException>().Or.InstanceOf<InvalidOperationException>());
            }
            finally
            {
                testDriver.Dispose();
            }
        }

        //------------------------------------------------------------------
        // Tests below here are not included in the Java test suite
        //------------------------------------------------------------------
        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
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
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        public void ShouldBeAbleToDisposeOfDriver()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            IWebDriver testDriver = EnvironmentManager.Instance.CreateDriverInstance();
            testDriver.Url = simpleTestPage;
            testDriver.Dispose();
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        public void ShouldBeAbleToCallDisposeConsecutively()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            IWebDriver testDriver = EnvironmentManager.Instance.CreateDriverInstance();
            testDriver.Url = simpleTestPage;
            testDriver.Dispose();
            testDriver.Dispose();
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
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
    }
}
