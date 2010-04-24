using NUnit.Framework;
using OpenQA.Selenium.Environment;
using System;

namespace OpenQA.Selenium
{
    
    public abstract class DriverTestFixture
    {
        public string macbethPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("macbeth.html");
        public string macbethTitle = "Macbeth: Entire Play";

        public string simpleTestPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("simpleTest.html");
        public string simpleTestTitle = "Hello WebDriver";

        public string framesPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("win32frameset.html");
        public string framesTitle = "This page has frames";

        public string iframesPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("iframes.html");
        public string iframesTitle = "This page has iframes";

        public string formsPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("formPage.html");
        public string formsTitle = "We Leave From Here";

        public string javascriptPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("javascriptPage.html");

        public string resultPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("resultPage.html");

        public string nestedPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("nestedElements.html");

        public string xhtmlTestPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("xhtmlTest.html");

        public string richTextPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("rich_text.html");

        public string dragAndDropPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("dragAndDropTest.html");

        public string framesetPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("frameset.html");
        public string iframePage = EnvironmentManager.Instance.UrlBuilder.WhereIs("iframes.html");
        public string metaRedirectPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("meta-redirect.html");
        public string redirectPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("redirect");
        public string rectanglesPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("rectangles.html");
        public string javascriptEnhancedForm = EnvironmentManager.Instance.UrlBuilder.WhereIs("javascriptEnhancedForm.html");
        public string uploadPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("upload.html");
        public string childPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("child/childPage.html");
        public string grandchildPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("child/grandchild/grandchildPage.html");
        public string documentWrite = EnvironmentManager.Instance.UrlBuilder.WhereElseIs("document_write_in_onload.html");
        public string chinesePage = EnvironmentManager.Instance.UrlBuilder.WhereIs("cn-test.html");
        public string svgPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("svgPiechart.xhtml");
        public string dynamicPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("dynamic.html");

        protected IWebDriver driver;

        public IWebDriver DriverInstance
        {
            get { return driver; }
            set { driver = value; }
        }

        [TestFixtureSetUp]
        public void SetUp()
        {
            driver = EnvironmentManager.Instance.GetCurrentDriver();
        }

        [TestFixtureTearDown]
        public void TearDown()
        {
            // EnvironmentManager.Instance.CloseCurrentDriver();
        }
        
        /*
         *  Exists because a given test might require a fresh driver
         */
        protected void CreateFreshDriver()
        {
            driver = EnvironmentManager.Instance.CreateFreshDriver();
        }

        protected bool IsIeDriverTimedOutException(Exception e)
        {
            // The IE driver may throw a timed out exception
            return e.GetType().Name.Contains("TimedOutException");
        }
    }
}
