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
        [IgnoreBrowser(Browser.Edge, "Edge allows addition of cookie on text pages")]
        [IgnoreBrowser(Browser.Firefox, "Firefox allows addition of cookie on text pages")]
        [IgnoreBrowser(Browser.EdgeLegacy, "Edge allows addition of cookie on text pages")]
        [IgnoreBrowser(Browser.Safari, "Safari allows addition of cookie on text pages")]
        [IgnoreBrowser(Browser.Opera, "Opera allows addition of cookie on text pages")]
        public void ShouldThrowExceptionWhenAddingCookieToAPageThatIsNotHtml()
        {
            driver.Url = textPage;

            Cookie cookie = new Cookie("hello", "goodbye");
            Assert.That(() => driver.Manage().Cookies.AddCookie(cookie), Throws.InstanceOf<WebDriverException>());
        }

        //------------------------------------------------------------------
        // Tests below here are not included in the Java test suite
        //------------------------------------------------------------------
        [Test]
        public void FindingAnElementOnAPlainTextPageWillNeverWork()
        {
            driver.Url = textPage;
            Assert.That(() => driver.FindElement(By.Id("foo")), Throws.InstanceOf<NoSuchElementException>());
        }
    }
}
