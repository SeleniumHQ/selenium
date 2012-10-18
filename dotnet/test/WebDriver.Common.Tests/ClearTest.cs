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
        [IgnoreBrowser(Browser.Chrome, "Untested feature")]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        public void WritableTextInputShouldClear()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("writableTextInput"));
            element.Clear();
            Assert.AreEqual(string.Empty, element.GetAttribute("value"));
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Untested feature")]
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
        [IgnoreBrowser(Browser.Chrome, "Untested feature")]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        [IgnoreBrowser(Browser.Opera, "Untested feature")]
        [ExpectedException(typeof(InvalidElementStateException))]
        public void TextInputShouldNotClearWhenReadOnly()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("readOnlyTextInput"));
            element.Clear();
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Untested feature")]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        public void WritableTextAreaShouldClear()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("writableTextArea"));
            element.Clear();
            Assert.AreEqual(string.Empty, element.GetAttribute("value"));
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Untested feature")]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        [ExpectedException(typeof(InvalidElementStateException))]
        public void TextAreaShouldNotClearWhenDisabled()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("textAreaNotenabled"));
            element.Clear();
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Untested feature")]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        [IgnoreBrowser(Browser.Opera, "Untested feature")]
        [ExpectedException(typeof(InvalidElementStateException))]
        public void TextAreaShouldNotClearWhenReadOnly()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("textAreaReadOnly"));
            element.Clear();
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Untested feature")]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        [IgnoreBrowser(Browser.HtmlUnit, "Untested feature")]
        [IgnoreBrowser(Browser.IPhone, "Untested feature")]
        public void ContentEditableAreaShouldClear()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("content-editable"));
            element.Clear();
            Assert.AreEqual(string.Empty, element.Text);
        }
   }
}
