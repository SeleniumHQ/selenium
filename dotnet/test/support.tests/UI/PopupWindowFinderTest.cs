using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium.Support.UI
{
    [TestFixture]
    public class PopupWindowFinderTest : DriverTestFixture
    {
        //TODO: Move these to a standalone class when more tests rely on the server being up
        [OneTimeSetUp]
        public void RunBeforeAnyTest()
        {
            EnvironmentManager.Instance.WebServer.Start();
        }

        [OneTimeTearDown]
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

            Assert.That(newHandle, Is.Not.Null.Or.Empty);
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

            Assert.That(newHandle, Is.Not.Null.Or.Empty);
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
            Assert.That(second, Is.Not.Null.Or.Empty);
            Assert.AreNotEqual(first, second);

            finder = new PopupWindowFinder(driver);
            string third = finder.Click(driver.FindElement(By.Name("windowTwo")));
            Assert.That(third, Is.Not.Null.Or.Empty);
            Assert.AreNotEqual(first, third);
            Assert.AreNotEqual(second, third);

            driver.SwitchTo().Window(second);
            driver.Close();

            driver.SwitchTo().Window(third);
            driver.Close();

            driver.SwitchTo().Window(first);
        }

        [Test]
        public void ShouldNotFindPopupWindowWhenNoneExists()
        {
            driver.Url = xhtmlTestPage;
            PopupWindowFinder finder = new PopupWindowFinder(driver);
            Assert.Throws<WebDriverTimeoutException>(() => { string handle = finder.Click(driver.FindElement(By.Id("linkId"))); });
        }
    }
}
