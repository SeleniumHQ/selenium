using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Drawing;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class StaleElementReferenceTest : DriverTestFixture
    {
        [Test]
        [ExpectedException(typeof(StaleElementReferenceException))]
        public void OldPage()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));
            driver.Url = xhtmlTestPage;
            driver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromMilliseconds(500));
            elem.Click();
        }

        [Test]
        [Category("Javascript")]
        [ExpectedException(typeof(StaleElementReferenceException))]
        public void ShouldNotCrashWhenCallingGetSizeOnAnObsoleteElement()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));
            driver.Url = xhtmlTestPage;
            driver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromMilliseconds(500));
            Size elementSize = elem.Size;
        }

        [Test]
        [Category("Javascript")]
        [ExpectedException(typeof(StaleElementReferenceException))]
        public void ShouldNotCrashWhenQueryingTheAttributeOfAStaleElement()
        {
            driver.Url = xhtmlTestPage;
            IWebElement heading = driver.FindElement(By.XPath("//h1"));
            driver.Url = simpleTestPage;
            string className = heading.GetAttribute("class");
        }
    }
}
