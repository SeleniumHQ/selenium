using System;
using System.Linq;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium.Support.PageObjects
{
    [TestFixture]
    public class ByChainedBrowserTests : DriverTestFixture
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
        public void FindElementNotFound_ShouldThrow()
        {
            driver.Url = nestedPage;
            driver.Navigate();

            var by = new ByChained(By.Name("NotFoundAtAll"));
            try
            {
                by.FindElement(driver);
                Assert.Fail("Expected NotFoundExcepotion");
            }
            catch (NotFoundException)
            {
                Assert.Pass();
            }
        }

        [Test]
        public void FindElementsNotFound_ShouldBeZero()
        {
            driver.Url = nestedPage;
            driver.Navigate();

            var by = new ByChained(By.Name("NotFoundAtAll"));
                
            Assert.AreEqual(0, by.FindElements(driver).Count);
        }

        [Test]
        public void FindElement_ShouldReturnOne()
        {
            driver.Url = nestedPage;
            driver.Navigate();

            var by = new ByChained(By.Name("div1"));
            Assert.IsTrue(by.FindElement(driver).Displayed);
        }

        [Test]
        public void FindElements_ShouldReturnMultiple()
        {
            driver.Url = nestedPage;
            driver.Navigate();

            var by = new ByChained(By.Name("div1"));
            Assert.AreEqual(4, by.FindElements(driver).Count);
        }

        [Test]
        public void FindElement_TwoBys_ShouldReturnOne()
        {
            driver.Url = nestedPage;
            driver.Navigate();

            var by = new ByChained(By.Name("classes"), By.CssSelector(".one"));
            Assert.AreEqual("Find me", by.FindElement(driver).Text);
        }

        [Test]
        public void FindElements_TwoBys_ShouldReturnMultiple()
        {
            driver.Url = nestedPage;
            driver.Navigate();

            var by = new ByChained(By.Name("classes"), By.CssSelector(".one"));
            Assert.AreEqual(2, by.FindElements(driver).Count);
        }

        [Test]
        public void FindElements_TwoBys_ShouldReturnZero()
        {
            driver.Url = nestedPage;
            driver.Navigate();

            var by = new ByChained(By.Name("classes"), By.CssSelector(".NotFound"));
            Assert.AreEqual(0, by.FindElements(driver).Count);
        }

        [Test]
        public void FindElement_TwoBys_ShouldThrow()
        {
            driver.Url = nestedPage;
            driver.Navigate();

            try
            {
                var by = new ByChained(By.Name("classes"), By.CssSelector(".NotFound"));
                by.FindElement(driver);
                Assert.Fail("Expected NotFoundException");
            }
            catch (NotFoundException) 
            {
                Assert.Pass();
            }
        }
    }
}
