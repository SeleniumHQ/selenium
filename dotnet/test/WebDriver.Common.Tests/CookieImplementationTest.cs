using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text.RegularExpressions;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class CookieImplementationTest : DriverTestFixture
    {
        [SetUp]
        public void GoToSimplePageAndDeleteCookies()
        {
            driver.Url = simpleTestPage;
            driver.Manage().Cookies.DeleteAllCookies();
        }

        [Test]
        [Category("JavaScript")]
        public void ShouldGetCookieByName()
        {
            string key = string.Format("key_{0}", new Random().Next());
            ((IJavaScriptExecutor)driver).ExecuteScript("document.cookie = arguments[0] + '=set';", key);

            Cookie cookie = driver.Manage().Cookies.GetCookieNamed(key);
            Assert.AreEqual("set", cookie.Value);
        }

        [Test]
        [Category("JavaScript")]
        public void ShouldBeAbleToAddCookie()
        {
            string key = string.Format("key_{0}", new Random().Next());
            Cookie cookie = new Cookie(key, "foo");

            ((IJavaScriptExecutor)driver).ExecuteScript("return document.cookie");

            driver.Manage().Cookies.AddCookie(cookie);

            string current = (string)((IJavaScriptExecutor)driver).ExecuteScript("return document.cookie");
            Assert.IsTrue(current.Contains(key));
            Assert.That(driver.Manage().Cookies.AllCookies.Contains(cookie), "Cookie was not added successfully");
        }

        [Test]
        public void GetAllCookies()
        {
            Random random = new Random();
            string key1 = string.Format("key_{0}", random.Next());
            string key2 = string.Format("key_{0}", random.Next());

            ReadOnlyCollection<Cookie> cookies = driver.Manage().Cookies.AllCookies;
            int count = cookies.Count;

            Cookie one = new Cookie(key1, "value");
            Cookie two = new Cookie(key2, "value");

            driver.Manage().Cookies.AddCookie(one);
            driver.Manage().Cookies.AddCookie(two);

            driver.Url = simpleTestPage;
            cookies = driver.Manage().Cookies.AllCookies;
            Assert.AreEqual(count + 2, cookies.Count);

            Assert.IsTrue(cookies.Contains(one));
            Assert.IsTrue(cookies.Contains(two));
        }

        [Test]
        [Category("JavaScript")]
        public void DeleteAllCookies()
        {
            ((IJavaScriptExecutor)driver).ExecuteScript("document.cookie = 'foo=set';");
            int count = driver.Manage().Cookies.AllCookies.Count;
            Assert.Greater(count, 0);

            driver.Manage().Cookies.DeleteAllCookies();

            count = driver.Manage().Cookies.AllCookies.Count;
            Assert.AreEqual(0, count);
        }

        [Test]
        [Category("JavaScript")]
        public void DeleteCookieWithName()
        {
            Random random = new Random();
            string key1 = string.Format("key_{0}", random.Next());
            string key2 = string.Format("key_{0}", random.Next());

            ((IJavaScriptExecutor)driver).ExecuteScript("document.cookie = arguments[0] + '=set';", key1);
            ((IJavaScriptExecutor)driver).ExecuteScript("document.cookie = arguments[0] + '=set';", key2);

            Assert.IsNotNull(driver.Manage().Cookies.GetCookieNamed(key1));
            Assert.IsNotNull(driver.Manage().Cookies.GetCookieNamed(key2));

            driver.Manage().Cookies.DeleteCookieNamed(key1);

            Assert.IsNull(driver.Manage().Cookies.GetCookieNamed(key1));
            Assert.IsNotNull(driver.Manage().Cookies.GetCookieNamed(key2));
        }

        [Test]
        public void ShouldNotDeleteCookiesWithASimilarName()
        {
            string cookieOneName = "fish";
            Cookie cookie1 = new Cookie(cookieOneName, "cod");
            Cookie cookie2 = new Cookie(cookieOneName + "x", "earth");
            IOptions options = driver.Manage();
            options.Cookies.AddCookie(cookie1);
            options.Cookies.AddCookie(cookie2);

            options.Cookies.DeleteCookieNamed(cookieOneName);
            ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;

            Assert.IsFalse(driver.Manage().Cookies.AllCookies.Contains(cookie1));
            Assert.IsTrue(driver.Manage().Cookies.AllCookies.Contains(cookie2));
        }

        [Test]
        public void AddCookiesWithDifferentPathsThatAreRelatedToOurs()
        {
            string basePath = EnvironmentManager.Instance.UrlBuilder.Path;

            Cookie cookie1 = new Cookie("fish", "cod", "/" + basePath + "/animals");
            Cookie cookie2 = new Cookie("planet", "earth", "/" + basePath + "/");
            IOptions options = driver.Manage();
            options.Cookies.AddCookie(cookie1);
            options.Cookies.AddCookie(cookie2);

            UrlBuilder builder = EnvironmentManager.Instance.UrlBuilder;
            driver.Url = builder.WhereIs("animals");

            ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
            Assert.IsTrue(cookies.Contains(cookie1));
            Assert.IsTrue(cookies.Contains(cookie2));

            driver.Url = builder.WhereIs("");
            cookies = options.Cookies.AllCookies;
            Assert.IsFalse(cookies.Contains(cookie1));
            Assert.IsTrue(cookies.Contains(cookie2));
        }

        [Test]
        public void CanSetCookiesOnADifferentPathOfTheSameHost()
        {
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

            Assert.IsTrue(cookies.Contains(cookie1));
            Assert.IsFalse(cookies.Contains(cookie2));

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("galaxy");
            cookies = options.Cookies.AllCookies;
            Assert.IsFalse(cookies.Contains(cookie1));
            Assert.IsTrue(cookies.Contains(cookie2));
        }

        [Test]
        public void ShouldNotBeAbleToSetDomainToSomethingThatIsUnrelatedToTheCurrentDomain()
        {
            Cookie cookie1 = new Cookie("fish", "cod");
            IOptions options = driver.Manage();
            options.Cookies.AddCookie(cookie1);

            string url = EnvironmentManager.Instance.UrlBuilder.WhereElseIs("simpleTest.html");
            driver.Url = url;

            Assert.IsNull(options.Cookies.GetCookieNamed("fish"));
        }

        [Test]
        public void ShouldBeAbleToAddToADomainWhichIsRelatedToTheCurrentDomain()
        {
            Regex nameRegex = new Regex("\\d{1,3}(?:\\.\\d{1,3}){3}");
            string name = GotoValidDomainAndClearCookies();
            if (name == null || nameRegex.IsMatch(name))
            {
                Assert.Ignore("Skipping test: Cookies can only be set on fully-qualified domain names.");
            }

            Assert.IsNull(driver.Manage().Cookies.GetCookieNamed("name"));

            Regex replaceRegex = new Regex(".*?\\.");
            string shorter = replaceRegex.Replace(name, ".");
            Cookie cookie = new Cookie("name", "value", shorter, "/", DateTime.Now.AddSeconds(100000));

            driver.Manage().Cookies.AddCookie(cookie);

            Assert.IsNotNull(driver.Manage().Cookies.GetCookieNamed("name"));
        }

        [Test]
        public void ShouldBeAbleToIncludeLeadingPeriodInDomainName()
        {
            Regex nameRegex = new Regex("\\d{1,3}(?:\\.\\d{1,3}){3}");
            string name = GotoValidDomainAndClearCookies();
            if (name == null || nameRegex.IsMatch(name))
            {
                Assert.Ignore("Skipping test: Cookies can only be set on fully-qualified domain names.");
            }
            driver.Manage().Cookies.DeleteAllCookies();

            Assert.IsNull(driver.Manage().Cookies.GetCookieNamed("name"), "Looks like delete all cookies doesn't");

            // Replace the first part of the name with a period
            Regex replaceRegex = new Regex(".*?\\.");
            string shorter = replaceRegex.Replace(name, ".");
            Cookie cookie = new Cookie("name", "value", shorter, "/", DateTime.Now.AddSeconds(100000));

            driver.Manage().Cookies.AddCookie(cookie);

            Assert.IsNotNull(driver.Manage().Cookies.GetCookieNamed("name"));
        }

        [Test]
        public void GetCookieDoesNotRetriveBeyondCurrentDomain()
        {
            Cookie cookie1 = new Cookie("fish", "cod");
            IOptions options = driver.Manage();
            options.Cookies.AddCookie(cookie1);

            String url = EnvironmentManager.Instance.UrlBuilder.WhereElseIs("");
            driver.Url = url;

            ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
            Assert.IsFalse(cookies.Contains(cookie1));
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "IE cookies do not conform to RFC, so setting cookie on domain fails.")]
        [IgnoreBrowser(Browser.Chrome, "Test tries to set the domain explicitly to 'localhost', which is not allowed.")]
        public void ShouldBeAbleToSetDomainToTheCurrentDomain()
        {
            Uri url = new Uri(driver.Url);
            String host = url.Host + ":" + url.Port.ToString();

            Cookie cookie1 = new Cookie("fish", "cod", host, "/", null);
            IOptions options = driver.Manage();
            options.Cookies.AddCookie(cookie1);

            driver.Url = javascriptPage;
            ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
            Assert.IsTrue(cookies.Contains(cookie1));
        }

        [Test]
        public void ShouldWalkThePathToDeleteACookie()
        {
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

            Assert.IsNull(driver.Manage().Cookies.GetCookieNamed("rodent"));

            ReadOnlyCollection<Cookie> cookies = driver.Manage().Cookies.AllCookies;
            Assert.AreEqual(2, cookies.Count);
            Assert.IsTrue(cookies.Contains(cookie1));
            Assert.IsTrue(cookies.Contains(cookie3));

            driver.Manage().Cookies.DeleteAllCookies();
            driver.Url = grandchildPage;

            cookies = driver.Manage().Cookies.AllCookies;
            Assert.AreEqual(0, cookies.Count);
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "IE cookies do not conform to RFC, so setting cookie on domain fails.")]
        [IgnoreBrowser(Browser.Chrome, "Test tries to set the domain explicitly to 'localhost', which is not allowed.")]
        public void ShouldIgnoreThePortNumberOfTheHostWhenSettingTheCookie()
        {
            Uri uri = new Uri(driver.Url);
            String host = string.Format("{0}:{1}", uri.Host, uri.Port);

            Assert.IsNull(driver.Manage().Cookies.GetCookieNamed("name"));
            Cookie cookie = new Cookie("name", "value", host, "/", null);
            driver.Manage().Cookies.AddCookie(cookie);

            Assert.IsNotNull(driver.Manage().Cookies.GetCookieNamed("name"));
        }

        [Test]
        public void CookieIntegrity()
        {
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

            Assert.IsNotNull(retrievedCookie);
            //Cookie.equals only compares name, domain and path
            Assert.AreEqual(cookie1, retrievedCookie);
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Chrome and Selenium, which use JavaScript to retrieve cookies, cannot return expiry info;")]
        [IgnoreBrowser(Browser.IE, "IE does not return expiry info")]
        [IgnoreBrowser(Browser.Android, "Chrome and Selenium, which use JavaScript to retrieve cookies, cannot return expiry info;")]
        public void ShouldRetainCookieExpiry()
        {
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
            Assert.IsNotNull(retrieved);
            Assert.AreEqual(addCookie.Expiry, retrieved.Expiry, "Cookies are not equal");
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

            cookie = options.Cookies.GetCookieNamed("fish");
            Assert.IsNull(cookie, "Cookie expired before it was set, so nothing should be returned: " + cookie);
        }

        //////////////////////////////////////////////
        // Tests unique to the .NET language bindings
        //////////////////////////////////////////////

        [Test]
        public void ShouldAddCookieToCurrentDomainAndPath()
        {
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
            Cookie cookie = new Cookie("Homer", "Simpson", hostName, "/" + EnvironmentManager.Instance.UrlBuilder.Path, null);
            options.Cookies.AddCookie(cookie);
            ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
            Assert.That(cookies.Contains(cookie), "Valid cookie was not returned");
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Add cookie to unrelated domain silently fails for IE.")]
        [ExpectedException(typeof(WebDriverException))]
        public void ShouldNotShowCookieAddedToDifferentDomain()
        {
            driver.Url = macbethPage;
            IOptions options = driver.Manage();
            Cookie cookie = new Cookie("Bart", "Simpson", EnvironmentManager.Instance.UrlBuilder.HostName + ".com", EnvironmentManager.Instance.UrlBuilder.Path, null);
            options.Cookies.AddCookie(cookie);
            ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
            Assert.IsFalse(cookies.Contains(cookie), "Invalid cookie was returned");
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Test tries to set the domain explicitly to 'localhost', which is not allowed.")]
        public void ShouldNotShowCookieAddedToDifferentPath()
        {
            driver.Url = macbethPage;
            IOptions options = driver.Manage();
            Cookie cookie = new Cookie("Lisa", "Simpson", EnvironmentManager.Instance.UrlBuilder.HostName, "/" + EnvironmentManager.Instance.UrlBuilder.Path + "IDoNotExist", null);
            options.Cookies.AddCookie(cookie);
            ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
            Assert.IsFalse(cookies.Contains(cookie), "Invalid cookie was returned");
        }

        // TODO(JimEvans): Disabling this test for now. If your network is using
        // something like OpenDNS or Google DNS which you may be automatically
        // redirected to a search page, which will be a valid page and will allow a
        // cookie to be created. Need to investigate further.
        // [Test]
        // [ExpectedException(typeof(InvalidOperationException))]
        public void ShouldThrowExceptionWhenAddingCookieToNonExistingDomain()
        {
            driver.Url = macbethPage;
            driver.Url = "doesnot.noireallyreallyreallydontexist.com";
            IOptions options = driver.Manage();
            Cookie cookie = new Cookie("question", "dunno");
            options.Cookies.AddCookie(cookie);
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Chrome and Selenium, which use JavaScript to retrieve cookies, cannot return expiry info;")]
        public void ShouldReturnNullBecauseCookieRetainsExpiry()
        {
            string url = EnvironmentManager.Instance.UrlBuilder.WhereElseIs("animals");
            driver.Url = url;

            driver.Manage().Cookies.DeleteAllCookies();

            Cookie addCookie = new Cookie("fish", "cod", "/common/animals", DateTime.Now.AddHours(-1));
            IOptions options = driver.Manage();
            options.Cookies.AddCookie(addCookie);

            Cookie retrieved = options.Cookies.GetCookieNamed("fish");
            Assert.IsNull(retrieved);
        }

        [Test]
        public void ShouldAddCookieToCurrentDomain()
        {
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
            driver.Url = macbethPage;
            IOptions options = driver.Manage();
            Cookie cookieToDelete = new Cookie("answer", "42");
            Cookie cookieToKeep = new Cookie("canIHaz", "Cheeseburguer");
            options.Cookies.AddCookie(cookieToDelete);
            options.Cookies.AddCookie(cookieToKeep);
            ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
            options.Cookies.DeleteCookie(cookieToDelete);
            ReadOnlyCollection<Cookie> cookies2 = options.Cookies.AllCookies;
            Assert.IsFalse(cookies2.Contains(cookieToDelete), "Cookie was not deleted successfully");
            Assert.That(cookies2.Contains(cookieToKeep), "Valid cookie was not returned");
        }

        private string GotoValidDomainAndClearCookies()
        {
            Regex hostNameRegex = new Regex("\\w+\\.\\w+.*");

            string name = null;
            string hostName = EnvironmentManager.Instance.UrlBuilder.HostName;
            if (hostNameRegex.IsMatch(hostName))
            {
                name = hostName;
                driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("simpleTest.html");
            }
            hostName = EnvironmentManager.Instance.UrlBuilder.AlternateHostName;
            if (name != null && hostNameRegex.IsMatch(hostName))
            {
                name = hostName;
                driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereElseIs("simpleTest.html");
            }

            driver.Manage().Cookies.DeleteAllCookies();

            return name;
        }
    }
}
