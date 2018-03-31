using System.Collections.Generic;
using Moq;
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
            Mock<IAllDriver> driver = new Mock<IAllDriver>();

            ByChained by = new ByChained();
            Assert.Throws<NoSuchElementException>(() => by.FindElement(driver.Object));
        }

        [Test]
        public void FindElementsZeroBy()
        {
            Mock<IAllDriver> driver = new Mock<IAllDriver>();

            ByChained by = new ByChained();

            Assert.That(by.FindElements(driver.Object), Is.EqualTo(new List<IWebElement>().AsReadOnly()));
        }

        [Test]
        public void FindElementOneBy()
        {
            Mock<IAllDriver> driver = new Mock<IAllDriver>();
            Mock<IAllElement> elem1 = new Mock<IAllElement>();
            Mock<IAllElement> elem2 = new Mock<IAllElement>();
            var elems12 = new List<IWebElement>() { elem1.Object, elem2.Object }.AsReadOnly();
            driver.Setup(_ => _.FindElementsByName(It.Is<string>(x => x == "cheese"))).Returns(elems12);

            ByChained by = new ByChained(By.Name("cheese"));
            Assert.AreEqual(by.FindElement(driver.Object), elem1.Object);
            driver.Verify(_ => _.FindElementsByName("cheese"), Times.Once);
        }

        [Test]
        public void FindElementsOneBy()
        {
            Mock<IAllDriver> driver = new Mock<IAllDriver>();
            Mock<IAllElement> elem1 = new Mock<IAllElement>();
            Mock<IAllElement> elem2 = new Mock<IAllElement>();
            var elems12 = new List<IWebElement>() { elem1.Object, elem2.Object }.AsReadOnly();
            driver.Setup(_ => _.FindElementsByName(It.Is<string>(x => x == "cheese"))).Returns(elems12);

            ByChained by = new ByChained(By.Name("cheese"));
            Assert.AreEqual(by.FindElements(driver.Object), elems12);
            driver.Verify(_ => _.FindElementsByName("cheese"), Times.Once);
        }

        [Test]
        public void FindElementOneByEmpty()
        {
            Mock<IAllDriver> driver = new Mock<IAllDriver>();
            var elems = new List<IWebElement>().AsReadOnly();

            driver.Setup(_ => _.FindElementsByName(It.Is<string>(x => x == "cheese"))).Returns(elems);

            ByChained by = new ByChained(By.Name("cheese"));
            try
            {
                by.FindElement(driver.Object);
                Assert.Fail("Expected NoSuchElementException!");
            }
            catch (NoSuchElementException)
            {
                driver.Verify(_ => _.FindElementsByName("cheese"), Times.Once);
                Assert.Pass();
            }
        }

        [Test]
        public void FindElementsOneByEmpty()
        {
            Mock<IAllDriver> driver = new Mock<IAllDriver>();
            var elems = new List<IWebElement>().AsReadOnly();

            driver.Setup(_ => _.FindElementsByName(It.Is<string>(x => x == "cheese"))).Returns(elems);

            ByChained by = new ByChained(By.Name("cheese"));

            Assert.That(by.FindElements(driver.Object), Is.EqualTo(elems));
        }

        [Test]
        public void FindElementTwoBy()
        {
            Mock<IAllDriver> driver = new Mock<IAllDriver>();

            Mock<IAllElement> elem1 = new Mock<IAllElement>();
            Mock<IAllElement> elem2 = new Mock<IAllElement>();
            Mock<IAllElement> elem3 = new Mock<IAllElement>();
            Mock<IAllElement> elem4 = new Mock<IAllElement>();
            Mock<IAllElement> elem5 = new Mock<IAllElement>();
            var elems12 = new List<IWebElement>() { elem1.Object, elem2.Object }.AsReadOnly();
            var elems34 = new List<IWebElement>() { elem3.Object, elem4.Object }.AsReadOnly();
            var elems5 = new List<IWebElement>() { elem5.Object }.AsReadOnly();
            var elems345 = new List<IWebElement>() { elem3.Object, elem4.Object, elem5.Object }.AsReadOnly();

            driver.Setup(_ => _.FindElementsByName(It.Is<string>(x => x == "cheese"))).Returns(elems12);
            elem1.Setup(_ => _.FindElements(It.Is<By>(x => x.Equals(By.Name("photo"))))).Returns(elems34);
            elem2.Setup(_ => _.FindElements(It.Is<By>(x => x.Equals(By.Name("photo"))))).Returns(elems5);

            ByChained by = new ByChained(By.Name("cheese"), By.Name("photo"));
            Assert.That(by.FindElement(driver.Object), Is.EqualTo(elem3.Object));
            driver.Verify(_ => _.FindElementsByName("cheese"), Times.Once);
            elem1.Verify(_ => _.FindElements(By.Name("photo")), Times.Once);
            elem2.Verify(_ => _.FindElements(By.Name("photo")), Times.Once);
        }

        [Test]
        public void FindElementTwoByEmptyParent()
        {
            Mock<IAllDriver> driver = new Mock<IAllDriver>();

            var elems = new List<IWebElement>().AsReadOnly();

            driver.Setup(_ => _.FindElementsByName(It.Is<string>(x => x == "cheese"))).Returns(elems);

            ByChained by = new ByChained(By.Name("cheese"), By.Name("photo"));
            try
            {
                by.FindElement(driver.Object);
                Assert.Fail("Expected NoSuchElementException!");
            }
            catch (NoSuchElementException)
            {
                driver.Verify(_ => _.FindElementsByName("cheese"), Times.Once);
                Assert.Pass();
            }
        }

        [Test]
        public void FindElementsTwoByEmptyParent()
        {
            Mock<IAllDriver> driver = new Mock<IAllDriver>();

            var elems = new List<IWebElement>().AsReadOnly();

            driver.Setup(_ => _.FindElementsByName(It.Is<string>(x => x == "cheese"))).Returns(elems);

            ByChained by = new ByChained(By.Name("cheese"), By.Name("photo"));

            Assert.That(by.FindElements(driver.Object), Is.EqualTo(elems));
            driver.Verify(_ => _.FindElementsByName("cheese"), Times.Once);
        }

        [Test]
        public void FindElementTwoByEmptyChild()
        {
            Mock<IAllDriver> driver = new Mock<IAllDriver>();

            Mock<IAllElement> elem1 = new Mock<IAllElement>();
            Mock<IAllElement> elem2 = new Mock<IAllElement>();
            Mock<IAllElement> elem5 = new Mock<IAllElement>();

            var elems = new List<IWebElement>().AsReadOnly();
            var elems12 = new List<IWebElement>() { elem1.Object, elem2.Object }.AsReadOnly();
            var elems5 = new List<IWebElement>() { elem5.Object }.AsReadOnly();

            driver.Setup(_ => _.FindElementsByName(It.Is<string>(x => x == "cheese"))).Returns(elems12);
            elem1.Setup(_ => _.FindElements(It.Is<By>(x => x.Equals(By.Name("photo"))))).Returns(elems);
            elem2.Setup(_ => _.FindElements(It.Is<By>(x => x.Equals(By.Name("photo"))))).Returns(elems5);

            ByChained by = new ByChained(By.Name("cheese"), By.Name("photo"));
            Assert.That(by.FindElement(driver.Object), Is.EqualTo(elem5.Object));
            driver.Verify(_ => _.FindElementsByName("cheese"), Times.Once);
            elem1.Verify(_ => _.FindElements(By.Name("photo")), Times.Once);
            elem2.Verify(_ => _.FindElements(By.Name("photo")), Times.Once);
        }

        [Test]
        public void FindElementsTwoByEmptyChild()
        {
            Mock<IAllDriver> driver = new Mock<IAllDriver>();

            Mock<IAllElement> elem1 = new Mock<IAllElement>();
            Mock<IAllElement> elem2 = new Mock<IAllElement>();
            Mock<IAllElement> elem3 = new Mock<IAllElement>();
            Mock<IAllElement> elem4 = new Mock<IAllElement>();
            Mock<IAllElement> elem5 = new Mock<IAllElement>();
            var elems = new List<IWebElement>().AsReadOnly();
            var elems12 = new List<IWebElement>() { elem1.Object, elem2.Object }.AsReadOnly();
            var elems34 = new List<IWebElement>() { elem3.Object, elem4.Object }.AsReadOnly();
            var elems5 = new List<IWebElement>() { elem5.Object }.AsReadOnly();
            var elems345 = new List<IWebElement>() { elem3.Object, elem4.Object, elem5.Object }.AsReadOnly();

            driver.Setup(_ => _.FindElementsByName(It.Is<string>(x => x == "cheese"))).Returns(elems12);
            elem1.Setup(_ => _.FindElements(It.Is<By>(x => x.Equals(By.Name("photo"))))).Returns(elems);
            elem2.Setup(_ => _.FindElements(It.Is<By>(x => x.Equals(By.Name("photo"))))).Returns(elems5);

            ByChained by = new ByChained(By.Name("cheese"), By.Name("photo"));
            Assert.That(by.FindElements(driver.Object), Is.EqualTo(new[] { elem5.Object }));
            driver.Verify(_ => _.FindElementsByName("cheese"), Times.Once);
            elem1.Verify(_ => _.FindElements(By.Name("photo")), Times.Once);
            elem2.Verify(_ => _.FindElements(By.Name("photo")), Times.Once);
        }

        [Test]
        public void TestEquals()
        {
            Assert.That(new ByChained(By.Id("cheese"), By.Name("photo")),
                Is.EqualTo(new ByChained(By.Id("cheese"), By.Name("photo"))));
        }
    }
}
