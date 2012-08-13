using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium.Support.UI
{
    [TestFixture]
    public class PopupWindowFinderTest : DriverTestFixture
    {
        //TODO: Move these to a standalone class when more tests rely on the server being up
        [TestFixtureSetUp]
        public void RunBeforeAnyTest()
        {
            EnvironmentManager.Instance.WebServer.Start();
        }

        [TestFixtureTearDown]
        public void RunAfterAnyTests()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            EnvironmentManager.Instance.WebServer.Stop();
        }

        [Test]
        public void ShouldFindPopupWindowUsingAction()
        {
            driver.Url = xhtmlTestPage;
            string current = driver.CurrentWindowHandle;

            PopupWindowFinder finder = new PopupWindowFinder(driver);
            string newHandle = finder.Invoke(() => { driver.FindElement(By.LinkText("Open new window")).Click(); });

            Assert.IsNotNullOrEmpty(newHandle);
            Assert.AreNotEqual(current, newHandle);

            driver.SwitchTo().Window(newHandle);
            Assert.AreEqual("We Arrive Here", driver.Title);
            driver.Close();

            driver.SwitchTo().Window(current);
        }

        [Test]
        public void ShouldFindPopupWindowUsingElementClick()
        {
            driver.Url = xhtmlTestPage;
            string current = driver.CurrentWindowHandle;

            PopupWindowFinder finder = new PopupWindowFinder(driver);
            string newHandle = finder.Click(driver.FindElement(By.LinkText("Open new window")));

            Assert.IsNotNullOrEmpty(newHandle);
            Assert.AreNotEqual(current, newHandle);

            driver.SwitchTo().Window(newHandle);
            Assert.AreEqual("We Arrive Here", driver.Title);
            driver.Close();

            driver.SwitchTo().Window(current);
        }

        [Test]
        public void ShouldFindMultiplePopupWindowsInSuccession()
        {
            driver.Url = xhtmlTestPage;
            string first = driver.CurrentWindowHandle;

            PopupWindowFinder finder = new PopupWindowFinder(driver);
            string second = finder.Click(driver.FindElement(By.Name("windowOne")));
            Assert.IsNotNullOrEmpty(second);
            Assert.AreNotEqual(first, second);

            finder = new PopupWindowFinder(driver);
            string third = finder.Click(driver.FindElement(By.Name("windowTwo")));
            Assert.IsNotNullOrEmpty(third);
            Assert.AreNotEqual(first, third);
            Assert.AreNotEqual(second, third);

            driver.SwitchTo().Window(second);
            driver.Close();

            driver.SwitchTo().Window(third);
            driver.Close();

            driver.SwitchTo().Window(first);
        }

        [Test]
        [ExpectedException(typeof(WebDriverTimeoutException))]
        public void ShouldNotFindPopupWindowWhenNoneExists()
        {
            driver.Url = xhtmlTestPage;
            PopupWindowFinder finder = new PopupWindowFinder(driver);
            string handle = finder.Click(driver.FindElement(By.Id("linkId")));
        }
    }
}
