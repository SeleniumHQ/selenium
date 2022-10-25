using System.Collections.Generic;
using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [IgnoreBrowser(Browser.IE, "IE does not support Shadow DOM natively")]
    [IgnoreBrowser(Browser.Safari, "Safari driver does not support Shadow DOM end points")]
    [TestFixture]
    public class ShadowRootHandlingTest : DriverTestFixture
    {
        [Test]
        public void ShouldReturnShadowRoot()
        {
            driver.Url = shadowRootPage;
            IWebElement element = driver.FindElement(By.CssSelector("custom-checkbox-element"));
            ISearchContext shadowRoot = element.GetShadowRoot();
            Assert.That(shadowRoot, Is.Not.Null, "Did not find shadow root");
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox, "Firefox does not support finding Shadow DOM elements")]
        public void ShouldFindElementUnderShadowRoot()
        {
            driver.Url = shadowRootPage;
            IWebElement element = driver.FindElement(By.CssSelector("custom-checkbox-element"));
            ISearchContext shadowRoot = element.GetShadowRoot();
            IWebElement elementInShadow = shadowRoot.FindElement(By.CssSelector("input"));
            Assert.That(elementInShadow.GetAttribute("type"), Is.EqualTo("checkbox"), "Did not find element in shadow root");
        }

        [Test]
        public void ShouldThrowGettingShadowRootWithElementNotHavingShadowRoot()
        {
            driver.Url = shadowRootPage;
            IWebElement element = driver.FindElement(By.CssSelector("#noShadowRoot"));
            Assert.That(() => element.GetShadowRoot(), Throws.InstanceOf(typeof(NoSuchShadowRootException)));
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox, "Firefox does not support finding Shadow DOM elements")]
        public void ShouldGetShadowRootReferenceFromJavaScript()
        {
            driver.Url = shadowRootPage;
            IWebElement element = driver.FindElement(By.CssSelector("custom-checkbox-element"));
            object shadowRoot = ((IJavaScriptExecutor)driver).ExecuteScript("return arguments[0].shadowRoot;", element);
            Assert.That(shadowRoot, Is.InstanceOf<ISearchContext>(), "Did not find shadow root");
        }

        [Test]
        public void ShouldAllowShadowRootReferenceAsArgumentToJavaScript()
        {
            driver.Url = shadowRootPage;
            IWebElement element = driver.FindElement(By.CssSelector("custom-checkbox-element"));
            ISearchContext shadowRoot = element.GetShadowRoot();
            object elementInShadow = ((IJavaScriptExecutor)driver).ExecuteScript("return arguments[0].querySelector('input');", shadowRoot);
            Assert.That(elementInShadow, Is.InstanceOf<IWebElement>(), "Did not find shadow root");
        }
    }
}
