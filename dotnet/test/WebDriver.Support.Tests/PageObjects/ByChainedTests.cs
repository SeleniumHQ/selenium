using System.Collections.Generic;
using NMock2;
using NUnit.Framework;
using OpenQA.Selenium.Internal;
using Is = NUnit.Framework.Is;

namespace OpenQA.Selenium.Support.PageObjects
{
    [TestFixture]
    public class ByChainedTests
    {
        [Test]
        [ExpectedException(typeof(NoSuchElementException))]
        public void FindElementZeroBy()
        {
            Mockery mock = new Mockery();
            IAllDriver driver = mock.NewMock<IAllDriver>();

            ByChained by = new ByChained();
            by.FindElement(driver);
        }

        [Test]
        public void FindElementsZeroBy()
        {
            Mockery mock = new Mockery();
            IAllDriver driver = mock.NewMock<IAllDriver>();

            ByChained by = new ByChained();

            Assert.That(by.FindElements(driver), Is.EqualTo(new List<IWebElement>().AsReadOnly()));
        }

        [Test]
        public void FindElementOneBy()
        {
            Mockery mock = new Mockery();
            IAllDriver driver = mock.NewMock<IAllDriver>();
            IAllElement elem1 = mock.NewMock<IAllElement>();
            IAllElement elem2 = mock.NewMock<IAllElement>();
            var elems12 = new List<IWebElement>() { elem1, elem2 }.AsReadOnly();
            Expect.Once.On(driver).Method("FindElementsByName").With("cheese").Will(Return.Value(elems12));

            ByChained by = new ByChained(By.Name("cheese"));
            Assert.AreEqual(by.FindElement(driver), elem1);
            mock.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void FindElementsOneBy()
        {
            Mockery mock = new Mockery();
            IAllDriver driver = mock.NewMock<IAllDriver>();
            IAllElement elem1 = mock.NewMock<IAllElement>();
            IAllElement elem2 = mock.NewMock<IAllElement>();
            var elems12 = new List<IWebElement>() { elem1, elem2 }.AsReadOnly();
            Expect.Once.On(driver).Method("FindElementsByName").With("cheese").Will(Return.Value(elems12));

            ByChained by = new ByChained(By.Name("cheese"));
            Assert.AreEqual(by.FindElements(driver), elems12);
            mock.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void FindElementOneByEmpty()
        {
            Mockery mock = new Mockery();
            IAllDriver driver = mock.NewMock<IAllDriver>();
            var elems = new List<IWebElement>().AsReadOnly();

            Expect.Once.On(driver).Method("FindElementsByName").With("cheese").Will(Return.Value(elems));

            ByChained by = new ByChained(By.Name("cheese"));
            try
            {
                by.FindElement(driver);
                Assert.Fail("Expected NoSuchElementException!");
            }
            catch (NoSuchElementException)
            {
                mock.VerifyAllExpectationsHaveBeenMet();
                Assert.Pass();
            }
        }

        [Test]
        public void FindElementsOneByEmpty()
        {
            Mockery mock = new Mockery();
            IAllDriver driver = mock.NewMock<IAllDriver>();
            var elems = new List<IWebElement>().AsReadOnly();

            Expect.Once.On(driver).Method("FindElementsByName").With("cheese").Will(Return.Value(elems));

            ByChained by = new ByChained(By.Name("cheese"));

            Assert.That(by.FindElements(driver), Is.EqualTo(elems));
        }

        [Test]
        public void FindElementTwoBy()
        {
            Mockery mocks = new Mockery();
            IAllDriver driver = mocks.NewMock<IAllDriver>();

            IAllElement elem1 = mocks.NewMock<IAllElement>();
            IAllElement elem2 = mocks.NewMock<IAllElement>();
            IAllElement elem3 = mocks.NewMock<IAllElement>();
            IAllElement elem4 = mocks.NewMock<IAllElement>();
            IAllElement elem5 = mocks.NewMock<IAllElement>();
            var elems12 = new List<IWebElement>() { elem1, elem2 }.AsReadOnly();
            var elems34 = new List<IWebElement>() { elem3, elem4 }.AsReadOnly();
            var elems5 = new List<IWebElement>() { elem5 }.AsReadOnly();
            var elems345 = new List<IWebElement>() { elem3, elem4, elem5 }.AsReadOnly();

            Expect.Once.On(driver).Method("FindElementsByName").With("cheese").Will(Return.Value(elems12));
            Expect.Once.On(elem1).Method("FindElements").With(By.Name("photo")).Will(Return.Value(elems34));
            Expect.Once.On(elem2).Method("FindElements").With(By.Name("photo")).Will(Return.Value(elems5));

            ByChained by = new ByChained(By.Name("cheese"), By.Name("photo"));
            Assert.That(by.FindElement(driver), Is.EqualTo(elem3));
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void FindElementTwoByEmptyParent()
        {
            Mockery mocks = new Mockery();
            IAllDriver driver = mocks.NewMock<IAllDriver>();

            var elems = new List<IWebElement>().AsReadOnly();

            Expect.Once.On(driver).Method("FindElementsByName").With("cheese").Will(Return.Value(elems));

            ByChained by = new ByChained(By.Name("cheese"), By.Name("photo"));
            try
            {
                by.FindElement(driver);
                Assert.Fail("Expected NoSuchElementException!");
            }
            catch (NoSuchElementException)
            {
                mocks.VerifyAllExpectationsHaveBeenMet();
                Assert.Pass();
            }
        }

        [Test]
        public void FindElementsTwoByEmptyParent()
        {
            Mockery mocks = new Mockery();
            IAllDriver driver = mocks.NewMock<IAllDriver>();

            var elems = new List<IWebElement>().AsReadOnly();

            Expect.Once.On(driver).Method("FindElementsByName").With("cheese").Will(Return.Value(elems));

            ByChained by = new ByChained(By.Name("cheese"), By.Name("photo"));

            Assert.That(by.FindElements(driver), Is.EqualTo(elems));
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void FindElementTwoByEmptyChild()
        {
            Mockery mocks = new Mockery();
            IAllDriver driver = mocks.NewMock<IAllDriver>();

            IAllElement elem1 = mocks.NewMock<IAllElement>();
            IAllElement elem2 = mocks.NewMock<IAllElement>();
            IAllElement elem5 = mocks.NewMock<IAllElement>();
            var elems = new List<IWebElement>().AsReadOnly();
            var elems12 = new List<IWebElement>() { elem1, elem2 }.AsReadOnly();
            var elems5 = new List<IWebElement>() { elem5 }.AsReadOnly();

            Expect.Once.On(driver).Method("FindElementsByName").With("cheese").Will(Return.Value(elems12));
            Expect.Once.On(elem1).Method("FindElements").With(By.Name("photo")).Will(Return.Value(elems));
            Expect.Once.On(elem2).Method("FindElements").With(By.Name("photo")).Will(Return.Value(elems5));

            ByChained by = new ByChained(By.Name("cheese"), By.Name("photo"));
            Assert.That(by.FindElement(driver), Is.EqualTo(elem5));
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void FindElementsTwoByEmptyChild()
        {
            Mockery mocks = new Mockery();
            IAllDriver driver = mocks.NewMock<IAllDriver>();

            IAllElement elem1 = mocks.NewMock<IAllElement>();
            IAllElement elem2 = mocks.NewMock<IAllElement>();
            IAllElement elem3 = mocks.NewMock<IAllElement>();
            IAllElement elem4 = mocks.NewMock<IAllElement>();
            IAllElement elem5 = mocks.NewMock<IAllElement>();
            var elems = new List<IWebElement>().AsReadOnly();
            var elems12 = new List<IWebElement>() { elem1, elem2 }.AsReadOnly();
            var elems34 = new List<IWebElement>() { elem3, elem4 }.AsReadOnly();
            var elems5 = new List<IWebElement>() { elem5 }.AsReadOnly();
            var elems345 = new List<IWebElement>() { elem3, elem4, elem5 }.AsReadOnly();

            Expect.Once.On(driver).Method("FindElementsByName").With("cheese").Will(Return.Value(elems12));
            Expect.Once.On(elem1).Method("FindElements").With(By.Name("photo")).Will(Return.Value(elems));
            Expect.Once.On(elem2).Method("FindElements").With(By.Name("photo")).Will(Return.Value(elems5));

            ByChained by = new ByChained(By.Name("cheese"), By.Name("photo"));
            Assert.That(by.FindElements(driver), Is.EqualTo(new[] { elem5 }));
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void TestEquals()
        {
            Assert.That(new ByChained(By.Id("cheese"), By.Name("photo")),
                Is.EqualTo(new ByChained(By.Id("cheese"), By.Name("photo"))));
        }

        public interface IAllDriver :
            IFindsById, IFindsByLinkText, IFindsByName, IFindsByXPath, ISearchContext, IWebDriver
        {
            // Place holder
        }

        public interface IAllElement : IWebElement
        {
            // Place holder
        }
    }
}
