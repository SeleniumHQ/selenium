using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class OpacityTest : DriverTestFixture
    {
        [Test]
        public void ShouldBeAbleToClickOnElementsWithOpacityZero()
        {
            driver.Url = clickJackerPage;
            IWebElement element = driver.FindElement(By.Id("clickJacker"));
            //Assert.AreEqual("0", element.GetCssValue("opacity"), "Precondition failed: clickJacker should be transparent");
            element.Click();
            Assert.AreEqual("1", element.GetCssValue("opacity"));
        }
    }
}
