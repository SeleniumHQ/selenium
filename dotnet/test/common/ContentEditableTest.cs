using NUnit.Framework;
using OpenQA.Selenium.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ContentEditableTest : DriverTestFixture
    {
        [TearDown]
        public void SwitchToDefaultContent()
        {
            driver.SwitchTo().DefaultContent();
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox)]
        public void TypingIntoAnIFrameWithContentEditableOrDesignModeSet()
        {
            driver.Url = richTextPage;

            driver.SwitchTo().Frame("editFrame");
            IWebElement element = driver.SwitchTo().ActiveElement();
            element.SendKeys("Fishy");

            driver.SwitchTo().DefaultContent();
            IWebElement trusted = driver.FindElement(By.Id("istrusted"));
            IWebElement id = driver.FindElement(By.Id("tagId"));

            // Chrome does not set a trusted flag.
            Assert.That(trusted.Text, Is.AnyOf("[true]", "[n/a]", "[]"));
            Assert.That(id.Text, Is.AnyOf("[frameHtml]", "[theBody]"));
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox)]
        [IgnoreBrowser(Browser.Safari, "Not yet implemented")]
        public void NonPrintableCharactersShouldWorkWithContentEditableOrDesignModeSet()
        {
            driver.Url = richTextPage;

            driver.SwitchTo().Frame("editFrame");
            IWebElement element = driver.SwitchTo().ActiveElement();
            element.SendKeys("Dishy" + Keys.Backspace + Keys.Left + Keys.Left);
            element.SendKeys(Keys.Left + Keys.Left + "F" + Keys.Delete + Keys.End + "ee!");

            Assert.AreEqual("Fishee!", element.Text);
        }

        [Test]
        public void ShouldBeAbleToTypeIntoEmptyContentEditableElement()
        {
            driver.Url = readOnlyPage;
            IWebElement editable = driver.FindElement(By.Id("content-editable-blank"));

            editable.SendKeys("cheese");

            Assert.That(editable.Text, Is.EqualTo("cheese"));
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.IE)]
        [IgnoreBrowser(Browser.Safari, "Not yet implemented")]
        [IgnoreBrowser(Browser.Firefox, "Not yet implemented = https://github.com/mozilla/geckodriver/issues/667")]
        public void ShouldBeAbleToTypeIntoContentEditableElementWithExistingValue()
        {
            driver.Url = readOnlyPage;
            IWebElement editable = driver.FindElement(By.Id("content-editable"));

            String initialText = editable.Text;
            editable.SendKeys(", edited");

            Assert.That(editable.Text, Is.EqualTo(initialText + ", edited"));
        }

        [Test]
        [IgnoreBrowser(Browser.IE)]
        public void ShouldBeAbleToTypeIntoTinyMCE()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("tinymce.html");
            driver.SwitchTo().Frame("mce_0_ifr");

            IWebElement editable = driver.FindElement(By.Id("tinymce"));

            editable.Clear();
            editable.SendKeys("cheese"); // requires focus on OS X

            Assert.That(editable.Text, Is.EqualTo("cheese"));
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.IE)]
        [IgnoreBrowser(Browser.Safari, "Prepends text")]
        [IgnoreBrowser(Browser.Firefox, "Not yet implemented = https://github.com/mozilla/geckodriver/issues/667")]
        public void ShouldAppendToTinyMCE()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("tinymce.html");
            driver.SwitchTo().Frame("mce_0_ifr");

            IWebElement editable = driver.FindElement(By.Id("tinymce"));

            editable.SendKeys(" and cheese"); // requires focus on OS X

            Assert.That(editable.Text, Is.EqualTo("Initial content and cheese"));
        }

        [Test]
        [IgnoreBrowser(Browser.Edge)]
        [IgnoreBrowser(Browser.Firefox, "Doesn't write anything")]
        [IgnoreBrowser(Browser.Safari, "Prepends text")]
        public void AppendsTextToEndOfContentEditableWithMultipleTextNodes()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("content-editable.html");
            IWebElement input = driver.FindElement(By.Id("editable"));
            input.SendKeys(", world!");
            Assert.AreEqual("Why hello, world!", input.Text);
        }
    }
}
