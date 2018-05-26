using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class TextPagesTest : DriverTestFixture
    {
        private string textPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("plain.txt");

        [Test]
        public void ShouldBeAbleToLoadASimplePageOfText()
        {
            driver.Url = textPage;
            string source = driver.PageSource;
            Assert.That(source, Does.Contain("Test"));
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "IE allows addition of cookie on text pages")]
        [IgnoreBrowser(Browser.Chrome, "Chrome allows addition of cookie on text pages")]
        [IgnoreBrowser(Browser.Firefox, "Firefox allows addition of cookie on text pages")]
        [IgnoreBrowser(Browser.Safari, "Safari allows addition of cookie on text pages")]
        [IgnoreBrowser(Browser.Opera, "Opera allows addition of cookie on text pages")]
        public void ShouldThrowExceptionWhenAddingCookieToAPageThatIsNotHtml()
        {
            driver.Url = textPage;

            Cookie cookie = new Cookie("hello", "goodbye");
            Assert.Throws<WebDriverException>(() => driver.Manage().Cookies.AddCookie(cookie));
        }

        //------------------------------------------------------------------
        // Tests below here are not included in the Java test suite
        //------------------------------------------------------------------
        [Test]
        public void FindingAnElementOnAPlainTextPageWillNeverWork()
        {
            driver.Url = textPage;
            Assert.Throws<NoSuchElementException>(() => driver.FindElement(By.Id("foo")));
        }
    }
}
