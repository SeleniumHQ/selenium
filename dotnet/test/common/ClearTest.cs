using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ClearTest : DriverTestFixture
    {
        [Test]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        public void WritableTextInputShouldClear()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("writableTextInput"));
            element.Clear();
            Assert.AreEqual(string.Empty, element.GetAttribute("value"));
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        public void TextInputShouldNotClearWhenDisabled()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("textInputnotenabled"));
            Assert.IsFalse(element.Enabled);
            Assert.Throws<InvalidElementStateException>(() => element.Clear());
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        [IgnoreBrowser(Browser.Opera, "Untested feature")]
        public void TextInputShouldNotClearWhenReadOnly()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("readOnlyTextInput"));
            Assert.Throws<InvalidElementStateException>(() => element.Clear());
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        public void WritableTextAreaShouldClear()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("writableTextArea"));
            element.Clear();
            Assert.AreEqual(string.Empty, element.GetAttribute("value"));
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        public void TextAreaShouldNotClearWhenDisabled()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("textAreaNotenabled"));
            Assert.Throws<InvalidElementStateException>(() => element.Clear());
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        [IgnoreBrowser(Browser.Opera, "Untested feature")]
        public void TextAreaShouldNotClearWhenReadOnly()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("textAreaReadOnly"));
            Assert.Throws<InvalidElementStateException>(() => element.Clear());
        }

        [Test]
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
