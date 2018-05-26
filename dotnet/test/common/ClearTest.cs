using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ClearTest : DriverTestFixture
    {
        [Test]
        public void WritableTextInputShouldClear()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("writableTextInput"));
            element.Clear();
            Assert.AreEqual(string.Empty, element.GetAttribute("value"));
        }

        [Test]
        public void TextInputShouldNotClearWhenDisabled()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("textInputnotenabled"));
            Assert.IsFalse(element.Enabled);
            Assert.Throws<InvalidElementStateException>(() => element.Clear());
        }

        [Test]
        [IgnoreBrowser(Browser.Opera, "Untested feature")]
        public void TextInputShouldNotClearWhenReadOnly()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("readOnlyTextInput"));
            Assert.Throws<InvalidElementStateException>(() => element.Clear());
        }

        [Test]
        public void WritableTextAreaShouldClear()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("writableTextArea"));
            element.Clear();
            Assert.AreEqual(string.Empty, element.GetAttribute("value"));
        }

        [Test]
        public void TextAreaShouldNotClearWhenDisabled()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("textAreaNotenabled"));
            Assert.Throws<InvalidElementStateException>(() => element.Clear());
        }

        [Test]
        [IgnoreBrowser(Browser.Opera, "Untested feature")]
        public void TextAreaShouldNotClearWhenReadOnly()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("textAreaReadOnly"));
            Assert.Throws<InvalidElementStateException>(() => element.Clear());
        }

        [Test]
        public void ContentEditableAreaShouldClear()
        {
            driver.Url = readOnlyPage;
            IWebElement element = driver.FindElement(By.Id("content-editable"));
            element.Clear();
            Assert.AreEqual(string.Empty, element.Text);
        }

        [Test]
        public void ShouldBeAbleToClearNoTypeInput()
        {
            ShouldBeAbleToClearInput(By.Name("no_type"), "input with no type");
        }

        [Test]
        public void ShouldBeAbleToClearNumberInput()
        {
            ShouldBeAbleToClearInput(By.Name("number_input"), "42");
        }

        [Test]
        public void ShouldBeAbleToClearEmailInput()
        {
            ShouldBeAbleToClearInput(By.Name("email_input"), "admin@localhost");
        }

        [Test]
        public void ShouldBeAbleToClearPasswordInput()
        {
            ShouldBeAbleToClearInput(By.Name("password_input"), "qwerty");
        }

        [Test]
        public void ShouldBeAbleToClearSearchInput()
        {
            ShouldBeAbleToClearInput(By.Name("search_input"), "search");
        }

        [Test]
        public void ShouldBeAbleToClearTelInput()
        {
            ShouldBeAbleToClearInput(By.Name("tel_input"), "911");
        }

        [Test]
        public void ShouldBeAbleToClearTextInput()
        {
            ShouldBeAbleToClearInput(By.Name("text_input"), "text input");
        }

        [Test]
        public void ShouldBeAbleToClearUrlInput()
        {
            ShouldBeAbleToClearInput(By.Name("url_input"), "http://seleniumhq.org/");
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.Firefox)]
        [IgnoreBrowser(Browser.IE)]
        [IgnoreBrowser(Browser.Safari)]
        public void ShouldBeAbleToClearRangeInput()
        {
            ShouldBeAbleToClearInput(By.Name("range_input"), "42");
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.Firefox)]
        [IgnoreBrowser(Browser.IE)]
        [IgnoreBrowser(Browser.Safari)]
        public void ShouldBeAbleToClearCheckboxInput()
        {
            ShouldBeAbleToClearInput(By.Name("checkbox_input"), "Checkbox");
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.Firefox)]
        [IgnoreBrowser(Browser.Safari)]
        public void ShouldBeAbleToClearColorInput()
        {
            ShouldBeAbleToClearInput(By.Name("color_input"), "#00ffff");
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
        public void ShouldBeAbleToClearDateInput()
        {
            ShouldBeAbleToClearInput(By.Name("date_input"), "2017-11-22");
        }

        [Test]
        public void shouldBeAbleToClearDatetimeInput()
        {
            ShouldBeAbleToClearInput(By.Name("datetime_input"), "2017-11-22T11:22");
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
        public void ShouldBeAbleToClearDatetimeLocalInput()
        {
            ShouldBeAbleToClearInput(By.Name("datetime_local_input"), "2017-11-22T11:22");
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
        public void ShouldBeAbleToClearTimeInput()
        {
            ShouldBeAbleToClearInput(By.Name("time_input"), "11:22");
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
        public void ShouldBeAbleToClearMonthInput()
        {
            ShouldBeAbleToClearInput(By.Name("month_input"), "2017-11");
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
        public void ShouldBeAbleToClearWeekInput()
        {
            ShouldBeAbleToClearInput(By.Name("week_input"), "2017-W47");
        }

        private void ShouldBeAbleToClearInput(By locator, string oldValue)
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("inputs.html");
            IWebElement element = driver.FindElement(locator);
            Assert.AreEqual(oldValue, element.GetAttribute("value"));
            element.Clear();
            Assert.AreEqual("", element.GetAttribute("value"));
        }
    }
}
