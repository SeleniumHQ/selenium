using NUnit.Framework;

namespace OpenQA.Selenium.Support.PageFactory
{
    [TestFixture]
    public class PageFactoryBrowserTest : DriverTestFixture
    {
        [Test]
        public void FindsRenderedElement()
        {
            driver.Url = xhtmlTestPage;
            var page = new RenderedPage();

            PageFactory.InitElements(driver, page);

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

        #region Page classes for tests
        #pragma warning disable 649 //We set fields through reflection, so expect an always-null warning

        private class RenderedPage
        {
            [FindsBy(Name = "someForm")]
            public IRenderedWebElement formElement;
        }

        #pragma warning restore 649
        #endregion
    }
}
