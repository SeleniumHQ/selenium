using NMock2;
using NUnit.Framework;
using OpenQA.Selenium.Firefox;

namespace OpenQA.Selenium.Support.PageFactory
{
    [TestFixture]
    //TODO: Extend DriverTestFixture
    //TODO: Support caching
    public class PageFactoryTest
    {
        private Mockery mocks;
        private readonly IWebDriver driver = new FirefoxDriver();
        private const string xhtmlPage = @"file:///C:\svn\selenium-trunk\common\src\web\xhtmlTest.html";

        [SetUp]
        public void SetUp()
        {
            mocks = new Mockery();
        }
        
        [TestFixtureTearDown]
        public void TearDown()
        {
            driver.Quit();
        }
        
        [Test]
        public void ElementShouldBeNullUntilInitElementsCalled()
        {
            driver.Url = xhtmlPage;
            var page = new Page();
            Assert.Null(page.formElement);

            PageFactory.InitElements(driver, page);

            Assert.NotNull(page.formElement);
        }

        [Test]
        public void DoesNotSearchForUnusedElements()
        {
            var mockDriver = mocks.NewMock<IWebDriver>();
            Expect.Never.On(mockDriver).Method("FindElement");
            Expect.Never.On(mockDriver).Method("FindElements");

            var page = new Page();
            PageFactory.InitElements(mockDriver, page);

            mocks.VerifyAllExpectationsHaveBeenMet();
        }
        
        [Test]
        public void FindsElement()
        {
            driver.Url = xhtmlPage;
            var page = new Page();

            PageFactory.InitElements(driver, page);

            AssertElementFound(page.formElement);
        }

        [Test]
        public void FindsPrivateElement()
        {
            driver.Url = xhtmlPage;
            var page = new PrivatePage();

            PageFactory.InitElements(driver, page);

            AssertElementFound(page.GetField());
        }

        [Test]
        public void FindsRenderedElement()
        {
            driver.Url = xhtmlPage;
            var page = new RenderedPage();

            PageFactory.InitElements(driver, page);

            Assert.True(page.formElement.Displayed);
        }

        [Test]
        public void FindsParentAndChildElement()
        {
            driver.Url = xhtmlPage;
            var page = new ChildPage();

            PageFactory.InitElements(driver, page);

            AssertElementFound(page.formElement);
            AssertElementFound(page.childFormElement);
        }
        
        [Test]
        public void ElementEqualityWorks()
        {
            driver.Url = xhtmlPage;
            var page = new Page();

            PageFactory.InitElements(driver, page);

            var expectedElement = driver.FindElement(By.Name("someForm"));

            Assert.True(page.formElement.Equals(expectedElement));
            Assert.True(expectedElement.Equals(page.formElement));
            Assert.AreEqual(expectedElement.GetHashCode(), page.formElement.GetHashCode());
        }
        
        [Test]
        public void UsesElementAsScriptArgument()
        {
            driver.Url = xhtmlPage;
            var page = new Page();

            PageFactory.InitElements(driver, page);

            var tagName = (string)((IJavaScriptExecutor)driver).ExecuteScript("return arguments[0].tagName", page.formElement);

            Assert.AreEqual("form", tagName.ToLower());
        }
        
        [Test]
        public void FallsBackOnOtherLocatorsOnFailure()
        {
            var mockElement = mocks.NewMock<IWebElement>();
            Expect.Once.On(mockElement).Method("get_TagName").WithNoArguments().Will(Return.Value("form"));
        
            var mockDriver = mocks.NewMock<IWebDriver>();
            Expect.AtLeastOnce.On(mockDriver).Method("FindElement").With(By.Name("notthisname")).Will(Throw.Exception(new NoSuchElementException()));
            Expect.AtLeastOnce.On(mockDriver).Method("FindElement").With(By.TagName("form")).Will(Return.Value(mockElement));
            Expect.Never.On(mockDriver).Method("FindElement").With(By.Id("notthiseither")).Will(Return.Value(mockElement));

            var page = new FallsbackPage();
            PageFactory.InitElements(mockDriver, page);

            AssertElementFound(page.formElement);

            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void ThrowsIfAllLocatorsFail()
        {
            var mockDriver = mocks.NewMock<IWebDriver>();
            Expect.AtLeastOnce.On(mockDriver).Method("FindElement").With(By.Name("notthisname")).Will(Throw.Exception(new NoSuchElementException()));
            Expect.AtLeastOnce.On(mockDriver).Method("FindElement").With(By.TagName("notthiseither")).Will(Throw.Exception(new NoSuchElementException()));
            Expect.AtLeastOnce.On(mockDriver).Method("FindElement").With(By.Id("stillnotthis")).Will(Throw.Exception(new NoSuchElementException()));

            var page = new FailsToFallbackPage();
            PageFactory.InitElements(mockDriver, page);

            Assert.Throws(typeof(NoSuchElementException), page.formElement.Clear);

            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        private static void AssertElementFound(IWebElement element)
        {
            Assert.AreEqual("form", element.TagName.ToLower());
        }
        
        #region Page classes for tests
        #pragma warning disable 649 //We set this through reflection, so expect an always-null warning

        private class Page
        {
            [FindsBy(Name = "someForm")]
            public IWebElement formElement;
        }

        private class PrivatePage
        {
            [FindsBy(Name = "someForm")]
            private IWebElement formElement;

            public IWebElement GetField()
            {
                return formElement;
            }
        }

        private class ChildPage : Page
        {
            [FindsBy(Name = "someForm")]
            public IWebElement childFormElement;
        }

        private class RenderedPage
        {
            [FindsBy(Name = "someForm")]
            public IRenderedWebElement formElement;
        }

        private class FallsbackPage
        {
            [FindsBy(Name = "notthisname", TagName = "form", Id = "notthiseither")]
            public IWebElement formElement;
        }

        private class FailsToFallbackPage
        {
            [FindsBy(Name = "notthisname", TagName = "notthiseither", Id = "stillnotthis")]
            public IWebElement formElement;
        }

        #pragma warning restore 649
        #endregion
    }
}