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
        [ExpectedException(typeof(InvalidOperationException))]
        public void ShouldThrowExceptionAfterSwitchingToNonExistingFrameIndex()
        {
            driver.Url = framesPage;
            driver.SwitchTo().Frame(10);
        }

        [Test]
        [ExpectedException(typeof(InvalidOperationException))]
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
            Assert.AreEqual(formsTitle, driver.Title);
            driver.SwitchTo().DefaultContent();
            Assert.AreEqual(iframesTitle, driver.Title);
        }

        [Test]
        public void ShouldSwitchToIframeByIndexAndBackToDefaultContent()
        {
            driver.Url = iframesPage;
            driver.SwitchTo().Frame(0);
            Assert.AreEqual(formsTitle, driver.Title);
            driver.SwitchTo().DefaultContent();
            Assert.AreEqual(iframesTitle, driver.Title);
        }

        [Test]
        public void ShouldSwitchToFrameByNameAndBackToDefaultContent() 
        {
            driver.Url = framesPage;
            
            driver.SwitchTo().Frame("first");
            Assert.AreEqual("Page1", driver.Title);

            driver.SwitchTo().DefaultContent();
            Assert.AreEqual("Page1", driver.Title);

            driver.SwitchTo().Frame("second");
            Assert.AreEqual("Page2", driver.Title);

            driver.SwitchTo().DefaultContent();
            Assert.AreEqual("Page1", driver.Title);
        }

        [Test]
        public void ShouldSwitchToFrameByIndexAndBackToDefaultContent()
        {
            driver.Url = framesPage;
            
            driver.SwitchTo().Frame(0);
            Assert.AreEqual("Page1", driver.Title);

            driver.SwitchTo().DefaultContent();
            Assert.AreEqual("Page1", driver.Title);

            driver.SwitchTo().Frame(1);
            Assert.AreEqual("Page2", driver.Title);

            driver.SwitchTo().DefaultContent();
            Assert.AreEqual("Page1", driver.Title);
        }

    }
}
