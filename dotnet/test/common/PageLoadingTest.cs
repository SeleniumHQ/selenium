using System;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class PageLoadingTest : DriverTestFixture
    {
        [Test]
        public void ShouldWaitForDocumentToBeLoaded()
        {
            driver.Url = simpleTestPage;

            Assert.AreEqual(driver.Title, "Hello WebDriver");
        }

        [Test]
        public void ShouldFollowRedirectsSentInTheHttpResponseHeaders()
        {
            driver.Url = redirectPage;
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        [Test]
        public void ShouldFollowMetaRedirects()
        {
            driver.Url = metaRedirectPage;
            WaitFor(() => { return driver.Title == "We Arrive Here"; }, "Browser title was not 'We Arrive Here'");
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        [Test]
        public void ShouldBeAbleToGetAFragmentOnTheCurrentPage()
        {
            if (TestUtilities.IsMarionette(driver))
            {
                // Don't run this test on Marionette.
                Assert.Ignore("Marionette doesn't see subsequent navigation to a fragment as a new navigation.");
            }

            driver.Url = xhtmlTestPage;
            driver.Url = xhtmlTestPage + "#text";
            driver.FindElement(By.Id("id1"));
        }

        [Test]
        public void ShouldReturnWhenGettingAUrlThatDoesNotResolve()
        {
            try
            {
                // Of course, we're up the creek if this ever does get registered
                driver.Url = "http://www.thisurldoesnotexist.comx/";
            }
            catch (Exception e)
            {
                if (!IsIeDriverTimedOutException(e))
                {
                    throw e;
                }
            }
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "IE happily will navigate to invalid URLs")]
        [IgnoreBrowser(Browser.IPhone)]
        public void ShouldThrowIfUrlIsMalformed()
        {
            if (TestUtilities.IsMarionette(driver))
            {
                // Don't run this test on Marionette.
                Assert.Ignore("Browser hangs when executed via Marionette");
            }

            driver.Url = "www.test.com";
        }

        [Test]
        [IgnoreBrowser(Browser.IPhone)]
        public void ShouldReturnWhenGettingAUrlThatDoesNotConnect()
        {
            // Here's hoping that there's nothing here. There shouldn't be
            driver.Url = "http://localhost:3001";
        }

        [Test]
        public void ShouldReturnUrlOnNotExistedPage()
        {
            string url = EnvironmentManager.Instance.UrlBuilder.WhereIs("not_existed_page.html");
            driver.Url = url;
            Assert.AreEqual(url, driver.Url);
        }

        [Test]
        public void ShouldBeAbleToLoadAPageWithFramesetsAndWaitUntilAllFramesAreLoaded()
        {
            driver.Url = framesetPage;

            driver.SwitchTo().Frame(0);
            IWebElement pageNumber = driver.FindElement(By.XPath("//span[@id='pageNumber']"));
            Assert.AreEqual(pageNumber.Text.Trim(), "1");

            driver.SwitchTo().DefaultContent().SwitchTo().Frame(1);
            pageNumber = driver.FindElement(By.XPath("//span[@id='pageNumber']"));
            Assert.AreEqual(pageNumber.Text.Trim(), "2");
        }

        [Test]
        [IgnoreBrowser(Browser.IPhone)]
        [NeedsFreshDriver(IsCreatedBeforeTest = true)]
        public void ShouldDoNothingIfThereIsNothingToGoBackTo()
        {
            string originalTitle = driver.Title;
            driver.Url = formsPage;

            driver.Navigate().Back();
            // We may have returned to the browser's home page
            string currentTitle = driver.Title;
            Assert.IsTrue(currentTitle == originalTitle || currentTitle == "We Leave From Here", "title is " + currentTitle);
            if (driver.Title == originalTitle)
            {
                driver.Navigate().Back();
                Assert.AreEqual(originalTitle, driver.Title);
            }
        }

        [Test]
        [IgnoreBrowser(Browser.Android)]
        public void ShouldBeAbleToNavigateBackInTheBrowserHistory()
        {
            driver.Url = formsPage;

            driver.FindElement(By.Id("imageButton")).Submit();
            WaitFor(TitleToBeEqualTo("We Arrive Here"), "Browser title was not 'We Arrive Here'");
            Assert.AreEqual(driver.Title, "We Arrive Here");

            driver.Navigate().Back();
            WaitFor(TitleToBeEqualTo("We Leave From Here"), "Browser title was not 'We Leave From Here'");
            Assert.AreEqual(driver.Title, "We Leave From Here");
        }

        [Test]
        public void ShouldBeAbleToNavigateBackInTheBrowserHistoryInPresenceOfIframes()
        {
            driver.Url = xhtmlTestPage;

            driver.FindElement(By.Name("sameWindow")).Click();
            WaitFor(TitleToBeEqualTo("This page has iframes"), "Browser title was not 'This page has iframes'");
            Assert.AreEqual(driver.Title, "This page has iframes");

            driver.Navigate().Back();
            WaitFor(TitleToBeEqualTo("XHTML Test Page"), "Browser title was not 'XHTML Test Page'");
            Assert.AreEqual(driver.Title, "XHTML Test Page");
        }

        [Test]
        [IgnoreBrowser(Browser.Android)]
        public void ShouldBeAbleToNavigateForwardsInTheBrowserHistory()
        {
            driver.Url = formsPage;

            driver.FindElement(By.Id("imageButton")).Submit();
            WaitFor(TitleToBeEqualTo("We Arrive Here"), "Browser title was not 'We Arrive Here'");
            Assert.AreEqual(driver.Title, "We Arrive Here");

            driver.Navigate().Back();
            WaitFor(TitleToBeEqualTo("We Leave From Here"), "Browser title was not 'We Leave From Here'");
            Assert.AreEqual(driver.Title, "We Leave From Here");

            driver.Navigate().Forward();
            WaitFor(TitleToBeEqualTo("We Arrive Here"), "Browser title was not 'We Arrive Here'");
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        //TODO (jimevan): Implement SSL secure http function
        //[Test]
        //[IgnoreBrowser(Browser.Chrome)]
        //[IgnoreBrowser(Browser.IE)]
        //public void ShouldBeAbleToAccessPagesWithAnInsecureSslCertificate()
        //{
        //    String url = GlobalTestEnvironment.get().getAppServer().whereIsSecure("simpleTest.html");
        //    driver.Url = url;

        //    // This should work
        //    Assert.AreEqual(driver.Title, "Hello WebDriver");
        //}

        [Test]
        public void ShouldBeAbleToRefreshAPage()
        {
            driver.Url = xhtmlTestPage;

            driver.Navigate().Refresh();

            Assert.AreEqual(driver.Title, "XHTML Test Page");
        }

        /// <summary>
        /// see <a href="http://code.google.com/p/selenium/issues/detail?id=208">Issue 208</a>
        /// </summary>
        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IE, "Browser does, in fact, hang in this case.")]
        [IgnoreBrowser(Browser.IPhone, "Untested user-agent")]
        public void ShouldNotHangIfDocumentOpenCallIsNeverFollowedByDocumentCloseCall()
        {
            if (TestUtilities.IsMarionette(driver))
            {
                // Don't run this test on Marionette.
                Assert.Ignore("Browser hangs when executed via Marionette");
            }

            driver.Url = documentWrite;

            // If this command succeeds, then all is well.
            driver.FindElement(By.XPath("//body"));
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Not implemented for browser")]
        [IgnoreBrowser(Browser.Chrome, "Not implemented for browser")]
        [IgnoreBrowser(Browser.HtmlUnit, "Not implemented for browser")]
        [IgnoreBrowser(Browser.IPhone, "Not implemented for browser")]
        [IgnoreBrowser(Browser.PhantomJS, "Not implemented for browser")]
        [IgnoreBrowser(Browser.Opera, "Not implemented for browser")]
        public void ShouldTimeoutIfAPageTakesTooLongToLoad()
        {
            if (TestUtilities.IsMarionette(driver))
            {
                // Don't run this test on Marionette.
                Assert.Ignore("Driver does not return control from timeout wait when executed via Marionette");
            }

            driver.Manage().Timeouts().PageLoad = TimeSpan.FromSeconds(2);

            try
            {
                // Get the sleeping servlet with a pause of 5 seconds
                string slowPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("sleep?time=5");

                driver.Url = slowPage;

                Assert.Fail("I should have timed out");
            }
            catch (WebDriverTimeoutException)
            {
            }
            finally
            {
                driver.Manage().Timeouts().PageLoad = TimeSpan.MinValue;
            }
        }

        private Func<bool> TitleToBeEqualTo(string expectedTitle)
        {
            return () => { return driver.Title == expectedTitle; };
        }
    }
}
