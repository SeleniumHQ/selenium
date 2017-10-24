using System.Collections.Generic;
using NMock;
using NUnit.Framework;
using Is = NUnit.Framework.Is;

namespace OpenQA.Selenium.Support.PageObjects
{
    [TestFixture]
    public class ByChainedTests
    {
        [Test]
        public void FindElementZeroBy()
        {
            MockFactory mock = new MockFactory();
            Mock<IAllDriver> driver = mock.CreateMock<IAllDriver>();

            ByChained by = new ByChained();
            Assert.Throws<NoSuchElementException>(() => by.FindElement(driver.MockObject));
        }

        [Test]
        public void FindElementsZeroBy()
        {
            MockFactory mock = new MockFactory();
            Mock<IAllDriver> driver = mock.CreateMock<IAllDriver>();

            ByChained by = new ByChained();

            Assert.That(by.FindElements(driver.MockObject), Is.EqualTo(new List<IWebElement>().AsReadOnly()));
        }

        [Test]
        public void FindElementOneBy()
        {
            MockFactory mock = new MockFactory();
            Mock<IAllDriver> driver = mock.CreateMock<IAllDriver>();
            Mock<IAllElement> elem1 = mock.CreateMock<IAllElement>();
            Mock<IAllElement> elem2 = mock.CreateMock<IAllElement>();
            var elems12 = new List<IWebElement>() { elem1.MockObject, elem2.MockObject }.AsReadOnly();
            driver.Expects.One.Method(_ => _.FindElementsByName(null)).With("cheese").WillReturn(elems12);

            ByChained by = new ByChained(By.Name("cheese"));
            Assert.AreEqual(by.FindElement(driver.MockObject), elem1.MockObject);
            mock.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void FindElementsOneBy()
        {
            MockFactory mock = new MockFactory();
            Mock<IAllDriver> driver = mock.CreateMock<IAllDriver>();
            Mock<IAllElement> elem1 = mock.CreateMock<IAllElement>();
            Mock<IAllElement> elem2 = mock.CreateMock<IAllElement>();
            var elems12 = new List<IWebElement>() { elem1.MockObject, elem2.MockObject }.AsReadOnly();
            driver.Expects.One.Method(_ => _.FindElementsByName(null)).With("cheese").WillReturn(elems12);

            ByChained by = new ByChained(By.Name("cheese"));
            Assert.AreEqual(by.FindElements(driver.MockObject), elems12);
            mock.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void FindElementOneByEmpty()
        {
            MockFactory mock = new MockFactory();
            Mock<IAllDriver> driver = mock.CreateMock<IAllDriver>();
            var elems = new List<IWebElement>().AsReadOnly();

            driver.Expects.One.Method(_ => _.FindElementsByName(null)).With("cheese").WillReturn(elems);

            ByChained by = new ByChained(By.Name("cheese"));
            try
            {
                by.FindElement(driver.MockObject);
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
            MockFactory mock = new MockFactory();
            Mock<IAllDriver> driver = mock.CreateMock<IAllDriver>();
            var elems = new List<IWebElement>().AsReadOnly();

            driver.Expects.One.Method(_ => _.FindElementsByName(null)).With("cheese").WillReturn(elems);

            ByChained by = new ByChained(By.Name("cheese"));

            Assert.That(by.FindElements(driver.MockObject), Is.EqualTo(elems));
        }

        [Test]
        public void FindElementTwoBy()
        {
            MockFactory mocks = new MockFactory();
            Mock<IAllDriver> driver = mocks.CreateMock<IAllDriver>();

            Mock<IAllElement> elem1 = mocks.CreateMock<IAllElement>();
            Mock<IAllElement> elem2 = mocks.CreateMock<IAllElement>();
            Mock<IAllElement> elem3 = mocks.CreateMock<IAllElement>();
            Mock<IAllElement> elem4 = mocks.CreateMock<IAllElement>();
            Mock<IAllElement> elem5 = mocks.CreateMock<IAllElement>();
            var elems12 = new List<IWebElement>() { elem1.MockObject, elem2.MockObject }.AsReadOnly();
            var elems34 = new List<IWebElement>() { elem3.MockObject, elem4.MockObject }.AsReadOnly();
            var elems5 = new List<IWebElement>() { elem5.MockObject }.AsReadOnly();
            var elems345 = new List<IWebElement>() { elem3.MockObject, elem4.MockObject, elem5.MockObject }.AsReadOnly();

            driver.Expects.One.Method(_ => _.FindElementsByName(null)).With("cheese").WillReturn(elems12);
            elem1.Expects.One.Method(_ => _.FindElements(null)).With(By.Name("photo")).WillReturn(elems34);
            elem2.Expects.One.Method(_ => _.FindElements(null)).With(By.Name("photo")).WillReturn(elems5);

            ByChained by = new ByChained(By.Name("cheese"), By.Name("photo"));
            Assert.That(by.FindElement(driver.MockObject), Is.EqualTo(elem3.MockObject));
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void FindElementTwoByEmptyParent()
        {
            MockFactory mocks = new MockFactory();
            Mock<IAllDriver> driver = mocks.CreateMock<IAllDriver>();

            var elems = new List<IWebElement>().AsReadOnly();

            driver.Expects.One.Method(_ => _.FindElementsByName(null)).With("cheese").WillReturn(elems);

            ByChained by = new ByChained(By.Name("cheese"), By.Name("photo"));
            try
            {
                by.FindElement(driver.MockObject);
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
            MockFactory mocks = new MockFactory();
            Mock<IAllDriver> driver = mocks.CreateMock<IAllDriver>();

            var elems = new List<IWebElement>().AsReadOnly();

            driver.Expects.One.Method(_ => _.FindElementsByName(null)).With("cheese").WillReturn(elems);

            ByChained by = new ByChained(By.Name("cheese"), By.Name("photo"));

            Assert.That(by.FindElements(driver.MockObject), Is.EqualTo(elems));
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void FindElementTwoByEmptyChild()
        {
            MockFactory mocks = new MockFactory();
            Mock<IAllDriver> driver = mocks.CreateMock<IAllDriver>();

            Mock<IAllElement> elem1 = mocks.CreateMock<IAllElement>();
            Mock<IAllElement> elem2 = mocks.CreateMock<IAllElement>();
            Mock<IAllElement> elem5 = mocks.CreateMock<IAllElement>();

            var elems = new List<IWebElement>().AsReadOnly();
            var elems12 = new List<IWebElement>() { elem1.MockObject, elem2.MockObject }.AsReadOnly();
            var elems5 = new List<IWebElement>() { elem5.MockObject }.AsReadOnly();

            driver.Expects.One.Method(_ => _.FindElementsByName(null)).With("cheese").WillReturn(elems12);
            elem1.Expects.One.Method(_ => _.FindElements(null)).With(By.Name("photo")).WillReturn(elems);
            elem2.Expects.One.Method(_ => _.FindElements(null)).With(By.Name("photo")).WillReturn(elems5);

            ByChained by = new ByChained(By.Name("cheese"), By.Name("photo"));
            Assert.That(by.FindElement(driver.MockObject), Is.EqualTo(elem5.MockObject));
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void FindElementsTwoByEmptyChild()
        {
            MockFactory mocks = new MockFactory();
            Mock<IAllDriver> driver = mocks.CreateMock<IAllDriver>();

            Mock<IAllElement> elem1 = mocks.CreateMock<IAllElement>();
            Mock<IAllElement> elem2 = mocks.CreateMock<IAllElement>();
            Mock<IAllElement> elem3 = mocks.CreateMock<IAllElement>();
            Mock<IAllElement> elem4 = mocks.CreateMock<IAllElement>();
            Mock<IAllElement> elem5 = mocks.CreateMock<IAllElement>();
            var elems = new List<IWebElement>().AsReadOnly();
            var elems12 = new List<IWebElement>() { elem1.MockObject, elem2.MockObject }.AsReadOnly();
            var elems34 = new List<IWebElement>() { elem3.MockObject, elem4.MockObject }.AsReadOnly();
            var elems5 = new List<IWebElement>() { elem5.MockObject }.AsReadOnly();
            var elems345 = new List<IWebElement>() { elem3.MockObject, elem4.MockObject, elem5.MockObject }.AsReadOnly();

            driver.Expects.One.Method(_ => _.FindElementsByName(null)).With("cheese").WillReturn(elems12);
            elem1.Expects.One.Method(_ => _.FindElements(null)).With(By.Name("photo")).WillReturn(elems);
            elem2.Expects.One.Method(_ => _.FindElements(null)).With(By.Name("photo")).WillReturn(elems5);

            ByChained by = new ByChained(By.Name("cheese"), By.Name("photo"));
            Assert.That(by.FindElements(driver.MockObject), Is.EqualTo(new[] { elem5.MockObject }));
            mocks.VerifyAllExpectationsHaveBeenMet();
        }

        [Test]
        public void TestEquals()
        {
            Assert.That(new ByChained(By.Id("cheese"), By.Name("photo")),
                Is.EqualTo(new ByChained(By.Id("cheese"), By.Name("photo"))));
        }
    }
}
