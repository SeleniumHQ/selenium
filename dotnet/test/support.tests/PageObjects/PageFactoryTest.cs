using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using NMock2;
using NUnit.Framework;

namespace OpenQA.Selenium.Support.PageObjects
{
    [TestFixture]
    public class PageFactoryTest
    {
        private Mockery mocks;
        private ISearchContext mockDriver;
        private IWebElement mockElement;
        private IWebDriver mockExplicitDriver;

        [SetUp]
        public void SetUp()
        {
            mocks = new Mockery();
            mockDriver = mocks.NewMock<ISearchContext>();
            mockElement = mocks.NewMock<IWebElement>();
            mockExplicitDriver = mocks.NewMock<IWebDriver>();
        }
        
        [TearDown]
        public void TearDown()
        {
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void ElementShouldBeNullUntilInitElementsCalled()
        {
            var page = new Page();
            
            Assert.Null(page.formElement);

            PageFactory.InitElements(mockDriver, page);
            Assert.NotNull(page.formElement);
        }

        [Test]
        public void ElementShouldBeAbleToUseGenericVersionOfInitElements()
        {
            IWebDriver driver = mocks.NewMock<IWebDriver>();
            var page = PageFactory.InitElements<GenericFactoryPage>(driver);
            Assert.IsInstanceOf<GenericFactoryPage>(page);
            Assert.NotNull(page.formElement);
        }
        
        [Test]
        public void FindsElement()
        {
            var page = new Page();
            AssertFindsElementByExactlyOneLookup(page, () => page.formElement);
        }
        
        [Test]
        public void FindsElementEachAccess()
        {
            var page = new Page();
            
            AssertFindsElementByExactlyOneLookup(page, () => page.formElement);
            mocks.VerifyAllExpectationsHaveBeenMet();

            ExpectOneLookup();
            AssertFoundElement(page.formElement);
        }

        [Test]
        public void FindsPrivateElement()
        {
            var page = new PrivatePage();
            AssertFindsElementByExactlyOneLookup(page, page.GetField);
        }

        [Test]
        public void FindsPropertyElement()
        {
            var page = new ElementAsPropertyPage();
            AssertFindsElementByExactlyOneLookup(page, () => page.FormElement);
        }

        [Test]
        public void FindsElementByNameIfUsingIsAbsent()
        {
            ExpectOneLookup();

            var page = new PageWithNameWithoutUsing();
            AssertFindsElement(page, () => page.someForm);
        }

        [Test]
        public void FindsElementByIdIfUsingIsAbsent()
        {
            Expect.Once.On(mockElement).GetProperty("TagName").Will(Return.Value("form"));
            Expect.Once.On(mockDriver).Method("FindElement").With(By.Id("someForm")).Will(Return.Value(mockElement));

            var page = new PageWithIdWithoutUsing();
            AssertFindsElement(page, () => page.someForm);
        }

        [Test]
        public void FindsParentAndChildElement()
        {
            ExpectOneLookup();
            var mockElement2 = mocks.NewMock<IWebElement>();
            Expect.Once.On(mockDriver).Method("FindElement").With(By.TagName("body")).Will(Return.Value(mockElement2));
            Expect.Once.On(mockElement2).GetProperty("TagName").Will(Return.Value("body"));

            var page = new ChildPage();

            AssertFindsElement(page, () => page.formElement);
            AssertFoundElement(page.childElement, "body");
        }

        [Test]
        public void LooksUpPrivateFieldInSuperClass()
        {
            var page = new SubClassToPrivatePage();
            AssertFindsElementByExactlyOneLookup(page, page.GetField);
        }

        [Test]
        public void LooksUpOverridenVirtualParentClassElement()
        {
            ExpectOneLookup();

            var page = new AbstractChild();
            AssertFindsElement(page, () => page.element);
        }

        [Test]
        public void FallsBackOnOtherLocatorsOnFailure()
        {
            Expect.Once.On(mockDriver).Method("FindElement").With(By.Name("notthisname")).Will(Throw.Exception(new NoSuchElementException()));
            Expect.Once.On(mockDriver).Method("FindElement").With(By.TagName("form")).Will(Return.Value(mockElement));
            Expect.Never.On(mockDriver).Method("FindElement").With(By.Id("notthiseither")).Will(Return.Value(mockElement));

            Expect.Once.On(mockElement).GetProperty("TagName").Will(Return.Value("form"));

            var page = new FallsbackPage();
            PageFactory.InitElements(mockDriver, page);

            AssertFoundElement(page.formElement);
        }

        [Test]
        public void ThrowsIfAllLocatorsFail()
        {
            Expect.Once.On(mockDriver).Method("FindElement").With(By.Name("notthisname")).Will(Throw.Exception(new NoSuchElementException()));
            Expect.Once.On(mockDriver).Method("FindElement").With(By.TagName("notthiseither")).Will(Throw.Exception(new NoSuchElementException()));
            Expect.Once.On(mockDriver).Method("FindElement").With(By.Id("stillnotthis")).Will(Throw.Exception(new NoSuchElementException()));

            var page = new FailsToFallbackPage();
            PageFactory.InitElements(mockDriver, page);

            Assert.Throws(typeof(NoSuchElementException), page.formElement.Clear);
        }

        [Test]
        public void CachesElement()
        {
            Expect.Once.On(mockDriver).Method("FindElement").With(By.Name("someForm")).Will(Return.Value(mockElement));
            Expect.Exactly(2).On(mockElement).GetProperty("TagName").Will(Return.Value("form"));

            var page = new CachedPage();

            AssertFindsElement(page, () => page.formElement);
            AssertFoundElement(page.formElement);
        }

        [Test]
        public void CachesIfClassMarkedCachedElement()
        {
            Expect.Once.On(mockDriver).Method("FindElement").With(By.Name("someForm")).Will(Return.Value(mockElement));
            Expect.Exactly(2).On(mockElement).GetProperty("TagName").Will(Return.Value("form"));

            var page = new CachedClassPage();

            AssertFindsElement(page, () => page.formElement);
            AssertFoundElement(page.formElement);
        }

        [Test]
        public void UsingCustomBy()
        {
            Expect.Exactly(1).On(mockDriver).Method("FindElement").With(new CustomBy("customCriteria")).Will(Return.Value(mockElement));
            Expect.Exactly(1).On(mockElement).GetProperty("TagName").Will(Return.Value("form"));

            var page = new CustomByPage();

            AssertFindsElement(page, () => page.customFoundElement);
        }

        [Test]
        public void UsingCustomByNotFound()
        {
            Expect.Once.On(mockDriver).Method("FindElement").With(new CustomBy("customCriteriaNotFound")).Will(Throw.Exception(new NoSuchElementException()));
            
            var page = new CustomByNotFoundPage();
            PageFactory.InitElements(mockDriver, page);
            Assert.Throws<NoSuchElementException>(page.customFoundElement.Clear);
        }

        [Test]
        public void UsingCustomByWithInvalidSuperClass()
        {
            var page = new InvalidCustomFinderTypePage();
            Assert.Throws<ArgumentException>(() => PageFactory.InitElements(mockDriver, page), "descendent of");
        }

        [Test]
        public void UsingCustomByWithNoClass()
        {
            var page = new NoCustomFinderClassPage();
            Assert.Throws<ArgumentException>(() => PageFactory.InitElements(mockDriver, page), "How.Custom");
        }

        [Test]
        public void UsingCustomByWithInvalidCtor()
        {
            var page = new InvalidCtorCustomByPage();
            Assert.Throws<ArgumentException>(() => PageFactory.InitElements(mockDriver, page), "constructor");
        }

        [Test]
        public void ThrowsIfElementTypeIsInvalid()
        {
            var page = new InvalidElementTypePage();
            Assert.Throws<ArgumentException>(() => PageFactory.InitElements(mockDriver, page), "is not IWebElement or IList<IWebElement>");
        }

        [Test]
        public void ThrowsIfElementCollectionTypeIsInvalid()
        {
            var page = new InvalidCollectionTypePage();
            Assert.Throws<ArgumentException>(() => PageFactory.InitElements(mockDriver, page), "is not IWebElement or IList<IWebElement>");
        }

        [Test]
        public void ThrowsIfConcreteCollectionTypeIsUsed()
        {
            var page = new ConcreteCollectionTypePage();
            Assert.Throws<ArgumentException>(() => PageFactory.InitElements(mockDriver, page), "is not IWebElement or IList<IWebElement>");
        }

        [Test]
        public void CanUseGenericInitElementsWithWebDriverConstructor()
        {
            WebDriverConstructorPage page = PageFactory.InitElements<WebDriverConstructorPage>(mockExplicitDriver);
        }

        [Test]
        public void CanNotUseGenericInitElementWithInvalidConstructor()
        {
            Assert.Throws<ArgumentException>(() => { InvalidConstructorPage page = PageFactory.InitElements<InvalidConstructorPage>(mockExplicitDriver); }, "constructor for the specified class containing a single argument of type IWebDriver");
        }

        [Test]
        public void CanNotUseGenericInitElementWithParameterlessConstructor()
        {
            Assert.Throws<ArgumentException>(() => { ParameterlessConstructorPage page = PageFactory.InitElements<ParameterlessConstructorPage>(mockExplicitDriver); }, "constructor for the specified class containing a single argument of type IWebDriver");
        }

        #region Test helper methods

        private void ExpectOneLookup()
        {
            Expect.Exactly(1).On(mockDriver).Method("FindElement").With(By.Name("someForm")).Will(Return.Value(mockElement));
            Expect.Exactly(1).On(mockElement).GetProperty("TagName").Will(Return.Value("form"));
        }

        /// <summary>
        /// Asserts that getElement yields an element from page which can be interacted with, by exactly one element lookup
        /// </summary>
        private void AssertFindsElementByExactlyOneLookup(object page, Func<IWebElement> getElement)
        {
            ExpectOneLookup();
            AssertFindsElement(page, getElement);
        }

        /// <summary>
        /// Asserts that getElement yields an element which can be interacted with, with no constraints on element lookups
        /// </summary>
        private void AssertFindsElement(object page, Func<IWebElement> getElement)
        {
            PageFactory.InitElements(mockDriver, page);

            AssertFoundElement(getElement());
        }
        
        /// <summary>
        /// Asserts that the element has been found and can be interacted with
        /// </summary>
        private static void AssertFoundElement(IWebElement element)
        {
            AssertFoundElement(element, "form");
        }

        /// <summary>
        /// Asserts that the element has been found and has the tagName passed
        /// </summary>
        private static void AssertFoundElement(IWebElement element, string tagName)
        {
            Assert.AreEqual(tagName, element.TagName.ToLower());
        }
        
        #endregion
        
        #region Page classes for tests
        #pragma warning disable 649 //We set fields through reflection, so expect an always-null warning

        internal class WebDriverConstructorPage
        {
            [FindsBy(How = How.Name, Using = "someForm")]
            public IWebElement formElement;
            
            public WebDriverConstructorPage(IWebDriver driver)
            {
            }
        }

        internal class ParameterlessConstructorPage
        {
            [FindsBy(How = How.Name, Using = "someForm")]
            public IWebElement formElement;
            
            public ParameterlessConstructorPage()
            {
            }
        }

        internal class InvalidConstructorPage
        {
            [FindsBy(How = How.Name, Using = "someForm")]
            public IWebElement formElement;

            public InvalidConstructorPage(string message)
            {
            }
        }

        internal class Page
        {
            [FindsBy(How = How.Name, Using = "someForm")]
            public IWebElement formElement;
        }

        internal class PageWithNameWithoutUsing
        {
            [FindsBy(How = How.Name)]
            public IWebElement someForm;
        }

        internal class PageWithIdWithoutUsing
        {
            [FindsBy(How = How.Id)]
            public IWebElement someForm;
        }

        private class PrivatePage
        {
            [FindsBy(How = How.Name, Using = "someForm")]
            private IWebElement formElement;

            public IWebElement GetField()
            {
                return formElement;
            }
        }

        private class ChildPage : Page
        {
            [FindsBy(How = How.TagName, Using = "body")]
            public IWebElement childElement;
        }

        private class SubClassToPrivatePage : PrivatePage
        {
        }

        private class AbstractParent
        {
            [FindsBy(How = How.Name, Using = "someForm")]
            public virtual IWebElement element { get; set; }
        }

        private class AbstractChild : AbstractParent
        {
            public override IWebElement element { get; set; }
        }

        private class FallsbackPage
        {
            [FindsBy(How = How.Name, Using = "notthisname", Priority = 0)]
            [FindsBy(How = How.TagName, Using = "form", Priority = 1)]
            [FindsBy(How = How.Id, Using = "notthiseither", Priority = 2)]
            public IWebElement formElement;
        }

        private class FailsToFallbackPage
        {
            [FindsBy(How = How.Name, Using = "notthisname", Priority = 0)]
            [FindsBy(How = How.TagName, Using = "notthiseither", Priority = 1)]
            [FindsBy(How = How.Id, Using = "stillnotthis", Priority = 2)]
            public IWebElement formElement;
        }

        private class ElementAsPropertyPage
        {
            [FindsBy(How = How.Name, Using = "someForm")]
            public IWebElement FormElement { get; set; }
        }

        private class CachedPage
        {
            [FindsBy(How = How.Name, Using = "someForm")]
            [CacheLookup]
            public IWebElement formElement;
        }

        [CacheLookup]
        private class CachedClassPage
        {
            [FindsBy(How = How.Name, Using = "someForm")]
            public IWebElement formElement;
        }

        private class CustomBy : By
        {
            Mockery mocks = new Mockery();
            private string criteria;

            public CustomBy(string customByString)
            {
                criteria = customByString;
                this.FindElementMethod = (context) =>
                {
                    if (this.criteria != "customCriteria")
                    {
                        throw new NoSuchElementException();
                    }

                    IWebElement mockElement =  mocks.NewMock<IWebElement>();
                    return mockElement;
                };
            }
        }

        private class CustomByNoCtor : By
        {
            Mockery mocks = new Mockery();
            private string criteria;

            public CustomByNoCtor()
            {
                criteria = "customCriteria";
                this.FindElementMethod = (context) =>
                {
                    if (this.criteria != "customCriteria")
                    {
                        throw new NoSuchElementException();
                    }

                    IWebElement mockElement =  mocks.NewMock<IWebElement>();
                    return mockElement;
                };
            }
        }

        private class CustomByPage
        {
            [FindsBy(How = How.Custom, Using = "customCriteria", CustomFinderType = typeof(CustomBy))]
            public IWebElement customFoundElement;
        }

        private class CustomByNotFoundPage
        {
            [FindsBy(How = How.Custom, Using = "customCriteriaNotFound", CustomFinderType = typeof(CustomBy))]
            public IWebElement customFoundElement;
        }

        private class NoCustomFinderClassPage
        {
            [FindsBy(How = How.Custom, Using = "custom")]
            public IWebElement customFoundElement;
        }

        private class InvalidCustomFinderTypePage
        {
            [FindsBy(How = How.Custom, Using = "custom", CustomFinderType = typeof(string))]
            public IWebElement customFoundElement;
        }

        private class InvalidCtorCustomByPage
        {
            [FindsBy(How = How.Custom, Using = "custom", CustomFinderType = typeof(CustomByNoCtor))]
            public IWebElement customFoundElement;
        }

        private class GenericFactoryPage
        {
            private IWebDriver driver;
            public GenericFactoryPage(IWebDriver driver)
            {
                this.driver = driver;
            }

            [FindsBy(How = How.Name, Using = "someForm")]
            public IWebElement formElement;
        }

        private class InvalidElementTypePage
        {
            [FindsBy(How = How.Name, Using = "someForm")]
            public string myElement;
        }

        private class InvalidCollectionTypePage
        {
            [FindsBy(How = How.Name, Using = "someForm")]
            public List<string> myElement;
        }

        private class ConcreteCollectionTypePage
        {
            [FindsBy(How = How.Name, Using = "someForm")]
            public ReadOnlyCollection<IWebElement> myElement;
        }

        #pragma warning restore 649
        #endregion
    }
}