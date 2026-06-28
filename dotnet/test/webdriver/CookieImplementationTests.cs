// <copyright file="CookieImplementationTests.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System.Collections.ObjectModel;
using System.Text;
using System.Text.RegularExpressions;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Tests.Infrastructure.Environment;

namespace OpenQA.Selenium.Tests;

[TestFixture]
public class CookieImplementationTests : DriverTestFixture
{
    private readonly Random random = new Random();
    private bool isOnAlternativeHostName;
    private string hostname;

    [SetUp]
    public void GoToSimplePageAndDeleteCookies()
    {
        GotoValidDomainAndClearCookies("simpleTest.html");
        AssertNoCookiesArePresent();
    }

    [Test]
    public void ShouldGetCookieByName()
    {
        if (!CheckIsOnValidHostNameForCookieTests())
        {
            return;
        }

        string key = string.Format("key_{0}", random.Next());
        ((IJavaScriptExecutor)Driver).ExecuteScript("document.cookie = arguments[0] + '=set';", key);

        Cookie cookie = Driver.Manage().Cookies.GetCookieNamed(key);
        Assert.That(cookie.Value, Is.EqualTo("set"));
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

        Driver.Manage().Cookies.AddCookie(cookie);

        AssertCookieHasValue(key, value);
        Assert.That(Driver.Manage().Cookies.AllCookies, Does.Contain(cookie), "Cookie was not added successfully");
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

        ReadOnlyCollection<Cookie> cookies = Driver.Manage().Cookies.AllCookies;
        int count = cookies.Count;

        Cookie one = new Cookie(key1, "value");
        Cookie two = new Cookie(key2, "value");

        Driver.Manage().Cookies.AddCookie(one);
        Driver.Manage().Cookies.AddCookie(two);

        Driver.Url = Urls.SimpleTestPage;
        cookies = Driver.Manage().Cookies.AllCookies;
        Assert.That(cookies, Has.Count.EqualTo(count + 2));

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

        ((IJavaScriptExecutor)Driver).ExecuteScript("document.cookie = 'foo=set';");
        AssertSomeCookiesArePresent();

        Driver.Manage().Cookies.DeleteAllCookies();

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

        ((IJavaScriptExecutor)Driver).ExecuteScript("document.cookie = arguments[0] + '=set';", key1);
        ((IJavaScriptExecutor)Driver).ExecuteScript("document.cookie = arguments[0] + '=set';", key2);

        AssertCookieIsPresentWithName(key1);
        AssertCookieIsPresentWithName(key2);

        Driver.Manage().Cookies.DeleteCookieNamed(key1);

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
        IOptions options = Driver.Manage();
        AssertCookieIsNotPresentWithName(cookie1.Name);

        options.Cookies.AddCookie(cookie1);
        options.Cookies.AddCookie(cookie2);

        AssertCookieIsPresentWithName(cookie1.Name);

        options.Cookies.DeleteCookieNamed(cookieOneName);

        Assert.That(Driver.Manage().Cookies.AllCookies, Does.Not.Contain(cookie1));
        Assert.That(Driver.Manage().Cookies.AllCookies, Does.Contain(cookie2));
    }

    [Test]
    public void AddCookiesWithDifferentPathsThatAreRelatedToOurs()
    {
        if (!CheckIsOnValidHostNameForCookieTests())
        {
            return;
        }

        Cookie cookie1 = new Cookie("fish", "cod", "/common/animals");
        Cookie cookie2 = new Cookie("planet", "earth", "/common/");
        IOptions options = Driver.Manage();
        options.Cookies.AddCookie(cookie1);
        options.Cookies.AddCookie(cookie2);

        UrlBuilder builder = Urls;
        Driver.Url = builder.WhereIs("animals");

        ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
        AssertCookieIsPresentWithName(cookie1.Name);
        AssertCookieIsPresentWithName(cookie2.Name);

        Driver.Url = builder.WhereIs("simpleTest.html");
        AssertCookieIsNotPresentWithName(cookie1.Name);
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/1104")]
    public void GetCookiesInAFrame()
    {
        Driver.Url = Urls.WhereIs("animals");
        Cookie cookie1 = new Cookie("fish", "cod", "/common/animals");
        Driver.Manage().Cookies.AddCookie(cookie1);

        Driver.Url = Urls.WhereIs("frameWithAnimals.html");
        AssertCookieIsNotPresentWithName(cookie1.Name);

        Driver.SwitchTo().Frame("iframe1");
        AssertCookieIsPresentWithName(cookie1.Name);
    }

    [Test]
    public void CannotGetCookiesWithPathDifferingOnlyInCase()
    {
        if (!CheckIsOnValidHostNameForCookieTests())
        {
            return;
        }

        string cookieName = "fish";
        Driver.Manage().Cookies.AddCookie(new Cookie(cookieName, "cod", "/Common/animals"));

        Driver.Url = Urls.WhereIs("animals");
        Assert.That(Driver.Manage().Cookies.GetCookieNamed(cookieName), Is.Null);
    }

    [Test]
    public void ShouldNotGetCookieOnDifferentDomain()
    {
        if (!CheckIsOnValidHostNameForCookieTests())
        {
            return;
        }

        string cookieName = "fish";
        Driver.Manage().Cookies.AddCookie(new Cookie(cookieName, "cod"));
        AssertCookieIsPresentWithName(cookieName);

        Driver.Url = Urls.WhereElseIs("simpleTest.html");

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
        string hostName = Urls.HostName;
        string[] hostNameParts = hostName.Split(new char[] { '.' });
        if (hostNameParts.Length < 3)
        {
            Assert.Ignore("Skipping test: Cookies can only be set on fully-qualified domain names.");
        }

        AssertCookieIsNotPresentWithName("name");

        Regex replaceRegex = new Regex(".*?\\.");
        string shorter = replaceRegex.Replace(this.hostname, ".", 1);
        Cookie cookie = new Cookie("name", "value", shorter, "/", GetTimeInTheFuture());

        Driver.Manage().Cookies.AddCookie(cookie);

        AssertCookieIsPresentWithName("name");
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "IE does not want to set cookie")]
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

        string originalUrl = Driver.Url;
        string subdomainUrl = originalUrl.Replace(this.hostname, subdomain);
        Driver.Url = subdomainUrl;
        Driver.Manage().Cookies.AddCookie(cookie);

        Driver.Url = originalUrl;
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
        string hostName = Urls.HostName;
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

        Driver.Manage().Cookies.AddCookie(cookie);

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
        string hostName = Urls.HostName;
        string[] hostNameParts = hostName.Split(new char[] { '.' });
        if (hostNameParts.Length < 3)
        {
            Assert.Ignore("Skipping test: Cookies can only be set on fully-qualified domain names.");
        }

        Uri url = new Uri(Driver.Url);
        String host = url.Host + ":" + url.Port.ToString();

        Cookie cookie1 = new Cookie("fish", "cod", host, "/", null);
        IOptions options = Driver.Manage();
        options.Cookies.AddCookie(cookie1);

        Driver.Url = Urls.JavascriptPage;
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

        Cookie cookie1 = new Cookie("fish", "cod");
        Driver.Manage().Cookies.AddCookie(cookie1);
        int count = Driver.Manage().Cookies.AllCookies.Count;

        Driver.Url = Urls.ChildPage;
        Cookie cookie2 = new Cookie("rodent", "hamster", "/common/child");
        Driver.Manage().Cookies.AddCookie(cookie2);
        count = Driver.Manage().Cookies.AllCookies.Count;

        Driver.Url = Urls.GrandchildPage;
        Cookie cookie3 = new Cookie("dog", "dalmatian", "/common/child/grandchild/");
        Driver.Manage().Cookies.AddCookie(cookie3);
        count = Driver.Manage().Cookies.AllCookies.Count;

        Driver.Url = (Urls.WhereIs("child/grandchild"));
        Driver.Manage().Cookies.DeleteCookieNamed("rodent");
        count = Driver.Manage().Cookies.AllCookies.Count;

        Assert.That(Driver.Manage().Cookies.GetCookieNamed("rodent"), Is.Null);

        ReadOnlyCollection<Cookie> cookies = Driver.Manage().Cookies.AllCookies;
        Assert.That(cookies, Has.Exactly(2).Items);
        Assert.That(cookies, Does.Contain(cookie1));
        Assert.That(cookies, Does.Contain(cookie3));

        Driver.Manage().Cookies.DeleteAllCookies();
        Driver.Url = Urls.GrandchildPage;
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
        string hostName = Urls.HostName;
        string[] hostNameParts = hostName.Split(new char[] { '.' });
        if (hostNameParts.Length < 3)
        {
            Assert.Ignore("Skipping test: Cookies can only be set on fully-qualified domain names.");
        }

        Uri uri = new Uri(Driver.Url);
        string host = string.Format("{0}:{1}", uri.Host, uri.Port);
        string cookieName = "name";
        AssertCookieIsNotPresentWithName(cookieName);
        Cookie cookie = new Cookie(cookieName, "value", host, "/", null);
        Driver.Manage().Cookies.AddCookie(cookie);
        AssertCookieIsPresentWithName(cookieName);
    }

    [Test]
    public void CookieEqualityAfterSetAndGet()
    {
        if (!CheckIsOnValidHostNameForCookieTests())
        {
            return;
        }

        DateTime time = DateTime.Now.AddDays(1);
        Cookie cookie1 = new Cookie("fish", "cod", null, "/common/animals", time);
        IOptions options = Driver.Manage();
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
        Assert.That(retrievedCookie, Is.EqualTo(cookie1));
    }

    [Test]
    public void ShouldRetainCookieExpiry()
    {
        if (!CheckIsOnValidHostNameForCookieTests())
        {
            return;
        }

        // DateTime.Now contains milliseconds; the returned cookie expire date
        // will not. So we need to truncate the milliseconds.
        DateTime current = DateTime.Now;
        DateTime expireDate = new DateTime(current.Year, current.Month, current.Day, current.Hour, current.Minute, current.Second, DateTimeKind.Local).AddDays(1);

        Cookie addCookie = new Cookie("fish", "cod", "/common/animals", expireDate);
        IOptions options = Driver.Manage();
        options.Cookies.AddCookie(addCookie);

        Cookie retrieved = options.Cookies.GetCookieNamed("fish");
        Assert.That(retrieved, Is.Not.Null);
        Assert.That(retrieved.Expiry, Is.EqualTo(addCookie.Expiry), "Cookies are not equal");
    }

    [Test]
    [Ignore("Unable to open secure url")]
    [IgnoreBrowser(Browser.IE, "Browser does not handle untrusted SSL certificates.")]
    public void CanHandleSecureCookie()
    {
        Driver.Url = Urls.WhereIsSecure("animals");

        Cookie addedCookie = new ReturnedCookie("fish", "cod", null, "/common/animals", null, true, false, null);
        Driver.Manage().Cookies.AddCookie(addedCookie);

        Driver.Navigate().Refresh();

        Cookie retrieved = Driver.Manage().Cookies.GetCookieNamed("fish");
        Assert.That(retrieved, Is.Not.Null);
    }

    [Test]
    [Ignore("Unable to open secure url")]
    [IgnoreBrowser(Browser.IE, "Browser does not handle untrusted SSL certificates.")]
    public void ShouldRetainCookieSecure()
    {
        Driver.Url = Urls.WhereIsSecure("animals");

        ReturnedCookie addedCookie = new ReturnedCookie("fish", "cod", string.Empty, "/common/animals", null, true, false, null);

        Driver.Manage().Cookies.AddCookie(addedCookie);

        Driver.Navigate().Refresh();

        Cookie retrieved = Driver.Manage().Cookies.GetCookieNamed("fish");
        Assert.That(retrieved, Is.Not.Null);
        Assert.That(retrieved.Secure, "Secure attribute not set to true");
    }

    [Test]
    public void CanHandleHttpOnlyCookie()
    {
        StringBuilder url = new StringBuilder(Urls.WhereIs("cookie"));
        url.Append("?action=add");
        url.Append("&name=").Append("fish");
        url.Append("&value=").Append("cod");
        url.Append("&path=").Append("/common/animals");
        url.Append("&httpOnly=").Append("true");

        Driver.Url = url.ToString();

        Driver.Url = Urls.WhereIs("animals");
        Cookie retrieved = Driver.Manage().Cookies.GetCookieNamed("fish");
        Assert.That(retrieved, Is.Not.Null);
    }

    [Test]
    public void ShouldRetainHttpOnlyFlag()
    {
        StringBuilder url = new StringBuilder(Urls.WhereElseIs("cookie"));
        url.Append("?action=add");
        url.Append("&name=").Append("fish");
        url.Append("&value=").Append("cod");
        url.Append("&path=").Append("/common/animals");
        url.Append("&httpOnly=").Append("true");

        Driver.Url = url.ToString();

        Driver.Url = Urls.WhereElseIs("animals");

        Cookie retrieved = Driver.Manage().Cookies.GetCookieNamed("fish");
        Assert.That(retrieved, Is.Not.Null);
        Assert.That(retrieved.IsHttpOnly, "HttpOnly attribute not set to true");
    }

    [Test]
    public void SettingACookieThatExpiredInThePast()
    {
        DateTime expires = DateTime.Now.AddSeconds(-1000);
        Cookie cookie = new Cookie("expired", "yes", "/common/animals", expires);
        IOptions options = Driver.Manage();
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

        Driver.Manage().Cookies.AddCookie(cookie);

        AssertCookieHasValue(key, value);
    }

    [Test]
    public void DeleteNotExistedCookie()
    {
        String key = GenerateUniqueKey();
        AssertCookieIsNotPresentWithName(key);

        Driver.Manage().Cookies.DeleteCookieNamed(key);
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "IE does not want to set cookie")]
    public void DeleteAllCookiesDifferentUrls()
    {
        if (!CheckIsOnValidHostNameForCookieTests())
        {
            return;
        }

        Cookie cookie1 = new Cookie("fish1", "cod", Urls.HostName, null, null);
        Cookie cookie2 = new Cookie("fish2", "tune", Urls.AlternateHostName, null, null);

        string url1 = Urls.WhereIs("");
        string url2 = Urls.WhereElseIs("");

        IOptions options = Driver.Manage();

        options.Cookies.AddCookie(cookie1);
        AssertCookieIsPresentWithName(cookie1.Name);

        Driver.Url = url2;
        options.Cookies.AddCookie(cookie2);
        AssertCookieIsNotPresentWithName(cookie1.Name);
        AssertCookieIsPresentWithName(cookie2.Name);

        Driver.Url = url1;
        AssertCookieIsPresentWithName(cookie1.Name);
        AssertCookieIsNotPresentWithName(cookie2.Name);

        options.Cookies.DeleteAllCookies();
        AssertCookieIsNotPresentWithName(cookie1.Name);

        Driver.Url = url2;
        AssertCookieIsPresentWithName(cookie2.Name);
    }

    [Test]
    [TestCase(null)]
    [TestCase("")]
    [TestCase("   ")]
    public void ShouldThrowWhenGetInvalidCookieByName(string cookieName)
    {
        var getCookieAction = () => Driver.Manage().Cookies.GetCookieNamed(cookieName);

        Assert.That(getCookieAction, Throws.ArgumentException);
    }

    [Test]
    [TestCase(null)]
    [TestCase("")]
    [TestCase("   ")]
    public void ShouldThrowWhenDeleteInvalidCookieByName(string cookieName)
    {
        var deleteCookieAction = () => Driver.Manage().Cookies.DeleteCookieNamed(cookieName);

        Assert.That(deleteCookieAction, Throws.ArgumentException);
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

        Cookie cookie1 = new Cookie("fish", "cod", "/common/animals");
        Cookie cookie2 = new Cookie("planet", "earth", "/common/galaxy");

        IOptions options = Driver.Manage();
        ReadOnlyCollection<Cookie> count = options.Cookies.AllCookies;

        options.Cookies.AddCookie(cookie1);
        options.Cookies.AddCookie(cookie2);

        string url = Urls.WhereIs("animals");
        Driver.Url = url;
        ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;

        Assert.That(cookies, Does.Contain(cookie1));
        Assert.That(cookies, Does.Not.Contain(cookie2));

        Driver.Url = Urls.WhereIs("galaxy");
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
        IOptions options = Driver.Manage();
        options.Cookies.AddCookie(cookie1);

        string url = Urls.WhereElseIs("simpleTest.html");
        Driver.Url = url;

        Assert.That(options.Cookies.GetCookieNamed("fish"), Is.Null);
    }

    [Test]
    public void GetCookieDoesNotRetrieveBeyondCurrentDomain()
    {
        if (!CheckIsOnValidHostNameForCookieTests())
        {
            return;
        }

        Cookie cookie1 = new Cookie("fish", "cod");
        IOptions options = Driver.Manage();
        options.Cookies.AddCookie(cookie1);

        String url = Urls.WhereElseIs("");
        Driver.Url = url;

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
        string hostName = Urls.HostName;
        string[] hostNameParts = hostName.Split(new char[] { '.' });
        if (hostNameParts.Length < 3)
        {
            Assert.Ignore("Skipping test: Cookies can only be set on fully-qualified domain names.");
        }

        Driver.Url = Urls.MacbethPage;
        IOptions options = Driver.Manage();
        Cookie cookie = new Cookie("Homer", "Simpson", this.hostname, "/common", null);
        options.Cookies.AddCookie(cookie);
        ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
        Assert.That(cookies, Does.Contain(cookie), "Valid cookie was not returned");
    }

    [Test]
    public void ShouldNotShowCookieAddedToDifferentDomain()
    {
        if (!CheckIsOnValidHostNameForCookieTests())
        {
            Assert.Ignore("Not on a standard domain for cookies (localhost doesn't count).");
        }

        Driver.Url = Urls.MacbethPage;
        IOptions options = Driver.Manage();
        Cookie cookie = new Cookie("Bart", "Simpson", Urls.HostName + ".com", "/common", null);
        Assert.That(
            () => options.Cookies.AddCookie(cookie),
            Throws.InstanceOf<WebDriverException>().Or.InstanceOf<InvalidOperationException>());

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
        string hostName = Urls.HostName;
        string[] hostNameParts = hostName.Split(new char[] { '.' });
        if (hostNameParts.Length < 3)
        {
            Assert.Ignore("Skipping test: Cookies can only be set on fully-qualified domain names.");
        }

        Driver.Url = Urls.MacbethPage;
        IOptions options = Driver.Manage();
        Cookie cookie = new Cookie("Lisa", "Simpson", Urls.HostName, "/commonIDoNotExist", null);
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
        Driver.Url = "about:blank";

        IOptions options = Driver.Manage();
        Cookie cookie = new Cookie("question", "dunno");
        Assert.That(
            () => options.Cookies.AddCookie(cookie),
            Throws.InstanceOf<InvalidCookieDomainException>().Or.InstanceOf<InvalidOperationException>());
    }

    [Test]
    public void ShouldReturnNullBecauseCookieRetainsExpiry()
    {
        if (!CheckIsOnValidHostNameForCookieTests())
        {
            return;
        }

        Cookie addCookie = new Cookie("fish", "cod", "/common/animals", DateTime.Now.AddHours(-1));
        IOptions options = Driver.Manage();
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

        Driver.Url = Urls.MacbethPage;
        IOptions options = Driver.Manage();
        Cookie cookie = new Cookie("Marge", "Simpson", "/");
        options.Cookies.AddCookie(cookie);
        ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
        Assert.That(cookies, Does.Contain(cookie), "Valid cookie was not returned");
    }

    [Test]
    public void ShouldDeleteCookie()
    {
        if (!CheckIsOnValidHostNameForCookieTests())
        {
            return;
        }

        Driver.Url = Urls.MacbethPage;
        IOptions options = Driver.Manage();
        Cookie cookieToDelete = new Cookie("answer", "42");
        Cookie cookieToKeep = new Cookie("canIHaz", "Cheeseburguer");
        options.Cookies.AddCookie(cookieToDelete);
        options.Cookies.AddCookie(cookieToKeep);
        ReadOnlyCollection<Cookie> cookies = options.Cookies.AllCookies;
        options.Cookies.DeleteCookie(cookieToDelete);
        ReadOnlyCollection<Cookie> cookies2 = options.Cookies.AllCookies;
        Assert.That(cookies2, Does.Not.Contain(cookieToDelete), "Cookie was not deleted successfully");
        Assert.That(cookies2, Does.Contain(cookieToKeep), "Valid cookie was not returned");
    }

    //////////////////////////////////////////////
    // Support functions
    //////////////////////////////////////////////

    private void GotoValidDomainAndClearCookies(string page)
    {
        this.hostname = null;
        String hostname = Urls.HostName;
        if (IsValidHostNameForCookieTests(hostname))
        {
            this.isOnAlternativeHostName = false;
            this.hostname = hostname;
        }

        hostname = Urls.AlternateHostName;
        if (this.hostname == null && IsValidHostNameForCookieTests(hostname))
        {
            this.isOnAlternativeHostName = true;
            this.hostname = hostname;
        }

        GoToPage(page);

        Driver.Manage().Cookies.DeleteAllCookies();
        if (Driver.Manage().Cookies.AllCookies.Count != 0)
        {
            // If cookies are still present, restart the driver and try again.
            // This may mask some errors, where DeleteAllCookies doesn't fully
            // delete all it should, but that's a tradeoff we need to be willing
            // to make.
            Driver = EnvironmentManager.Instance.CreateFreshDriver();
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
        Driver.Url = this.isOnAlternativeHostName ? Urls.WhereElseIs(pageName) : Urls.WhereIs(pageName);
    }

    private void GoToOtherPage(String pageName)
    {
        Driver.Url = this.isOnAlternativeHostName ? Urls.WhereIs(pageName) : Urls.WhereElseIs(pageName);
    }

    private bool IsValidHostNameForCookieTests(string hostname)
    {
        // TODO(JimEvan): Some coverage is better than none, so we
        // need to ignore the fact that localhost cookies are problematic.
        // Re-enable this when we have a better solution per DanielWagnerHall.
        // ChromeDriver2 has trouble with localhost. IE and Firefox don't.
        // return !IsIpv4Address(hostname) && "localhost" != hostname;
        bool isLocalHostOkay = !("localhost" == hostname && !TestUtilities.IsInternetExplorer(Driver));

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
        if (Driver is not IJavaScriptExecutor jsDriver)
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
        Assert.That(Driver.Manage().Cookies.AllCookies, Is.Empty, "Cookies were not empty");
        string documentCookie = GetDocumentCookieOrNull();
        if (documentCookie != null)
        {
            Assert.That(documentCookie, Is.Empty, "Cookies were not empty");
        }
    }

    private void AssertSomeCookiesArePresent()
    {
        Assert.That(Driver.Manage().Cookies.AllCookies, Is.Not.Empty, "Cookies were empty");
        String documentCookie = GetDocumentCookieOrNull();
        if (documentCookie != null)
        {
            Assert.That(documentCookie, Is.Not.Empty, "Cookies were empty");
        }
    }

    private void AssertCookieIsNotPresentWithName(string key)
    {
        Assert.That(Driver.Manage().Cookies.GetCookieNamed(key), Is.Null, "Cookie was present with name " + key);
        string documentCookie = GetDocumentCookieOrNull();
        if (documentCookie != null)
        {
            Assert.That(documentCookie, Does.Not.Contain(key + "="));
        }
    }

    private void AssertCookieIsPresentWithName(string key)
    {
        Assert.That(Driver.Manage().Cookies.GetCookieNamed(key), Is.Not.Null, "Cookie was present with name " + key);
        string documentCookie = GetDocumentCookieOrNull();
        if (documentCookie != null)
        {
            Assert.That(documentCookie, Does.Contain(key + "="));
        }
    }

    private void AssertCookieHasValue(string key, string value)
    {
        Assert.That(Driver.Manage().Cookies.GetCookieNamed(key).Value, Is.EqualTo(value), "Cookie had wrong value");
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
