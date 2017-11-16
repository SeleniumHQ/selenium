using System.Collections.Generic;
using NUnit.Framework;
using OpenQA.Selenium.Environment;
using OpenQA.Selenium.Interactions;
using System;

namespace OpenQA.Selenium.Support.PageObjects
{
    [TestFixture]
    public class PageFactoryBrowserTest : DriverTestFixture
    {
#if !NETCOREAPP2_0
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

        [Test]
        public void ShouldFindMultipleElements()
        {
            driver.Url = xhtmlTestPage;
            var page = new PageFactoryBrowserTest.LinksPage();
            PageFactory.InitElements(driver, page);
            Assert.AreEqual(12, page.AllLinks.Count);
            Assert.AreEqual("Open new window", page.AllLinks[0].Text.Trim());
        }

        [Test]
        public void ShouldFindElementUsingSequence()
        {
            driver.Url = xhtmlTestPage;
            var page = new PageFactoryBrowserTest.Page();
            PageFactory.InitElements(driver, page);
            Assert.AreEqual("I'm a child", page.NestedElement.Text.Trim());
        }

        [Test]
        public void ShouldFindElementUsingAllFindBys()
        {
            driver.Url = xhtmlTestPage;
            var page = new PageFactoryBrowserTest.Page();
            PageFactory.InitElements(driver, page);
            Assert.True(page.ByAllElement.Displayed);
        }

        [Test]
        public void MixingFindBySequenceAndFindByAllShouldThrow()
        {
            driver.Url = xhtmlTestPage;
            var page = new PageFactoryBrowserTest.InvalidAttributeCombinationPage();
            Assert.Throws<ArgumentException>(() => PageFactory.InitElements(driver, page), "Cannot specify FindsBySequence and FindsByAll on the same member");
        }

        [Test]
        public void FrameTest()
        {
            driver.Url = iframePage;
            var page = new PageFactoryBrowserTest.IFramePage();
            PageFactory.InitElements(driver, page);
            driver.SwitchTo().Frame(page.Frame);
        }

        #region Page classes for tests
        #pragma warning disable 649 //We set fields through reflection, so expect an always-null warning

        private class Page
        {
            [FindsBy(How = How.Name, Using = "someForm")]
            public IWebElement formElement;

            [FindsBySequence]
            [FindsBy(How = How.Id, Using = "parent", Priority = 0)]
            [FindsBy(How = How.Id, Using = "child", Priority = 1)]
            public IWebElement NestedElement;

            [FindsByAll]
            [FindsBy(How = How.TagName, Using = "form", Priority = 0)]
            [FindsBy(How = How.Name, Using = "someForm", Priority = 1)]
            public IWebElement ByAllElement;
        }

        private class HoverPage
        {
            [FindsBy(How=How.Id, Using="menu1")]
            public IWebElement MenuLink;
        }

        private class LinksPage
        {
            [FindsBy(How=How.TagName, Using="a")]
            public IList<IWebElement> AllLinks;
        }

        private class InvalidAttributeCombinationPage
        {
            [FindsByAll]
            [FindsBySequence]
            [FindsBy(How = How.Id, Using = "parent", Priority = 0)]
            [FindsBy(How = How.Id, Using = "child", Priority = 1)]
            public IWebElement NotFound;
        }

        private class IFramePage
        {
            [FindsBy(How = How.Id, Using = "iframe1")]
            public IWebElement Frame;
        }

        #pragma warning restore 649
        #endregion
#endif
    }
}
