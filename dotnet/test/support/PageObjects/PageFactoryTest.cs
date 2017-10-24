using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using NMock;
using NUnit.Framework;

namespace OpenQA.Selenium.Support.PageObjects
{
    [TestFixture]
    public class PageFactoryTest
    {
#if !NETCOREAPP2_0
        private MockFactory mocks;
        private Mock<ISearchContext> mockDriver;
        private Mock<IWebElement> mockElement;
        private Mock<IWebDriver> mockExplicitDriver;

        [SetUp]
        public void SetUp()
        {
            mocks = new MockFactory();
            mockDriver = mocks.CreateMock<ISearchContext>();
            mockElement = mocks.CreateMock<IWebElement>();
            mockExplicitDriver = mocks.CreateMock<IWebDriver>();
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

            PageFactory.InitElements(mockDriver.MockObject, page);
            Assert.NotNull(page.formElement);
        }

        [Test]
        public void ElementShouldBeAbleToUseGenericVersionOfInitElements()
        {
            Mock<IWebDriver> driver = mocks.CreateMock<IWebDriver>();
            var page = PageFactory.InitElements<GenericFactoryPage>(driver.MockObject);
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
            mockElement.Expects.One.GetProperty(_ => _.TagName).WillReturn("form");
            mockDriver.Expects.One.Method(_ => _.FindElement(null)).With(By.Id("someForm")).WillReturn(mockElement.MockObject);

            var page = new PageWithIdWithoutUsing();
            AssertFindsElement(page, () => page.someForm);
        }

        [Test]
        public void FindsParentAndChildElement()
        {
            ExpectOneLookup();
            var mockElement2 = mocks.CreateMock<IWebElement>();
            mockDriver.Expects.One.Method(_ => _.FindElement(null)).With(By.TagName("body")).WillReturn(mockElement2.MockObject);
            mockElement2.Expects.One.GetProperty(_ => _.TagName).WillReturn("body");

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
            mockDriver.Expects.One.Method(_ => _.FindElement(null)).With(By.Name("notthisname")).Will(Throw.Exception(new NoSuchElementException()));
            mockDriver.Expects.One.Method(_ => _.FindElement(null)).With(By.TagName("form")).WillReturn(mockElement.MockObject);
            mockDriver.Expects.No.Method(_ => _.FindElement(null)).With(By.Id("notthiseither")).WillReturn(mockElement.MockObject);

            mockElement.Expects.One.GetProperty(_ => _.TagName).WillReturn("form");

            var page = new FallsbackPage();
            PageFactory.InitElements(mockDriver.MockObject, page);

            AssertFoundElement(page.formElement);
        }

        [Test]
        public void ThrowsIfAllLocatorsFail()
        {
            mockDriver.Expects.One.Method(_ => _.FindElement(null)).With(By.Name("notthisname")).Will(Throw.Exception(new NoSuchElementException()));
            mockDriver.Expects.One.Method(_ => _.FindElement(null)).With(By.TagName("notthiseither")).Will(Throw.Exception(new NoSuchElementException()));
            mockDriver.Expects.One.Method(_ => _.FindElement(null)).With(By.Id("stillnotthis")).Will(Throw.Exception(new NoSuchElementException()));

            var page = new FailsToFallbackPage();
            PageFactory.InitElements(mockDriver.MockObject, page);

            Assert.Throws(typeof(NoSuchElementException), page.formElement.Clear);
        }

        [Test]
        public void CachesElement()
        {
            mockDriver.Expects.One.Method(_ => _.FindElement(null)).With(By.Name("someForm")).WillReturn(mockElement.MockObject);
            mockElement.Expects.Exactly(2).GetProperty(_ => _.TagName).WillReturn("form");

            var page = new CachedPage();

            AssertFindsElement(page, () => page.formElement);
            AssertFoundElement(page.formElement);
        }

        [Test]
        public void CachesIfClassMarkedCachedElement()
        {
            mockDriver.Expects.One.Method(_ => _.FindElement(null)).With(By.Name("someForm")).WillReturn(mockElement.MockObject);
            mockElement.Expects.Exactly(2).GetProperty(_ => _.TagName).WillReturn("form");

            var page = new CachedClassPage();

            AssertFindsElement(page, () => page.formElement);
            AssertFoundElement(page.formElement);
        }

        [Test]
        public void UsingCustomBy()
        {
            mockDriver.Expects.Exactly(1).Method(_ => _.FindElement(null)).With(new CustomBy("customCriteria")).WillReturn(mockElement.MockObject);
            mockElement.Expects.Exactly(1).GetProperty(_ => _.TagName).WillReturn("form");

            var page = new CustomByPage();

            AssertFindsElement(page, () => page.customFoundElement);
        }

        [Test]
        public void UsingCustomByNotFound()
        {
            mockDriver.Expects.One.Method(_ => _.FindElement(null)).With(new CustomBy("customCriteriaNotFound")).Will(Throw.Exception(new NoSuchElementException()));
            
            var page = new CustomByNotFoundPage();
            PageFactory.InitElements(mockDriver.MockObject, page);
            Assert.Throws<NoSuchElementException>(page.customFoundElement.Clear);
        }

        [Test]
        public void UsingCustomByWithInvalidSuperClass()
        {
            var page = new InvalidCustomFinderTypePage();
            Assert.Throws<ArgumentException>(() => PageFactory.InitElements(mockDriver.MockObject, page), "descendent of");
        }

        [Test]
        public void UsingCustomByWithNoClass()
        {
            var page = new NoCustomFinderClassPage();
            Assert.Throws<ArgumentException>(() => PageFactory.InitElements(mockDriver.MockObject, page), "How.Custom");
        }

        [Test]
        public void UsingCustomByWithInvalidCtor()
        {
            var page = new InvalidCtorCustomByPage();
            Assert.Throws<ArgumentException>(() => PageFactory.InitElements(mockDriver.MockObject, page), "constructor");
        }

        [Test]
        public void ThrowsIfElementTypeIsInvalid()
        {
            var page = new InvalidElementTypePage();
            Assert.Throws<ArgumentException>(() => PageFactory.InitElements(mockDriver.MockObject, page), "is not IWebElement or IList<IWebElement>");
        }

        [Test]
        public void ThrowsIfElementCollectionTypeIsInvalid()
        {
            var page = new InvalidCollectionTypePage();
            Assert.Throws<ArgumentException>(() => PageFactory.InitElements(mockDriver.MockObject, page), "is not IWebElement or IList<IWebElement>");
        }

        [Test]
        public void ThrowsIfConcreteCollectionTypeIsUsed()
        {
            var page = new ConcreteCollectionTypePage();
            Assert.Throws<ArgumentException>(() => PageFactory.InitElements(mockDriver.MockObject, page), "is not IWebElement or IList<IWebElement>");
        }

        [Test]
        public void CanUseGenericInitElementsWithWebDriverConstructor()
        {
            WebDriverConstructorPage page = PageFactory.InitElements<WebDriverConstructorPage>(mockExplicitDriver.MockObject);
        }

        [Test]
        public void CanNotUseGenericInitElementWithInvalidConstructor()
        {
            Assert.Throws<ArgumentException>(() => { InvalidConstructorPage page = PageFactory.InitElements<InvalidConstructorPage>(mockExplicitDriver.MockObject); }, "constructor for the specified class containing a single argument of type IWebDriver");
        }

        [Test]
        public void CanNotUseGenericInitElementWithParameterlessConstructor()
        {
            Assert.Throws<ArgumentException>(() => { ParameterlessConstructorPage page = PageFactory.InitElements<ParameterlessConstructorPage>(mockExplicitDriver.MockObject); }, "constructor for the specified class containing a single argument of type IWebDriver");
        }

        #region Test helper methods

        private void ExpectOneLookup()
        {
            mockDriver.Expects.Exactly(1).Method(_ => _.FindElement(null)).With(By.Name("someForm")).WillReturn(mockElement.MockObject);
            mockElement.Expects.Exactly(1).GetProperty(_ => _.TagName).WillReturn("form");
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
            PageFactory.InitElements(mockDriver.MockObject, page);

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
            MockFactory mocks = new MockFactory();
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

                    Mock<IWebElement> mockElement =  mocks.CreateMock<IWebElement>();
                    return mockElement.MockObject;
                };
            }
        }

        private class CustomByNoCtor : By
        {
            MockFactory mocks = new MockFactory();
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

                    Mock<IWebElement> mockElement =  mocks.CreateMock<IWebElement>();
                    return mockElement.MockObject;
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
#endif
    }
}
