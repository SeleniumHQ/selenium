using System;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class PageLoadingTest : DriverTestFixture
    {
        private IWebDriver localDriver;

        [SetUp]
        public void RestartOriginalDriver()
        {
            driver = EnvironmentManager.Instance.GetCurrentDriver();
        }

        [TearDown]
        public void QuitAdditionalDriver()
        {
            if (localDriver != null)
            {
                localDriver.Quit();
                localDriver = null;
            }
        }

        [Test]
        public void NoneStrategyShouldNotWaitForPageToLoad()
        {
            InitLocalDriver(PageLoadStrategy.None);

            string slowPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("sleep?time=5");

            DateTime start = DateTime.Now;
            localDriver.Url = slowPage;
            DateTime end = DateTime.Now;

            TimeSpan duration = end - start;
            // The slow loading resource on that page takes 6 seconds to return,
            // but with 'none' page loading strategy 'get' operation should not wait.
            Assert.That(duration.TotalMilliseconds, Is.LessThan(1000), "Took too long to load page: " + duration.TotalMilliseconds);
        }


        [Test]
        public void NoneStrategyShouldNotWaitForPageToRefresh()
        {
            InitLocalDriver(PageLoadStrategy.None);

            string slowPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("sleep?time=5");

            // We discard the element, but want a check to make sure the page is loaded
            WaitFor(() => localDriver.FindElement(By.TagName("body")), TimeSpan.FromSeconds(10), "did not find body");

            DateTime start = DateTime.Now;
            localDriver.Navigate().Refresh();
            DateTime end = DateTime.Now;

            TimeSpan duration = end - start;
            // The slow loading resource on that page takes 6 seconds to return,
            // but with 'none' page loading strategy 'refresh' operation should not wait.
            Assert.That(duration.TotalMilliseconds, Is.LessThan(1000), "Took too long to load page: " + duration.TotalMilliseconds);
        }

        [Test]
        [IgnoreBrowser(Browser.Edge, "Edge driver does not support eager page load strategy")]
        public void EagerStrategyShouldNotWaitForResources()
        {
            InitLocalDriver(PageLoadStrategy.Eager);

            string slowPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("slowLoadingResourcePage.html");

            DateTime start = DateTime.Now;
            localDriver.Url = slowPage;
            // We discard the element, but want a check to make sure the GET actually
            // completed.
            WaitFor(() => localDriver.FindElement(By.Id("peas")), TimeSpan.FromSeconds(10), "did not find element");
            DateTime end = DateTime.Now;

            // The slow loading resource on that page takes 6 seconds to return. If we
            // waited for it, our load time should be over 6 seconds.
            TimeSpan duration = end - start;
            Assert.That(duration.TotalMilliseconds, Is.LessThan(5 * 1000), "Took too long to load page: " + duration.TotalMilliseconds);
        }

        [Test]
        [IgnoreBrowser(Browser.Edge, "Edge driver does not support eager page load strategy")]
        public void EagerStrategyShouldNotWaitForResourcesOnRefresh()
        {
            InitLocalDriver(PageLoadStrategy.Eager);

            string slowPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("slowLoadingResourcePage.html");
            localDriver.Url = slowPage;

            // We discard the element, but want a check to make sure the GET actually
            // completed.
            WaitFor(() => localDriver.FindElement(By.Id("peas")), TimeSpan.FromSeconds(10), "did not find element");

            DateTime start = DateTime.Now;
            localDriver.Navigate().Refresh();
            // We discard the element, but want a check to make sure the GET actually
            // completed.
            WaitFor(() => localDriver.FindElement(By.Id("peas")), TimeSpan.FromSeconds(10), "did not find element");
            DateTime end = DateTime.Now;

            // The slow loading resource on that page takes 6 seconds to return. If we
            // waited for it, our load time should be over 6 seconds.
            TimeSpan duration = end - start;
            Assert.That(duration.TotalMilliseconds, Is.LessThan(5 * 1000), "Took too long to load page: " + duration.TotalMilliseconds);
        }

        [Test]
        [IgnoreBrowser(Browser.Edge, "Edge driver does not support eager page load strategy")]
        public void EagerStrategyShouldWaitForDocumentToBeLoaded()
        {
            InitLocalDriver(PageLoadStrategy.Eager);

            string slowPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("sleep?time=3");

            localDriver.Url = slowPage;

            // We discard the element, but want a check to make sure the GET actually completed.
            WaitFor(() => localDriver.FindElement(By.TagName("body")), TimeSpan.FromSeconds(10), "did not find body");
        }

        [Test]
        public void NormalStrategyShouldWaitForDocumentToBeLoaded()
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
        [IgnoreBrowser(Browser.Firefox, "Browser doesn't see subsequent navigation to a fragment as a new navigation.")]
        public void ShouldBeAbleToGetAFragmentOnTheCurrentPage()
        {
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
        [NeedsFreshDriver(IsCreatedBeforeTest = true)]
        public void ShouldThrowIfUrlIsMalformed()
        {
            Assert.That(() => driver.Url = "www.test.com", Throws.InstanceOf<WebDriverException>());
        }

        [Test]
        [NeedsFreshDriver(IsCreatedBeforeTest = true)]
        public void ShouldThrowIfUrlIsMalformedInPortPart()
        {
            Assert.That(() => driver.Url = "http://localhost:30001bla", Throws.InstanceOf<WebDriverException>());
        }

        [Test]
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
        [NeedsFreshDriver(IsCreatedBeforeTest = true)]
        public void ShouldDoNothingIfThereIsNothingToGoBackTo()
        {
            string originalTitle = driver.Title;
            driver.Url = formsPage;

            driver.Navigate().Back();
            // We may have returned to the browser's home page
            string currentTitle = driver.Title;
            Assert.That(currentTitle, Is.EqualTo(originalTitle).Or.EqualTo("We Leave From Here"));
            if (driver.Title == originalTitle)
            {
                driver.Navigate().Back();
                Assert.AreEqual(originalTitle, driver.Title);
            }
        }

        [Test]
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

        [Test]
        [IgnoreBrowser(Browser.IE, "Browser does not support using insecure SSL certs")]
        [IgnoreBrowser(Browser.Safari, "Browser does not support using insecure SSL certs")]
        [IgnoreBrowser(Browser.EdgeLegacy, "Browser does not support using insecure SSL certs")]
        public void ShouldBeAbleToAccessPagesWithAnInsecureSslCertificate()
        {
            String url = EnvironmentManager.Instance.UrlBuilder.WhereIsSecure("simpleTest.html");
            driver.Url = url;

            // This should work
            Assert.AreEqual(driver.Title, "Hello WebDriver");
        }

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
        [IgnoreBrowser(Browser.IE, "Browser does, in fact, hang in this case.")]
        [IgnoreBrowser(Browser.Firefox, "Browser does, in fact, hang in this case.")]
        public void ShouldNotHangIfDocumentOpenCallIsNeverFollowedByDocumentCloseCall()
        {
            driver.Url = documentWrite;

            // If this command succeeds, then all is well.
            driver.FindElement(By.XPath("//body"));
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        public void PageLoadTimeoutCanBeChanged()
        {
            TestPageLoadTimeoutIsEnforced(2);
            TestPageLoadTimeoutIsEnforced(3);
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        public void CanHandleSequentialPageLoadTimeouts()
        {
            long pageLoadTimeout = 2;
            long pageLoadTimeBuffer = 10;
            string slowLoadingPageUrl = EnvironmentManager.Instance.UrlBuilder.WhereIs("sleep?time=" + (pageLoadTimeout + pageLoadTimeBuffer));
            driver.Manage().Timeouts().PageLoad = TimeSpan.FromSeconds(2);
            AssertPageLoadTimeoutIsEnforced(() => driver.Url = slowLoadingPageUrl, pageLoadTimeout, pageLoadTimeBuffer);
            AssertPageLoadTimeoutIsEnforced(() => driver.Url = slowLoadingPageUrl, pageLoadTimeout, pageLoadTimeBuffer);
        }

        [Test]
        [IgnoreBrowser(Browser.Opera, "Not implemented for browser")]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        public void ShouldTimeoutIfAPageTakesTooLongToLoad()
        {
            try
            {
                TestPageLoadTimeoutIsEnforced(2);
            }
            finally
            {
                driver.Manage().Timeouts().PageLoad = TimeSpan.FromSeconds(300);
            }

            // Load another page after get() timed out but before test HTTP server served previous page.
            driver.Url = xhtmlTestPage;
            WaitFor(TitleToBeEqualTo("XHTML Test Page"), "Title was not expected value");
        }

        [Test]
        [IgnoreBrowser(Browser.Opera, "Not implemented for browser")]
        [IgnoreBrowser(Browser.EdgeLegacy, "Not implemented for browser")]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        public void ShouldTimeoutIfAPageTakesTooLongToLoadAfterClick()
        {
            driver.Manage().Timeouts().PageLoad = TimeSpan.FromSeconds(2);

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("page_with_link_to_slow_loading_page.html");
            IWebElement link = WaitFor(() => driver.FindElement(By.Id("link-to-slow-loading-page")), "Could not find link");

            try
            {
                AssertPageLoadTimeoutIsEnforced(() => link.Click(), 2, 3);
            }
            finally
            {
                driver.Manage().Timeouts().PageLoad = TimeSpan.FromSeconds(300);
            }

            // Load another page after get() timed out but before test HTTP server served previous page.
            driver.Url = xhtmlTestPage;
            WaitFor(TitleToBeEqualTo("XHTML Test Page"), "Title was not expected value");
        }

        [Test]
        [IgnoreBrowser(Browser.Opera, "Not implemented for browser")]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        public void ShouldTimeoutIfAPageTakesTooLongToRefresh()
        {
            // Get the sleeping servlet with a pause of 5 seconds
            long pageLoadTimeout = 2;
            long pageLoadTimeBuffer = 0;
            string slowLoadingPageUrl = EnvironmentManager.Instance.UrlBuilder.WhereIs("sleep?time=" + (pageLoadTimeout + pageLoadTimeBuffer));
            driver.Url = slowLoadingPageUrl;

            driver.Manage().Timeouts().PageLoad = TimeSpan.FromSeconds(2);

            try
            {
                AssertPageLoadTimeoutIsEnforced(() => driver.Navigate().Refresh(), 2, 4);
            }
            finally
            {
                driver.Manage().Timeouts().PageLoad = TimeSpan.FromSeconds(300);
            }

            // Load another page after get() timed out but before test HTTP server served previous page.
            driver.Url = xhtmlTestPage;
            WaitFor(TitleToBeEqualTo("XHTML Test Page"), "Title was not expected value");
        }

        [Test]
        [IgnoreBrowser(Browser.EdgeLegacy, "Test hangs browser.")]
        [IgnoreBrowser(Browser.Chrome, "Chrome driver does, in fact, stop loading page after a timeout.")]
        [IgnoreBrowser(Browser.Edge, "Edge driver does, in fact, stop loading page after a timeout.")]
        [IgnoreBrowser(Browser.Opera, "Not implemented for browser")]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        public void ShouldNotStopLoadingPageAfterTimeout()
        {
            try
            {
                TestPageLoadTimeoutIsEnforced(1);
            }
            finally
            {
                driver.Manage().Timeouts().PageLoad = TimeSpan.FromSeconds(300);
            }

            WaitFor(() =>
            {
                try
                {
                    string text = driver.FindElement(By.TagName("body")).Text;
                    return text.Contains("Slept for 11s");
                }
                catch (NoSuchElementException)
                {
                }
                catch (StaleElementReferenceException)
                {
                }
                return false;
            }, TimeSpan.FromSeconds(30), "Did not find expected text");
        }

        private Func<bool> TitleToBeEqualTo(string expectedTitle)
        {
            return () => { return driver.Title == expectedTitle; };
        }

        /**
         * Sets given pageLoadTimeout to the {@link #driver} and asserts that attempt to navigate to a
         * page that takes much longer (10 seconds longer) to load results in a TimeoutException.
         * <p>
         * Side effects: 1) {@link #driver} is configured to use given pageLoadTimeout,
         * 2) test HTTP server still didn't serve the page to browser (some browsers may still
         * be waiting for the page to load despite the fact that driver responded with the timeout).
         */
        private void TestPageLoadTimeoutIsEnforced(long webDriverPageLoadTimeoutInSeconds)
        {
            // Test page will load this many seconds longer than WD pageLoadTimeout.
            long pageLoadTimeBufferInSeconds = 10;
            string slowLoadingPageUrl = EnvironmentManager.Instance.UrlBuilder.WhereIs("sleep?time=" + (webDriverPageLoadTimeoutInSeconds + pageLoadTimeBufferInSeconds));
            driver.Manage().Timeouts().PageLoad = TimeSpan.FromSeconds(webDriverPageLoadTimeoutInSeconds);
            AssertPageLoadTimeoutIsEnforced(() => driver.Url = slowLoadingPageUrl, webDriverPageLoadTimeoutInSeconds, pageLoadTimeBufferInSeconds);
        }

        private void AssertPageLoadTimeoutIsEnforced(TestDelegate delegateToTest, long webDriverPageLoadTimeoutInSeconds, long pageLoadTimeBufferInSeconds)
        {
            DateTime start = DateTime.Now;
            Assert.That(delegateToTest, Throws.InstanceOf<WebDriverTimeoutException>(), "I should have timed out after " + webDriverPageLoadTimeoutInSeconds + " seconds");
            DateTime end = DateTime.Now;
            TimeSpan duration = end - start;
            Assert.That(duration.TotalSeconds, Is.GreaterThan(webDriverPageLoadTimeoutInSeconds));
            Assert.That(duration.TotalSeconds, Is.LessThan(webDriverPageLoadTimeoutInSeconds + pageLoadTimeBufferInSeconds));
        }

        private void InitLocalDriver(PageLoadStrategy strategy)
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            if (localDriver != null)
            {
                localDriver.Quit();
            }

            PageLoadStrategyOptions options = new PageLoadStrategyOptions();
            options.PageLoadStrategy = strategy;
            localDriver = EnvironmentManager.Instance.CreateDriverInstance(options);
        }

        private class PageLoadStrategyOptions : DriverOptions
        {
            [Obsolete]
            public override void AddAdditionalCapability(string capabilityName, object capabilityValue)
            {
            }

            public override ICapabilities ToCapabilities()
            {
                return null;
            }
        }
    }
}
