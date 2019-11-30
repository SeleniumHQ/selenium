using System;
using System.Collections.ObjectModel;
using System.Text.RegularExpressions;
using NUnit.Framework;
using OpenQA.Selenium.Environment;
using System.Text;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class CookieImplementationTest : DriverTestFixture
    {
        private Random random = new Random();
        private bool isOnAlternativeHostName;
        private string hostname;
  

        [SetUp]
        public void GoToSimplePageAndDeleteCookies()
        {
            GotoValidDomainAndClearCookies("animals");
            AssertNoCookiesArePresent();
        }

        [Test]
        public void ShouldGetCookieByName()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            string key = string.Format("key_{0}", new Random().Next());
            ((IJavaScriptExecutor)driver).ExecuteScript("document.cookie = arguments[0] + '=set';", key);

            Cookie cookie = driver.Manage().Cookies.GetCookieNamed(key);
            Assert.AreEqual("set", cookie.Value);
        }

        [Test]
        public void ShouldBeAbleToAddCookie()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            string key = GenerateUniqueKey();
            string value = "foo";
            Cookie cookie = new Cookie(key, value);
            AssertCookieIsNotPresentWithName(key);

            driver.Manage().Cookies.AddCookie(cookie);

            AssertCookieHasValue(key, value);
            Assert.That(driver.Manage().Cookies.AllCookies.Contains(cookie), "Cookie was not added successfully");
        }

        [Test]
        public void GetAllCookies()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            string key1 = GenerateUniqueKey();
            string key2 = GenerateUniqueKey();

            AssertCookieIsNotPresentWithName(key1);
            AssertCookieIsNotPresentWithName(key2);
            
            ReadOnlyCollection<Cookie> cookies = driver.Manage().Cookies.AllCookies;
            int count = cookies.Count;

            Cookie one = new Cookie(key1, "value");
            Cookie two = new Cookie(key2, "value");

            driver.Manage().Cookies.AddCookie(one);
            driver.Manage().Cookies.AddCookie(two);

            driver.Url = simpleTestPage;
            cookies = driver.Manage().Cookies.AllCookies;
            Assert.AreEqual(count + 2, cookies.Count);

            Assert.That(cookies, Does.Contain(one));
            Assert.That(cookies, Does.Contain(two));
        }

        [Test]
        public void DeleteAllCookies()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            ((IJavaScriptExecutor)driver).ExecuteScript("document.cookie = 'foo=set';");
            AssertSomeCookiesArePresent();

            driver.Manage().Cookies.DeleteAllCookies();

            AssertNoCookiesArePresent();
        }

        [Test]
        public void DeleteCookieWithName()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            string key1 = GenerateUniqueKey();
            string key2 = GenerateUniqueKey();

            ((IJavaScriptExecutor)driver).ExecuteScript("document.cookie = arguments[0] + '=set';", key1);
            ((IJavaScriptExecutor)driver).ExecuteScript("document.cookie = arguments[0] + '=set';", key2);

            AssertCookieIsPresentWithName(key1);
            AssertCookieIsPresentWithName(key2);

            driver.Manage().Cookies.DeleteCookieNamed(key1);

            AssertCookieIsNotPresentWithName(key1);
            AssertCookieIsPresentWithName(key2);
        }

        [Test]
        public void ShouldNotDeleteCookiesWithASimilarName()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            string cookieOneName = "fish";
            Cookie cookie1 = new Cookie(cookieOneName, "cod");
            Cookie cookie2 = new Cookie(cookieOneName + "x", "earth");
            IOptions options = driver.Manage();
            AssertCookieIsNotPresentWithName(cookie1.Name);
  
            options.Cookies.AddCookie(cookie1);
            options.Cookies.AddCookie(cookie2);

            AssertCookieIsPresentWithName(cookie1.Name);
   
            options.Cookies.DeleteCookieNamed(cookieOneName);

            Assert.That(driver.Manage().Cookies.AllCookies, Does.Not.Contain(cookie1));
            Assert.That(driver.Manage().Cookies.AllCookies, Does.Contain(cookie2));
        }

        [Test]
        public void AddCookiesWithDifferentPathsThatAreRelatedToOurs()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            string basePath = EnvironmentManager.Instance.UrlBuilder.Path;

            Cookie cookie1 = new Cookie("fish", "cod", "/" + basePath + "/animals");
            Cookie cookie2 = new Cookie("planet", "earth", "/" + basePath + "/");
            IOptions options = driver.Manage();
            options.Cookies.AddCookie(cookie1);
            options.Cookies.AddCookie(cookie2);

            UrlBuilder builder = EnvironmentManager.Instance.UrlBuilder;
            driver.Url = builder.WhereIs("animals");

            ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
            AssertCookieIsPresentWithName(cookie1.Name);
            AssertCookieIsPresentWithName(cookie2.Name);

            driver.Url = builder.WhereIs("simpleTest.html");
            AssertCookieIsNotPresentWithName(cookie1.Name);
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Chrome does not retrieve cookies when in frame.")]
        [IgnoreBrowser(Browser.Edge, "Edge does not retrieve cookies when in frame.")]
        public void GetCookiesInAFrame()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("animals");
            Cookie cookie1 = new Cookie("fish", "cod", "/common/animals");
            driver.Manage().Cookies.AddCookie(cookie1);

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("frameWithAnimals.html");
            AssertCookieIsNotPresentWithName(cookie1.Name);

            driver.SwitchTo().Frame("iframe1");
            AssertCookieIsPresentWithName(cookie1.Name);
        }

        [Test]
        [IgnoreBrowser(Browser.Opera)]
        public void CannotGetCookiesWithPathDifferingOnlyInCase()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            string cookieName = "fish";
            driver.Manage().Cookies.AddCookie(new Cookie(cookieName, "cod", "/Common/animals"));

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("animals");
            Assert.That(driver.Manage().Cookies.GetCookieNamed(cookieName), Is.Null);
        }

        [Test]
        public void ShouldNotGetCookieOnDifferentDomain()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            string cookieName = "fish";
            driver.Manage().Cookies.AddCookie(new Cookie(cookieName, "cod"));
            AssertCookieIsPresentWithName(cookieName);

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereElseIs("simpleTest.html");

            AssertCookieIsNotPresentWithName(cookieName);
        }

        [Test]
        public void ShouldBeAbleToAddToADomainWhichIsRelatedToTheCurrentDomain()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            // Cookies cannot be set on domain names with less than 2 dots, so
            // localhost is out. If we are in that boat, bail the test.
            string hostName = EnvironmentManager.Instance.UrlBuilder.HostName;
            string[] hostNameParts = hostName.Split(new char[] { '.' });
            if (hostNameParts.Length < 3)
            {
                Assert.Ignore("Skipping test: Cookies can only be set on fully-qualified domain names.");
            }

            AssertCookieIsNotPresentWithName("name");

            Regex replaceRegex = new Regex(".*?\\.");
            string shorter = replaceRegex.Replace(this.hostname, ".", 1);
            Cookie cookie = new Cookie("name", "value", shorter, "/", GetTimeInTheFuture());

            driver.Manage().Cookies.AddCookie(cookie);

            AssertCookieIsPresentWithName("name");
        }

        [Test]
        public void ShouldNotGetCookiesRelatedToCurrentDomainWithoutLeadingPeriod()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            string cookieName = "name";
            AssertCookieIsNotPresentWithName(cookieName);

            Regex replaceRegex = new Regex(".*?\\.");
            string subdomain = replaceRegex.Replace(this.hostname, "subdomain.", 1);
            Cookie cookie = new Cookie(cookieName, "value", subdomain, "/", GetTimeInTheFuture());

            string originalUrl = driver.Url;
            string subdomainUrl = originalUrl.Replace(this.hostname, subdomain);
            driver.Url = subdomainUrl;
            driver.Manage().Cookies.AddCookie(cookie);

            driver.Url = originalUrl;
            AssertCookieIsNotPresentWithName(cookieName);
        }

        [Test]
        public void ShouldBeAbleToIncludeLeadingPeriodInDomainName()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            // Cookies cannot be set on domain names with less than 2 dots, so
            // localhost is out. If we are in that boat, bail the test.
            string hostName = EnvironmentManager.Instance.UrlBuilder.HostName;
            string[] hostNameParts = hostName.Split(new char[] { '.' });
            if (hostNameParts.Length < 3)
            {
                Assert.Ignore("Skipping test: Cookies can only be set on fully-qualified domain names.");
            }

            AssertCookieIsNotPresentWithName("name");

            // Replace the first part of the name with a period
            Regex replaceRegex = new Regex(".*?\\.");
            string shorter = replaceRegex.Replace(this.hostname, ".", 1);
            Cookie cookie = new Cookie("name", "value", shorter, "/", DateTime.Now.AddSeconds(100000));

            driver.Manage().Cookies.AddCookie(cookie);

            AssertCookieIsPresentWithName("name");
        }

        [Test]
        public void ShouldBeAbleToSetDomainToTheCurrentDomain()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            // Cookies cannot be set on domain names with less than 2 dots, so
            // localhost is out. If we are in that boat, bail the test.
            string hostName = EnvironmentManager.Instance.UrlBuilder.HostName;
            string[] hostNameParts = hostName.Split(new char[] { '.' });
            if (hostNameParts.Length < 3)
            {
                Assert.Ignore("Skipping test: Cookies can only be set on fully-qualified domain names.");
            }

            Uri url = new Uri(driver.Url);
            String host = url.Host + ":" + url.Port.ToString();

            Cookie cookie1 = new Cookie("fish", "cod", host, "/", null);
            IOptions options = driver.Manage();
            options.Cookies.AddCookie(cookie1);

            driver.Url = javascriptPage;
            ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
            Assert.That(cookies, Does.Contain(cookie1));
        }

        [Test]
        public void ShouldWalkThePathToDeleteACookie()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            string basePath = EnvironmentManager.Instance.UrlBuilder.Path;

            Cookie cookie1 = new Cookie("fish", "cod");
            driver.Manage().Cookies.AddCookie(cookie1);
            int count = driver.Manage().Cookies.AllCookies.Count;

            driver.Url = childPage;
            Cookie cookie2 = new Cookie("rodent", "hamster", "/" + basePath + "/child");
            driver.Manage().Cookies.AddCookie(cookie2);
            count = driver.Manage().Cookies.AllCookies.Count;

            driver.Url = grandchildPage;
            Cookie cookie3 = new Cookie("dog", "dalmation", "/" + basePath + "/child/grandchild/");
            driver.Manage().Cookies.AddCookie(cookie3);
            count = driver.Manage().Cookies.AllCookies.Count;

            driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("child/grandchild"));
            driver.Manage().Cookies.DeleteCookieNamed("rodent");
            count = driver.Manage().Cookies.AllCookies.Count;

            Assert.That(driver.Manage().Cookies.GetCookieNamed("rodent"), Is.Null);

            ReadOnlyCollection<Cookie> cookies = driver.Manage().Cookies.AllCookies;
            Assert.That(cookies, Has.Count.EqualTo(2));
            Assert.That(cookies, Does.Contain(cookie1));
            Assert.That(cookies, Does.Contain(cookie3));

            driver.Manage().Cookies.DeleteAllCookies();
            driver.Url = grandchildPage;
            AssertNoCookiesArePresent();
        }

        [Test]
        public void ShouldIgnoreThePortNumberOfTheHostWhenSettingTheCookie()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            // Cookies cannot be set on domain names with less than 2 dots, so
            // localhost is out. If we are in that boat, bail the test.
            string hostName = EnvironmentManager.Instance.UrlBuilder.HostName;
            string[] hostNameParts = hostName.Split(new char[] { '.' });
            if (hostNameParts.Length < 3)
            {
                Assert.Ignore("Skipping test: Cookies can only be set on fully-qualified domain names.");
            }

            Uri uri = new Uri(driver.Url);
            string host = string.Format("{0}:{1}", uri.Host, uri.Port);
            string cookieName = "name";
            AssertCookieIsNotPresentWithName(cookieName);
            Cookie cookie = new Cookie(cookieName, "value", host, "/", null);
            driver.Manage().Cookies.AddCookie(cookie);
            AssertCookieIsPresentWithName(cookieName);
        }

        [Test]
        [IgnoreBrowser(Browser.Opera)]
        public void CookieEqualityAfterSetAndGet()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            string url = EnvironmentManager.Instance.UrlBuilder.WhereElseIs("animals");

            driver.Url = url;
            driver.Manage().Cookies.DeleteAllCookies();

            DateTime time = DateTime.Now.AddDays(1);
            Cookie cookie1 = new Cookie("fish", "cod", null, "/common/animals", time);
            IOptions options = driver.Manage();
            options.Cookies.AddCookie(cookie1);

            ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
            Cookie retrievedCookie = null;
            foreach (Cookie tempCookie in cookies)
            {
                if (cookie1.Equals(tempCookie))
                {
                    retrievedCookie = tempCookie;
                    break;
                }
            }

            Assert.That(retrievedCookie, Is.Not.Null);
            //Cookie.equals only compares name, domain and path
            Assert.AreEqual(cookie1, retrievedCookie);
        }

        [Test]
        [IgnoreBrowser(Browser.Opera)]
        public void ShouldRetainCookieExpiry()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            string url = EnvironmentManager.Instance.UrlBuilder.WhereElseIs("animals");

            driver.Url = url;
            driver.Manage().Cookies.DeleteAllCookies();

            // DateTime.Now contains milliseconds; the returned cookie expire date
            // will not. So we need to truncate the milliseconds.
            DateTime current = DateTime.Now;
            DateTime expireDate = new DateTime(current.Year, current.Month, current.Day, current.Hour, current.Minute, current.Second, DateTimeKind.Local).AddDays(1);

            Cookie addCookie = new Cookie("fish", "cod", "/common/animals", expireDate);
            IOptions options = driver.Manage();
            options.Cookies.AddCookie(addCookie);

            Cookie retrieved = options.Cookies.GetCookieNamed("fish");
            Assert.That(retrieved, Is.Not.Null);
            Assert.AreEqual(addCookie.Expiry, retrieved.Expiry, "Cookies are not equal");
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Browser does not handle untrusted SSL certificates.")]
        [IgnoreBrowser(Browser.EdgeLegacy, "Browser does not handle untrusted SSL certificates.")]
        public void CanHandleSecureCookie()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIsSecure("animals");

            Cookie addedCookie = new ReturnedCookie("fish", "cod", null, "/common/animals", null, true, false);
            driver.Manage().Cookies.AddCookie(addedCookie);

            driver.Navigate().Refresh();

            Cookie retrieved = driver.Manage().Cookies.GetCookieNamed("fish");
            Assert.That(retrieved, Is.Not.Null);
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Browser does not handle untrusted SSL certificates.")]
        [IgnoreBrowser(Browser.EdgeLegacy, "Browser does not handle untrusted SSL certificates.")]
        public void ShouldRetainCookieSecure()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIsSecure("animals");

            ReturnedCookie addedCookie = new ReturnedCookie("fish", "cod", string.Empty, "/common/animals", null, true, false);

            driver.Manage().Cookies.AddCookie(addedCookie);

            driver.Navigate().Refresh();

            Cookie retrieved = driver.Manage().Cookies.GetCookieNamed("fish");
            Assert.That(retrieved, Is.Not.Null);
            Assert.That(retrieved.Secure, "Secure attribute not set to true");
        }

        [Test]
        public void CanHandleHttpOnlyCookie()
        {
            StringBuilder url = new StringBuilder(EnvironmentManager.Instance.UrlBuilder.WhereIs("cookie"));
            url.Append("?action=add");
            url.Append("&name=").Append("fish");
            url.Append("&value=").Append("cod");
            url.Append("&path=").Append("/common/animals");
            url.Append("&httpOnly=").Append("true");

            driver.Url = url.ToString();

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("animals");
            Cookie retrieved = driver.Manage().Cookies.GetCookieNamed("fish");
            Assert.That(retrieved, Is.Not.Null);
        }

        [Test]
        public void ShouldRetainHttpOnlyFlag()
        {
            StringBuilder url = new StringBuilder(EnvironmentManager.Instance.UrlBuilder.WhereElseIs("cookie"));
            url.Append("?action=add");
            url.Append("&name=").Append("fish");
            url.Append("&value=").Append("cod");
            url.Append("&path=").Append("/common/animals");
            url.Append("&httpOnly=").Append("true");

            driver.Url = url.ToString();

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereElseIs("animals");

            Cookie retrieved = driver.Manage().Cookies.GetCookieNamed("fish");
            Assert.That(retrieved, Is.Not.Null);
            Assert.That(retrieved.IsHttpOnly, "HttpOnly attribute not set to true");
        }

        [Test]
        public void SettingACookieThatExpiredInThePast()
        {
            string url = EnvironmentManager.Instance.UrlBuilder.WhereElseIs("animals");

            driver.Url = url;
            driver.Manage().Cookies.DeleteAllCookies();

            DateTime expires = DateTime.Now.AddSeconds(-1000);
            Cookie cookie = new Cookie("expired", "yes", "/common/animals", expires);
            IOptions options = driver.Manage();
            options.Cookies.AddCookie(cookie);

            cookie = options.Cookies.GetCookieNamed("expired");
            Assert.That(cookie, Is.Null, "Cookie expired before it was set, so nothing should be returned: " + cookie);
        }
        
        [Test]
        public void CanSetCookieWithoutOptionalFieldsSet()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            string key = GenerateUniqueKey();
            string value = "foo";
            Cookie cookie = new Cookie(key, value);
            AssertCookieIsNotPresentWithName(key);

            driver.Manage().Cookies.AddCookie(cookie);

            AssertCookieHasValue(key, value);
        }

        [Test]
        public void DeleteNotExistedCookie()
        {
            String key = GenerateUniqueKey();
            AssertCookieIsNotPresentWithName(key);

            driver.Manage().Cookies.DeleteCookieNamed(key);
        }

        [Test]
        public void DeleteAllCookiesDifferentUrls()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            Cookie cookie1 = new Cookie("fish1", "cod", EnvironmentManager.Instance.UrlBuilder.HostName, null, null);
            Cookie cookie2 = new Cookie("fish2", "tune", EnvironmentManager.Instance.UrlBuilder.AlternateHostName, null, null);

            string url1 = EnvironmentManager.Instance.UrlBuilder.WhereIs("");
            string url2 = EnvironmentManager.Instance.UrlBuilder.WhereElseIs("");

            IOptions options = driver.Manage();

            options.Cookies.AddCookie(cookie1);
            AssertCookieIsPresentWithName(cookie1.Name);

            driver.Url = url2;
            options.Cookies.AddCookie(cookie2);
            AssertCookieIsNotPresentWithName(cookie1.Name);
            AssertCookieIsPresentWithName(cookie2.Name);

            driver.Url = url1;
            AssertCookieIsPresentWithName(cookie1.Name);
            AssertCookieIsNotPresentWithName(cookie2.Name);

            options.Cookies.DeleteAllCookies();
            AssertCookieIsNotPresentWithName(cookie1.Name);

            driver.Url = url2;
            AssertCookieIsPresentWithName(cookie2.Name);
        }

        //------------------------------------------------------------------
        // Tests below here are not included in the Java test suite
        //------------------------------------------------------------------
        [Test]
        public void CanSetCookiesOnADifferentPathOfTheSameHost()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            string basePath = EnvironmentManager.Instance.UrlBuilder.Path;
            Cookie cookie1 = new Cookie("fish", "cod", "/" + basePath + "/animals");
            Cookie cookie2 = new Cookie("planet", "earth", "/" + basePath + "/galaxy");

            IOptions options = driver.Manage();
            ReadOnlyCollection<Cookie> count = options.Cookies.AllCookies;

            options.Cookies.AddCookie(cookie1);
            options.Cookies.AddCookie(cookie2);

            string url = EnvironmentManager.Instance.UrlBuilder.WhereIs("animals");
            driver.Url = url;
            ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;

            Assert.That(cookies, Does.Contain(cookie1));
            Assert.That(cookies, Does.Not.Contain(cookie2));

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("galaxy");
            cookies = options.Cookies.AllCookies;
            Assert.That(cookies, Does.Not.Contain(cookie1));
            Assert.That(cookies, Does.Contain(cookie2));
        }

        [Test]
        public void ShouldNotBeAbleToSetDomainToSomethingThatIsUnrelatedToTheCurrentDomain()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            Cookie cookie1 = new Cookie("fish", "cod");
            IOptions options = driver.Manage();
            options.Cookies.AddCookie(cookie1);

            string url = EnvironmentManager.Instance.UrlBuilder.WhereElseIs("simpleTest.html");
            driver.Url = url;

            Assert.That(options.Cookies.GetCookieNamed("fish"), Is.Null);
        }

        [Test]
        public void GetCookieDoesNotRetriveBeyondCurrentDomain()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            Cookie cookie1 = new Cookie("fish", "cod");
            IOptions options = driver.Manage();
            options.Cookies.AddCookie(cookie1);

            String url = EnvironmentManager.Instance.UrlBuilder.WhereElseIs("");
            driver.Url = url;

            ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
            Assert.That(cookies, Does.Not.Contain(cookie1));
        }

        [Test]
        public void ShouldAddCookieToCurrentDomainAndPath()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            // Cookies cannot be set on domain names with less than 2 dots, so
            // localhost is out. If we are in that boat, bail the test.
            string hostName = EnvironmentManager.Instance.UrlBuilder.HostName;
            string[] hostNameParts = hostName.Split(new char[] { '.' });
            if (hostNameParts.Length < 3)
            {
                Assert.Ignore("Skipping test: Cookies can only be set on fully-qualified domain names.");
            }

            driver.Url = macbethPage;
            IOptions options = driver.Manage();
            Cookie cookie = new Cookie("Homer", "Simpson", this.hostname, "/" + EnvironmentManager.Instance.UrlBuilder.Path, null);
            options.Cookies.AddCookie(cookie);
            ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
            Assert.That(cookies.Contains(cookie), "Valid cookie was not returned");
        }

        [Test]
        public void ShouldNotShowCookieAddedToDifferentDomain()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                Assert.Ignore("Not on a standard domain for cookies (localhost doesn't count).");
            }

            driver.Url = macbethPage;
            IOptions options = driver.Manage();
            Cookie cookie = new Cookie("Bart", "Simpson", EnvironmentManager.Instance.UrlBuilder.HostName + ".com", EnvironmentManager.Instance.UrlBuilder.Path, null);
            Assert.That(() => options.Cookies.AddCookie(cookie), Throws.InstanceOf<WebDriverException>().Or.InstanceOf<InvalidOperationException>());
            ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
            Assert.That(cookies, Does.Not.Contain(cookie), "Invalid cookie was returned");
        }

        [Test]
        public void ShouldNotShowCookieAddedToDifferentPath()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            // Cookies cannot be set on domain names with less than 2 dots, so
            // localhost is out. If we are in that boat, bail the test.
            string hostName = EnvironmentManager.Instance.UrlBuilder.HostName;
            string[] hostNameParts = hostName.Split(new char[] { '.' });
            if (hostNameParts.Length < 3)
            {
                Assert.Ignore("Skipping test: Cookies can only be set on fully-qualified domain names.");
            }

            driver.Url = macbethPage;
            IOptions options = driver.Manage();
            Cookie cookie = new Cookie("Lisa", "Simpson", EnvironmentManager.Instance.UrlBuilder.HostName, "/" + EnvironmentManager.Instance.UrlBuilder.Path + "IDoNotExist", null);
            options.Cookies.AddCookie(cookie);
            ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
            Assert.That(cookies, Does.Not.Contain(cookie), "Invalid cookie was returned");
        }

        [Test]
        public void ShouldThrowExceptionWhenAddingCookieToCookieAverseDocument()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            // URLs using a non-network scheme (like "about:" or "data:") are
            // averse to cookies, and should throw an InvalidCookieDomainException.
            driver.Url = "about:blank";

            IOptions options = driver.Manage();
            Cookie cookie = new Cookie("question", "dunno");
            Assert.That(() => options.Cookies.AddCookie(cookie), Throws.InstanceOf<InvalidCookieDomainException>().Or.InstanceOf<InvalidOperationException>());
        }

        [Test]
        public void ShouldReturnNullBecauseCookieRetainsExpiry()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            string url = EnvironmentManager.Instance.UrlBuilder.WhereElseIs("animals");
            driver.Url = url;

            driver.Manage().Cookies.DeleteAllCookies();

            Cookie addCookie = new Cookie("fish", "cod", "/common/animals", DateTime.Now.AddHours(-1));
            IOptions options = driver.Manage();
            options.Cookies.AddCookie(addCookie);

            Cookie retrieved = options.Cookies.GetCookieNamed("fish");
            Assert.That(retrieved, Is.Null);
        }

        [Test]
        public void ShouldAddCookieToCurrentDomain()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            driver.Url = macbethPage;
            IOptions options = driver.Manage();
            Cookie cookie = new Cookie("Marge", "Simpson", "/");
            options.Cookies.AddCookie(cookie);
            ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
            Assert.That(cookies.Contains(cookie), "Valid cookie was not returned");
        }

        [Test]
        public void ShouldDeleteCookie()
        {
            if (!CheckIsOnValidHostNameForCookieTests())
            {
                return;
            }

            driver.Url = macbethPage;
            IOptions options = driver.Manage();
            Cookie cookieToDelete = new Cookie("answer", "42");
            Cookie cookieToKeep = new Cookie("canIHaz", "Cheeseburguer");
            options.Cookies.AddCookie(cookieToDelete);
            options.Cookies.AddCookie(cookieToKeep);
            ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
            options.Cookies.DeleteCookie(cookieToDelete);
            ReadOnlyCollection<Cookie> cookies2 = options.Cookies.AllCookies;
            Assert.That(cookies2, Does.Not.Contain(cookieToDelete), "Cookie was not deleted successfully");
            Assert.That(cookies2.Contains(cookieToKeep), "Valid cookie was not returned");
        }

        //////////////////////////////////////////////
        // Support functions
        //////////////////////////////////////////////

        private void GotoValidDomainAndClearCookies(string page)
        {
            this.hostname = null;
            String hostname = EnvironmentManager.Instance.UrlBuilder.HostName;
            if (IsValidHostNameForCookieTests(hostname))
            {
                this.isOnAlternativeHostName = false;
                this.hostname = hostname;
            }

            hostname = EnvironmentManager.Instance.UrlBuilder.AlternateHostName;
            if (this.hostname == null && IsValidHostNameForCookieTests(hostname))
            {
                this.isOnAlternativeHostName = true;
                this.hostname = hostname;
            }

            GoToPage(page);

            driver.Manage().Cookies.DeleteAllCookies();
            if (driver.Manage().Cookies.AllCookies.Count != 0)
            {
                // If cookies are still present, restart the driver and try again.
                // This may mask some errors, where DeleteAllCookies doesn't fully
                // delete all it should, but that's a tradeoff we need to be willing
                // to make.
                driver = EnvironmentManager.Instance.CreateFreshDriver();
                GoToPage(page);
            }
        }

        private bool CheckIsOnValidHostNameForCookieTests()
        {
            bool correct = this.hostname != null && IsValidHostNameForCookieTests(this.hostname);
            if (!correct)
            {
                System.Console.WriteLine("Skipping test: unable to find domain name to use");
            }

            return correct;
        }

        private void GoToPage(String pageName)
        {
            driver.Url = this.isOnAlternativeHostName ? EnvironmentManager.Instance.UrlBuilder.WhereElseIs(pageName) : EnvironmentManager.Instance.UrlBuilder.WhereIs(pageName);
        }

        private void GoToOtherPage(String pageName)
        {
            driver.Url = this.isOnAlternativeHostName ? EnvironmentManager.Instance.UrlBuilder.WhereIs(pageName) : EnvironmentManager.Instance.UrlBuilder.WhereElseIs(pageName);
        }
        
        private bool IsValidHostNameForCookieTests(string hostname)
        {
            // TODO(JimEvan): Some coverage is better than none, so we
            // need to ignore the fact that localhost cookies are problematic.
            // Reenable this when we have a better solution per DanielWagnerHall.
            // ChromeDriver2 has trouble with localhost. IE and Firefox don't.
            // return !IsIpv4Address(hostname) && "localhost" != hostname;
            bool isLocalHostOkay = true;
            if ("localhost" == hostname && TestUtilities.IsChrome(driver))
            {
                isLocalHostOkay = false;
            }

            return !IsIpv4Address(hostname) && isLocalHostOkay;
        }

        private static bool IsIpv4Address(string addrString)
        {
            return Regex.IsMatch(addrString, "\\d{1,3}(?:\\.\\d{1,3}){3}");
        }

        private string GenerateUniqueKey()
        {
            return string.Format("key_{0}", random.Next());
        }

        private string GetDocumentCookieOrNull()
        {
            IJavaScriptExecutor jsDriver = driver as IJavaScriptExecutor;
            if (jsDriver == null)
            {
                return null;
            }
            try
            {
                return (string)jsDriver.ExecuteScript("return document.cookie");
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }

        private void AssertNoCookiesArePresent()
        {
            Assert.That(driver.Manage().Cookies.AllCookies.Count, Is.EqualTo(0), "Cookies were not empty");
            string documentCookie = GetDocumentCookieOrNull();
            if (documentCookie != null)
            {
                Assert.AreEqual(string.Empty, documentCookie, "Cookies were not empty");
            }
        }

        private void AssertSomeCookiesArePresent()
        {
            Assert.That(driver.Manage().Cookies.AllCookies.Count, Is.Not.EqualTo(0), "Cookies were empty");
            String documentCookie = GetDocumentCookieOrNull();
            if (documentCookie != null)
            {
                Assert.AreNotEqual(string.Empty, documentCookie, "Cookies were empty");
            }
        }

        private void AssertCookieIsNotPresentWithName(string key)
        {
            Assert.That(driver.Manage().Cookies.GetCookieNamed(key), Is.Null, "Cookie was present with name " + key);
            string documentCookie = GetDocumentCookieOrNull();
            if (documentCookie != null)
            {
                Assert.That(documentCookie, Does.Not.Contain(key + "="));
            }
        }

        private void AssertCookieIsPresentWithName(string key)
        {
            Assert.That(driver.Manage().Cookies.GetCookieNamed(key), Is.Not.Null, "Cookie was present with name " + key);
            string documentCookie = GetDocumentCookieOrNull();
            if (documentCookie != null)
            {
                Assert.That(documentCookie, Does.Contain(key + "="));
            }
        }

        private void AssertCookieHasValue(string key, string value)
        {
            Assert.AreEqual(value, driver.Manage().Cookies.GetCookieNamed(key).Value, "Cookie had wrong value");
            string documentCookie = GetDocumentCookieOrNull();
            if (documentCookie != null)
            {
                Assert.That(documentCookie, Does.Contain(key + "=" + value));
            }
        }

        private DateTime GetTimeInTheFuture()
        {
            return DateTime.Now.Add(TimeSpan.FromMilliseconds(100000));
        }
    }
}
