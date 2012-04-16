using NUnit.Framework;
using OpenQA.Selenium.Environment;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Support.UI;

namespace OpenQA.Selenium.Support.PageObjects
{
    [TestFixture]
    public class PageFactoryBrowserTest : DriverTestFixture
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
        public void LooksUpAgainAfterPageNavigation()
        {
            driver.Url = xhtmlTestPage;
            var page = new Page();

            PageFactory.InitElements(driver, page);

            driver.Navigate().Refresh();

            Assert.True(page.formElement.Displayed);
        }

        [Test]
        public void ElementEqualityWorks()
        {
            driver.Url = xhtmlTestPage;
            var page = new PageFactoryTest.Page();

            PageFactory.InitElements(driver, page);

            var expectedElement = driver.FindElement(By.Name("someForm"));

            Assert.True(page.formElement.Equals(expectedElement));
            Assert.True(expectedElement.Equals(page.formElement));
            Assert.AreEqual(expectedElement.GetHashCode(), page.formElement.GetHashCode());
        }

        [Test]
        public void UsesElementAsScriptArgument()
        {
            driver.Url = xhtmlTestPage;
            var page = new PageFactoryTest.Page();

            PageFactory.InitElements(driver, page);

            var tagName = (string)((IJavaScriptExecutor)driver).ExecuteScript("return arguments[0].tagName", page.formElement);

            Assert.AreEqual("form", tagName.ToLower());
        }

        [Test]
        public void ShouldAllowPageFactoryElementToBeUsedInInteractions()
        {
            driver.Url = javascriptPage;
            var page = new PageFactoryBrowserTest.HoverPage();
            PageFactory.InitElements(driver, page);
            
            Actions actions = new Actions(driver);
            actions.MoveToElement(page.MenuLink).Perform();

            IWebElement item = driver.FindElement(By.Id("item1"));
            Assert.AreEqual("Item 1", item.Text);
        }

        #region Page classes for tests
        #pragma warning disable 649 //We set fields through reflection, so expect an always-null warning

        private class Page
        {
            [FindsBy(How = How.Name, Using = "someForm")]
            public IWebElement formElement;
        }

        private class HoverPage
        {
            [FindsBy(How=How.Id, Using="menu1")]
            public IWebElement MenuLink;
        }

        #pragma warning restore 649
        #endregion
    }
}
