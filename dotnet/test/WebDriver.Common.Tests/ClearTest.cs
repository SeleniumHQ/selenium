using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ClearTest : DriverTestFixture
    {
        [Test]
        [IgnoreBrowser(Browser.IE, "Untested feature")]
        [IgnoreBrowser(Browser.Firefox, "Untested feature")]
        [IgnoreBrowser(Browser.Chrome, "Untested feature")]
        [IgnoreBrowser(Browser.Remote, "Untested feature")]
        [IgnoreBrowser(Browser.Safari, "Untested feature")]
        [IgnoreBrowser(Browser.Opera, "Untested feature")]
        [IgnoreBrowser(Browser.IPhone, "Untested feature")]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        public void WritableTextInputShouldClear()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("writableTextInput"));
            element.Clear();
            Assert.AreEqual(string.Empty, element.GetAttribute("value"));
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Untested feature")]
        [IgnoreBrowser(Browser.Firefox, "Untested feature")]
        [IgnoreBrowser(Browser.Chrome, "Untested feature")]
        [IgnoreBrowser(Browser.Remote, "Untested feature")]
        [IgnoreBrowser(Browser.Safari, "Untested feature")]
        [IgnoreBrowser(Browser.Opera, "Untested feature")]
        [IgnoreBrowser(Browser.IPhone, "Untested feature")]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        [ExpectedException(typeof(InvalidElementStateException))]
        public void TextInputShouldNotClearWhenDisabled()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("textInputnotenabled"));
            Assert.IsFalse(element.Enabled);
            element.Clear();
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Untested feature")]
        [IgnoreBrowser(Browser.Firefox, "Untested feature")]
        [IgnoreBrowser(Browser.Chrome, "Untested feature")]
        [IgnoreBrowser(Browser.Remote, "Untested feature")]
        [IgnoreBrowser(Browser.Safari, "Untested feature")]
        [IgnoreBrowser(Browser.Opera, "Untested feature")]
        [IgnoreBrowser(Browser.IPhone, "Untested feature")]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        [ExpectedException(typeof(InvalidElementStateException))]
        public void TextInputShouldNotClearWhenReadOnly()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("readOnlyTextInput"));
            Assert.IsFalse(element.Enabled);
            element.Clear();
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Untested feature")]
        [IgnoreBrowser(Browser.Firefox, "Untested feature")]
        [IgnoreBrowser(Browser.Chrome, "Untested feature")]
        [IgnoreBrowser(Browser.Remote, "Untested feature")]
        [IgnoreBrowser(Browser.Safari, "Untested feature")]
        [IgnoreBrowser(Browser.Opera, "Untested feature")]
        [IgnoreBrowser(Browser.IPhone, "Untested feature")]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        public void WritableTextAreaShouldClear()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("writableTextArea"));
            element.Clear();
            Assert.AreEqual(string.Empty, element.GetAttribute("value"));
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Untested feature")]
        [IgnoreBrowser(Browser.Firefox, "Untested feature")]
        [IgnoreBrowser(Browser.Chrome, "Untested feature")]
        [IgnoreBrowser(Browser.Remote, "Untested feature")]
        [IgnoreBrowser(Browser.Safari, "Untested feature")]
        [IgnoreBrowser(Browser.Opera, "Untested feature")]
        [IgnoreBrowser(Browser.IPhone, "Untested feature")]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        [ExpectedException(typeof(InvalidElementStateException))]
        public void TextAreaShouldNotClearWhenDisabled()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("textAreaNotenabled"));
            element.Clear();
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Untested feature")]
        [IgnoreBrowser(Browser.Firefox, "Untested feature")]
        [IgnoreBrowser(Browser.Chrome, "Untested feature")]
        [IgnoreBrowser(Browser.Remote, "Untested feature")]
        [IgnoreBrowser(Browser.Safari, "Untested feature")]
        [IgnoreBrowser(Browser.Opera, "Untested feature")]
        [IgnoreBrowser(Browser.IPhone, "Untested feature")]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        [ExpectedException(typeof(InvalidElementStateException))]
        public void TextAreaShouldNotClearWhenReadOnly()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("textAreaReadOnly"));
            element.Clear();
        }
    }
}
