using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ObjectStateAssumptionsTest : DriverTestFixture
    {
        [Test]
        public void UninitializedWebDriverDoesNotThrowException()
        {
            variousMethodCallsToCheckAssumptions();
        }

        /**
        * This test case differs from @see testUninitializedWebDriverDoesNotThrowNPE as it initializes
        * WebDriver with an initial call to get(). It also should not fail.
        */
        [Test]
        public void InitializedWebDriverDoesNotThrowException()
        {
            driver.Url = simpleTestPage;
            variousMethodCallsToCheckAssumptions();
        }

        /**
        * Test the various options, again for an uninitialized driver, NPEs are thrown.
        */
        [Test]
        public void OptionsForUninitializedWebDriverDoesNotThrowException()
        {
            IOptions options = driver.Manage();
            ReadOnlyCollection<Cookie> allCookies = options.Cookies.AllCookies;
        }

        /**
        * Add the various method calls you want to try here...
        */
        private void variousMethodCallsToCheckAssumptions()
        {
            string currentUrl = driver.Url;
            string currentTitle = driver.Title;
            string pageSource = driver.PageSource;
            By byHtml = By.XPath("//html");
            driver.FindElement(byHtml);
            driver.FindElements(byHtml);
        }
    }
}
