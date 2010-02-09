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
        [Test]
        public void ShouldDeleteCookie()
        {
            driver.Url = macbethPage;
            IOptions options = driver.Manage();
            Cookie cookieToDelete = new Cookie("answer", "42");
            Cookie cookieToKeep = new Cookie("canIHaz", "Cheeseburguer");
            options.AddCookie(cookieToDelete);
            options.AddCookie(cookieToKeep);
            ReadOnlyCollection<Cookie> cookies = options.GetCookies();
            options.DeleteCookie(cookieToDelete);
            ReadOnlyCollection<Cookie> cookies2 = options.GetCookies();
            Assert.IsFalse(cookies2.Contains(cookieToDelete), "Cookie was not deleted successfully");
            Assert.That(cookies2.Contains(cookieToKeep), "Valid cookie was not returned");
        }

        [Test]
        public void ShouldAddCookieToCurrentDomain()
        {
            driver.Url = macbethPage;
            IOptions options = driver.Manage();
            Cookie cookie = new Cookie("Marge", "Simpson", "/");
            options.AddCookie(cookie);
            ReadOnlyCollection<Cookie> cookies = options.GetCookies();
            Assert.That(cookies.Contains(cookie), "Valid cookie was not returned");
        }

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
            options.AddCookie(cookie);
            ReadOnlyCollection<Cookie> cookies = options.GetCookies();
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
            options.AddCookie(cookie);
            ReadOnlyCollection<Cookie> cookies = options.GetCookies();
            Assert.IsFalse(cookies.Contains(cookie), "Invalid cookie was returned");
        }

        [Test]
        public void ShouldNotShowCookieAddedToDifferentPath()
        {
            driver.Url = macbethPage;
            IOptions options = driver.Manage();
            Cookie cookie = new Cookie("Lisa", "Simpson", EnvironmentManager.Instance.UrlBuilder.HostName, "/" + EnvironmentManager.Instance.UrlBuilder.Path + "IDoNotExist", null);
            options.AddCookie(cookie);
            ReadOnlyCollection<Cookie> cookies = options.GetCookies();
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
            options.AddCookie(cookie);
        }

        [Test]
        [Category("JavaScript")]
        public void ShouldGetCookieByName()
        {
            driver.Url = simpleTestPage;
            driver.Manage().DeleteAllCookies();

            string key = string.Format("key_{0}", new Random().Next());
            ((IJavaScriptExecutor)driver).ExecuteScript("document.cookie = arguments[0] + '=set';", key);

            Cookie cookie = driver.Manage().GetCookieNamed(key);
            Assert.AreEqual("set", cookie.Value);
        }

        [Test]
        [Category("JavaScript")]
        public void ShouldBeAbleToAddCookie()
        {
            driver.Url = simpleTestPage;
            IOptions options = driver.Manage();
            options.DeleteAllCookies();

            string key = string.Format("key_{0}", new Random().Next());
            Cookie cookie = new Cookie(key, "foo");

            ((IJavaScriptExecutor)driver).ExecuteScript("return document.cookie");

            options.AddCookie(cookie);

            string current = (string)((IJavaScriptExecutor)driver).ExecuteScript("return document.cookie");
            Assert.IsTrue(current.Contains(key));
            Assert.That(options.GetCookies().Contains(cookie), "Cookie was not added successfully");
        }

        [Test]
        public void GetAllCookies()
        {
            driver.Url = simpleTestPage;
            driver.Manage().DeleteAllCookies();

            Random random = new Random();
            string key1 = string.Format("key_{0}", random.Next());
            string key2 = string.Format("key_{0}", random.Next());

            ReadOnlyCollection<Cookie> cookies = driver.Manage().GetCookies();
            int count = cookies.Count;

            Cookie one = new Cookie(key1, "value");
            Cookie two = new Cookie(key2, "value");

            driver.Manage().AddCookie(one);
            driver.Manage().AddCookie(two);

            driver.Url = simpleTestPage;
            cookies = driver.Manage().GetCookies();
            Assert.AreEqual(count + 2, cookies.Count);

            Assert.IsTrue(cookies.Contains(one));
            Assert.IsTrue(cookies.Contains(two));
        }

        [Test]
        [Category("JavaScript")]
        public void DeleteAllCookies()
        {
            driver.Url = simpleTestPage;
            driver.Manage().DeleteAllCookies();

            ((IJavaScriptExecutor)driver).ExecuteScript("document.cookie = 'foo=set';");
            int count = driver.Manage().GetCookies().Count;
            Assert.Greater(count, 0);

            driver.Manage().DeleteAllCookies();

            count = driver.Manage().GetCookies().Count;
            Assert.AreEqual(0, count);
        }

        [Test]
        [Category("JavaScript")]
        public void DeleteCookieWithName()
        {
            driver.Url = simpleTestPage;
            driver.Manage().DeleteAllCookies();

            Random random = new Random();
            string key1 = string.Format("key_{0}", random.Next());
            string key2 = string.Format("key_{0}", random.Next());

            ((IJavaScriptExecutor)driver).ExecuteScript("document.cookie = arguments[0] + '=set';", key1);
            ((IJavaScriptExecutor)driver).ExecuteScript("document.cookie = arguments[0] + '=set';", key2);

            Assert.IsNotNull(driver.Manage().GetCookieNamed(key1));
            Assert.IsNotNull(driver.Manage().GetCookieNamed(key2));

            driver.Manage().DeleteCookieNamed(key1);

            Assert.IsNull(driver.Manage().GetCookieNamed(key1));
            Assert.IsNotNull(driver.Manage().GetCookieNamed(key2));
        }

        [Test]
        public void ShouldNotDeleteCookiesWithASimilarName()
        {
            driver.Url = simpleTestPage;
            driver.Manage().DeleteAllCookies();

            string cookieOneName = "fish";
            Cookie cookie1 = new Cookie(cookieOneName, "cod");
            Cookie cookie2 = new Cookie(cookieOneName + "x", "earth");
            IOptions options = driver.Manage();
            options.AddCookie(cookie1);
            options.AddCookie(cookie2);

            options.DeleteCookieNamed(cookieOneName);
            ReadOnlyCollection<Cookie> cookies = options.GetCookies();

            Assert.IsFalse(driver.Manage().GetCookies().Contains(cookie1));
            Assert.IsTrue(driver.Manage().GetCookies().Contains(cookie2));
        }

        [Test]
        public void AddCookiesWithDifferentPathsThatAreRelatedToOurs()
        {
            driver.Url = simpleTestPage;
            driver.Manage().DeleteAllCookies();
            string basePath = EnvironmentManager.Instance.UrlBuilder.Path;

            Cookie cookie1 = new Cookie("fish", "cod", "/" + basePath + "/animals");
            Cookie cookie2 = new Cookie("planet", "earth", "/" + basePath + "/");
            IOptions options = driver.Manage();
            options.AddCookie(cookie1);
            options.AddCookie(cookie2);

            UrlBuilder builder = EnvironmentManager.Instance.UrlBuilder;
            driver.Url = builder.WhereIs("animals");

            ReadOnlyCollection<Cookie> cookies = options.GetCookies();
            Assert.IsTrue(cookies.Contains(cookie1));
            Assert.IsTrue(cookies.Contains(cookie2));

            driver.Url = builder.WhereIs("");
            cookies = options.GetCookies();
            Assert.IsFalse(cookies.Contains(cookie1));
            Assert.IsTrue(cookies.Contains(cookie2));
        }

        [Test]
        public void CanSetCookiesOnADifferentPathOfTheSameHost()
        {
            IOptions options = driver.Manage();
            driver.Url = simpleTestPage;
            options.DeleteAllCookies();
            string basePath = EnvironmentManager.Instance.UrlBuilder.Path;
            ReadOnlyCollection<Cookie> count = options.GetCookies();

            Cookie cookie1 = new Cookie("fish", "cod", "/" + basePath + "/animals");
            Cookie cookie2 = new Cookie("planet", "earth", "/" + basePath + "/galaxy");

            options.AddCookie(cookie1);
            options.AddCookie(cookie2);

            string url = EnvironmentManager.Instance.UrlBuilder.WhereIs("animals");
            driver.Url = url;
            ReadOnlyCollection<Cookie> cookies = options.GetCookies();

            Assert.IsTrue(cookies.Contains(cookie1));
            Assert.IsFalse(cookies.Contains(cookie2));

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("galaxy");
            cookies = options.GetCookies();
            Assert.IsFalse(cookies.Contains(cookie1));
            Assert.IsTrue(cookies.Contains(cookie2));
        }

        [Test]
        public void ShouldNotBeAbleToSetDomainToSomethingThatIsUnrelatedToTheCurrentDomain()
        {
            driver.Url = simpleTestPage;
            driver.Manage().DeleteAllCookies();

            Cookie cookie1 = new Cookie("fish", "cod");
            IOptions options = driver.Manage();
            options.AddCookie(cookie1);

            string url = EnvironmentManager.Instance.UrlBuilder.WhereElseIs("simpleTest.html");
            driver.Url = url;

            Assert.IsNull(options.GetCookieNamed("fish"));
        }

        [Test]
        public void ShouldBeAbleToAddToADomainWhichIsRelatedToTheCurrentDomain()
        {
            driver.Url = simpleTestPage;
            driver.Manage().DeleteAllCookies();

            Regex nameRegex = new Regex("\\d{1,3}(?:\\.\\d{1,3}){3}");
            string name = GotoValidDomainAndClearCookies();
            if (name == null || nameRegex.IsMatch(name))
            {
                Assert.Ignore("Skipping test: Cookies can only be set on fully-qualified domain names.");
            }

            Assert.IsNull(driver.Manage().GetCookieNamed("name"));

            Regex replaceRegex = new Regex(".*?\\.");
            string shorter = replaceRegex.Replace(name, ".");
            Cookie cookie = new Cookie("name", "value", shorter, "/", DateTime.Now.AddSeconds(100000));

            driver.Manage().AddCookie(cookie);

            Assert.IsNotNull(driver.Manage().GetCookieNamed("name"));
        }

        [Test]
        public void ShouldBeAbleToIncludeLeadingPeriodInDomainName()
        {
            driver.Url = simpleTestPage;
            driver.Manage().DeleteAllCookies();

            Regex nameRegex = new Regex("\\d{1,3}(?:\\.\\d{1,3}){3}");
            string name = GotoValidDomainAndClearCookies();
            if (name == null || nameRegex.IsMatch(name))
            {
                Assert.Ignore("Skipping test: Cookies can only be set on fully-qualified domain names.");
            }
            driver.Manage().DeleteAllCookies();

            Assert.IsNull(driver.Manage().GetCookieNamed("name"), "Looks like delete all cookies doesn't");

            // Replace the first part of the name with a period
            Regex replaceRegex = new Regex(".*?\\.");
            string shorter = replaceRegex.Replace(name, ".");
            Cookie cookie = new Cookie("name", "value", shorter, "/", DateTime.Now.AddSeconds(100000));

            driver.Manage().AddCookie(cookie);

            Assert.IsNotNull(driver.Manage().GetCookieNamed("name"));
        }

        [Test]
        public void GetCookieDoesNotRetriveBeyondCurrentDomain()
        {
            driver.Url = simpleTestPage;
            driver.Manage().DeleteAllCookies();

            Cookie cookie1 = new Cookie("fish", "cod");
            IOptions options = driver.Manage();
            options.AddCookie(cookie1);

            String url = EnvironmentManager.Instance.UrlBuilder.WhereElseIs("");
            driver.Url = url;

            ReadOnlyCollection<Cookie> cookies = options.GetCookies();
            Assert.IsFalse(cookies.Contains(cookie1));
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "IE cookies do not conform to RFC, so setting cookie on domain fails.")]
        public void ShouldBeAbleToSetDomainToTheCurrentDomain()
        {
            driver.Url = simpleTestPage;
            driver.Manage().DeleteAllCookies();

            Uri url = new Uri(driver.Url);
            String host = url.Host + ":" + url.Port.ToString();

            Cookie cookie1 = new Cookie("fish", "cod", host, "/", null);
            IOptions options = driver.Manage();
            options.AddCookie(cookie1);

            driver.Url = javascriptPage;
            ReadOnlyCollection<Cookie> cookies = options.GetCookies();
            Assert.IsTrue(cookies.Contains(cookie1));
        }

        [Test]
        public void ShouldWalkThePathToDeleteACookie()
        {
            string basePath = EnvironmentManager.Instance.UrlBuilder.Path;

            driver.Url = simpleTestPage;
            driver.Manage().DeleteAllCookies();

            Cookie cookie1 = new Cookie("fish", "cod");
            driver.Manage().AddCookie(cookie1);
            int count = driver.Manage().GetCookies().Count;

            driver.Url = childPage;
            Cookie cookie2 = new Cookie("rodent", "hamster", "/" + basePath + "/child");
            driver.Manage().AddCookie(cookie2);
            count = driver.Manage().GetCookies().Count;

            driver.Url = grandchildPage;
            Cookie cookie3 = new Cookie("dog", "dalmation", "/" + basePath + "/child/grandchild/");
            driver.Manage().AddCookie(cookie3);
            count = driver.Manage().GetCookies().Count;

            driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("child/grandchild"));
            driver.Manage().DeleteCookieNamed("rodent");
            count = driver.Manage().GetCookies().Count;

            Assert.IsNull(driver.Manage().GetCookieNamed("rodent"));

            ReadOnlyCollection<Cookie> cookies = driver.Manage().GetCookies();
            Assert.AreEqual(2, cookies.Count);
            Assert.IsTrue(cookies.Contains(cookie1));
            Assert.IsTrue(cookies.Contains(cookie3));

            driver.Manage().DeleteAllCookies();
            driver.Url = grandchildPage;

            cookies = driver.Manage().GetCookies();
            Assert.AreEqual(0, cookies.Count);
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "IE cookies do not conform to RFC, so setting cookie on domain fails.")]
        public void ShouldIgnoreThePortNumberOfTheHostWhenSettingTheCookie()
        {
            driver.Url = simpleTestPage;
            driver.Manage().DeleteAllCookies();

            Uri uri = new Uri(driver.Url);
            String host = string.Format("{0}:{1}", uri.Host, uri.Port);

            Assert.IsNull(driver.Manage().GetCookieNamed("name"));
            Cookie cookie = new Cookie("name", "value", host, "/", null);
            driver.Manage().AddCookie(cookie);

            Assert.IsNotNull(driver.Manage().GetCookieNamed("name"));
        }

        [Test]
        public void CookieIntegrity()
        {
            string url = EnvironmentManager.Instance.UrlBuilder.WhereElseIs("animals");

            driver.Url = url;
            driver.Manage().DeleteAllCookies();

            DateTime time = DateTime.Now.AddDays(1);
            Cookie cookie1 = new Cookie("fish", "cod", null, "/common/animals", time);
            IOptions options = driver.Manage();
            options.AddCookie(cookie1);

            ReadOnlyCollection<Cookie> cookies = options.GetCookies();
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

            driver.Manage().DeleteAllCookies();

            return name;
        }
    }
}
