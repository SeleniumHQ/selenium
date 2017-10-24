using System;
using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ImplicitWaitTest : DriverTestFixture
    {
        [TearDown]
        public void ResetImplicitWaitTimeout()
        {
            driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(0);
        }

        [Test]
        [Category("JavaScript")]
        public void ShouldImplicitlyWaitForASingleElement()
        {
            driver.Url = dynamicPage;
            IWebElement add = driver.FindElement(By.Id("adder"));

            driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(3000);

            add.Click();
            driver.FindElement(By.Id("box0"));  // All is well if this doesn't throw.
        }

        [Test]
        [Category("JavaScript")]
        public void ShouldStillFailToFindAnElementWhenImplicitWaitsAreEnabled()
        {
            driver.Url = dynamicPage;
            driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(500);
            Assert.Throws<NoSuchElementException>(() => driver.FindElement(By.Id("box0")));
        }

        [Test]
        [Category("JavaScript")]
        [NeedsFreshDriver]
        public void ShouldReturnAfterFirstAttemptToFindOneAfterDisablingImplicitWaits()
        {
            driver.Url = dynamicPage;
            driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(3000);
            driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(0);
            Assert.Throws<NoSuchElementException>(() => driver.FindElement(By.Id("box0")));
        }

        [Test]
        [Category("JavaScript")]
        [NeedsFreshDriver]
        public void ShouldImplicitlyWaitUntilAtLeastOneElementIsFoundWhenSearchingForMany()
        {
            driver.Url = dynamicPage;
            IWebElement add = driver.FindElement(By.Id("adder"));

            driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(2000);
            add.Click();
            add.Click();

            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.ClassName("redbox"));
            Assert.GreaterOrEqual(elements.Count, 1);
        }

        [Test]
        [Category("JavaScript")]
        [NeedsFreshDriver]
        public void ShouldStillFailToFindAnElemenstWhenImplicitWaitsAreEnabled()
        {
            driver.Url = dynamicPage;

            driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(500);
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.ClassName("redbox"));
            Assert.AreEqual(0, elements.Count);
        }

        [Test]
        [Category("JavaScript")]
        [NeedsFreshDriver]
        public void ShouldReturnAfterFirstAttemptToFindManyAfterDisablingImplicitWaits()
        {
            driver.Url = dynamicPage;
            IWebElement add = driver.FindElement(By.Id("adder"));
            driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(1100);
            driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(0);
            add.Click();
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.ClassName("redbox"));
            Assert.AreEqual(0, elements.Count);
        }

        [Test]
        [IgnoreBrowser(Browser.IE)]
        [IgnoreBrowser(Browser.PhantomJS)]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Safari)]
        public void ShouldImplicitlyWaitForAnElementToBeVisibleBeforeInteracting()
        {
            driver.Url = dynamicPage;

            IWebElement reveal = driver.FindElement(By.Id("reveal"));
            IWebElement revealed = driver.FindElement(By.Id("revealed"));
            driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(5000);

            Assert.IsFalse(revealed.Displayed, "revealed should not be visible");
            reveal.Click();

            try
            {
                revealed.SendKeys("hello world");
                // This is what we want
            }
            catch (ElementNotVisibleException)
            {
                Assert.Fail("Element should have been visible");
            }
        }
    }
}
