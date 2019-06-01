using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class I18Test : DriverTestFixture
    {
        // The Hebrew word shalom (peace) encoded in order Shin (sh) Lamed (L) Vav (O) final-Mem (M).
        private string shalom = "\u05E9\u05DC\u05D5\u05DD";

        // The Hebrew word tmunot (images) encoded in order Taf (t) Mem (m) Vav (u) Nun (n) Vav (o) Taf (t).
        private string tmunot = "\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA";

        // This is the Chinese link text
        private string linkText = "\u4E2D\u56FD\u4E4B\u58F0";

        [Test]
        public void ShouldBeAbleToReadChinese()
        {
            driver.Url = chinesePage;
            driver.FindElement(By.LinkText(linkText)).Click();
        }

        [Test]
        public void ShouldBeAbleToEnterHebrewTextFromLeftToRight()
        {
            driver.Url = chinesePage;
            IWebElement input = driver.FindElement(By.Name("i18n"));

            input.SendKeys(shalom);

            Assert.AreEqual(shalom, input.GetAttribute("value"));
        }

        [Test]
        public void ShouldBeAbleToEnterHebrewTextFromRightToLeft()
        {
            driver.Url = chinesePage;
            IWebElement input = driver.FindElement(By.Name("i18n"));

            input.SendKeys(tmunot);

            Assert.AreEqual(tmunot, input.GetAttribute("value"));
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "ChromeDriver only supports characters in the BMP")]
        [IgnoreBrowser(Browser.Edge, "EdgeDriver only supports characters in the BMP")]
        public void ShouldBeAbleToEnterSupplementaryCharacters()
        {
            if (TestUtilities.IsOldIE(driver))
            {
                // IE: versions less thank 10 have issue 5069
                return;
            }

            driver.Url = chinesePage;

            string input = string.Empty;
            input += char.ConvertFromUtf32(0x20000);
            input += char.ConvertFromUtf32(0x2070E);
            input += char.ConvertFromUtf32(0x2000B);
            input += char.ConvertFromUtf32(0x2A190);
            input += char.ConvertFromUtf32(0x2A6B2);

            IWebElement el = driver.FindElement(By.Name("i18n"));
            el.SendKeys(input);

            Assert.AreEqual(input, el.GetAttribute("value"));
        }

        [Test]
        [NeedsFreshDriver(IsCreatedBeforeTest = true)]
        public void ShouldBeAbleToReturnTheTextInAPage()
        {
            string url = EnvironmentManager.Instance.UrlBuilder.WhereIs("encoding");
            driver.Url = url;

            string text = driver.FindElement(By.TagName("body")).Text;

            Assert.AreEqual(shalom, text);
        }
    }
}
