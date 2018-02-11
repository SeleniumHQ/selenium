using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class TextPagesTest : DriverTestFixture
    {
        private string textPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("plain.txt");

        [Test]
        [IgnoreBrowser(Browser.IE, "IE renders plain text pages as HTML with <pre> tags.")]
        [IgnoreBrowser(Browser.Firefox, "Firefox renders plain text pages as HTML with <pre> tags.")]
        [IgnoreBrowser(Browser.Chrome, "Chrome renders plain text pages as HTML with <pre> tags.")]
        [IgnoreBrowser(Browser.PhantomJS, "PhantomJS renders plain text pages as HTML with <pre> tags.")]
        [IgnoreBrowser(Browser.Safari, "Safari renders plain text pages as HTML with <pre> tags.")]
        [IgnoreBrowser(Browser.IPhone, "iPhone renders plain text pages as HTML with <pre> tags.")]
        [IgnoreBrowser(Browser.Opera, "Opera renders plain text pages as HTML with <pre> tags.")]
        [IgnoreBrowser(Browser.Android, "Android renders plain text pages as HTML with <pre> tags.")]
        public void ShouldBeAbleToLoadASimplePageOfText()
        {
            driver.Url = textPage;
            string source = driver.PageSource;
            Assert.AreEqual("Test", source);
        }

        [Test]
        public void FindingAnElementOnAPlainTextPageWillNeverWork()
        {
            driver.Url = textPage;
            Assert.Throws<NoSuchElementException>(() => driver.FindElement(By.Id("foo")));
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "IE allows addition of cookie on text pages")]
        [IgnoreBrowser(Browser.Chrome, "Chrome allows addition of cookie on text pages")]
        [IgnoreBrowser(Browser.PhantomJS, "PhantomJS allows addition of cookie on text pages")]
        [IgnoreBrowser(Browser.Safari, "Safari allows addition of cookie on text pages")]
        [IgnoreBrowser(Browser.IPhone, "iPhone allows addition of cookie on text pages")]
        [IgnoreBrowser(Browser.Opera, "Opera allows addition of cookie on text pages")]
        [IgnoreBrowser(Browser.Android, "Android allows addition of cookie on text pages")]
        public void ShouldThrowExceptionWhenAddingCookieToAPageThatIsNotHtml()
        {
            driver.Url = textPage;

            Cookie cookie = new Cookie("hello", "goodbye");
            Assert.Throws<WebDriverException>(() => driver.Manage().Cookies.AddCookie(cookie));
        }
    }
}
