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
            //TODO (jimevan): this is an ugly sleep. Remove when implicit waiting is implemented.
            System.Threading.Thread.Sleep(500);
            elem.Click();
        }

        [Test]
        [Category("Javascript")]
        [ExpectedException(typeof(StaleElementReferenceException))]
        public void ShouldNotCrashWhenCallingGetSizeOnAnObsoleteElement()
        {
            driver.Url = simpleTestPage;
            IRenderedWebElement elem = (IRenderedWebElement)driver.FindElement(By.Id("links"));
            driver.Url = xhtmlTestPage;
            //TODO (jimevan): this is an ugly sleep. Remove when implicit waiting is implemented.
            System.Threading.Thread.Sleep(500);
            Size elementSize = elem.Size;
        }
    }
}
