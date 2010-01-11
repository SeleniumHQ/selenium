using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class TargetLocatorTest : DriverTestFixture
    {

        [Test]
        [ExpectedException(typeof(NoSuchFrameException))]
        public void ShouldThrowExceptionAfterSwitchingToNonExistingFrameIndex()
        {
            driver.Url = framesPage;
            driver.SwitchTo().Frame(10);
        }

        [Test]
        [ExpectedException(typeof(NoSuchFrameException))]
        public void ShouldThrowExceptionAfterSwitchingToNonExistingFrameName()
        {
            driver.Url = framesPage;
            driver.SwitchTo().Frame("æ©ñµøöíúüþ®éåä²doesnotexist");
        }

        [Test]
        [ExpectedException(typeof(ArgumentNullException))]
        public void ShouldThrowExceptionAfterSwitchingToNullFrameName()
        {
            driver.Url = framesPage;
            driver.SwitchTo().Frame(null);
        }

        [Test]
        public void ShouldSwitchToIframeByNameAndBackToDefaultContent()
        {
            driver.Url = iframesPage;
            driver.SwitchTo().Frame("iframe1");
            IWebElement element = driver.FindElement(By.Name("id-name1"));
            Assert.IsNotNull(element);

            driver.SwitchTo().DefaultContent();
            element = driver.FindElement(By.Id("iframe_page_heading"));
            Assert.IsNotNull(element);
        }

        [Test]
        public void ShouldSwitchToIframeByIndexAndBackToDefaultContent()
        {
            driver.Url = iframesPage;
            driver.SwitchTo().Frame(0);
            IWebElement element = driver.FindElement(By.Name("id-name1"));
            Assert.IsNotNull(element);

            driver.SwitchTo().DefaultContent();
            element = driver.FindElement(By.Id("iframe_page_heading"));
            Assert.IsNotNull(element);
        }

        [Test]
        public void ShouldSwitchToFrameByNameAndBackToDefaultContent() 
        {
            driver.Url = framesPage;
            
            driver.SwitchTo().Frame("first");
            Assert.AreEqual(driver.FindElement(By.Id("pageNumber")).Text, "1");

            driver.SwitchTo().DefaultContent();
            Assert.AreEqual(driver.FindElement(By.Id("pageNumber")).Text, "1");

            driver.SwitchTo().Frame("second");
            Assert.AreEqual(driver.FindElement(By.Id("pageNumber")).Text, "2");

            driver.SwitchTo().DefaultContent();
            Assert.AreEqual(driver.FindElement(By.Id("pageNumber")).Text, "1");
        }

        [Test]
        public void ShouldSwitchToFrameByIndexAndBackToDefaultContent()
        {
            driver.Url = framesPage;
            
            driver.SwitchTo().Frame(0);
            Assert.AreEqual(driver.FindElement(By.Id("pageNumber")).Text, "1");

            driver.SwitchTo().DefaultContent();
            Assert.AreEqual(driver.FindElement(By.Id("pageNumber")).Text, "1");

            driver.SwitchTo().Frame(1);
            Assert.AreEqual(driver.FindElement(By.Id("pageNumber")).Text, "2");

            driver.SwitchTo().DefaultContent();
            Assert.AreEqual(driver.FindElement(By.Id("pageNumber")).Text, "1");
        }

    }
}
