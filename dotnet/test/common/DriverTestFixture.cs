using NUnit.Framework;
using OpenQA.Selenium.Environment;
using System;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium
{
    public abstract class DriverTestFixture
    {
        public string alertsPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("alerts.html");
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

        public string clickEventPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("clickEventPage.html");

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
        public string transparentUploadPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("transparentUpload.html");
        public string childPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("child/childPage.html");
        public string grandchildPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("child/grandchild/grandchildPage.html");
        public string documentWrite = EnvironmentManager.Instance.UrlBuilder.WhereElseIs("document_write_in_onload.html");
        public string chinesePage = EnvironmentManager.Instance.UrlBuilder.WhereIs("cn-test.html");
        public string svgPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("svgPiechart.xhtml");
        public string dynamicPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("dynamic.html");
        public string tables = EnvironmentManager.Instance.UrlBuilder.WhereIs("tables.html");
        public string deletingFrame = EnvironmentManager.Instance.UrlBuilder.WhereIs("frame_switching_tests/deletingFrame.html");
        public string ajaxyPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("ajaxy_page.html");
        public string sleepingPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("sleep");
        public string slowIframes = EnvironmentManager.Instance.UrlBuilder.WhereIs("slow_loading_iframes.html");
        public string draggableLists = EnvironmentManager.Instance.UrlBuilder.WhereIs("draggableLists.html");
        public string droppableItems = EnvironmentManager.Instance.UrlBuilder.WhereIs("droppableItems.html");
        public string bodyTypingPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("bodyTypingTest.html");
        public string formSelectionPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("formSelectionPage.html");
        public string selectableItemsPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("selectableItems.html");
        public string underscorePage = EnvironmentManager.Instance.UrlBuilder.WhereIs("underscore.html");
        public string clickJackerPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_jacker.html");
        public string errorsPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("errors.html");
        public string selectPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("selectPage.html");
        public string simpleXmlDocument = EnvironmentManager.Instance.UrlBuilder.WhereIs("simple.xml");
        public string mapVisibilityPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("map_visibility.html");
        public string mouseTrackerPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("mousePositionTracker.html");
        public string mouseOverPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("mouseOver.html");
        public string readOnlyPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("readOnlyPage.html");
        public string clicksPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("clicks.html");
        public string booleanAttributes = EnvironmentManager.Instance.UrlBuilder.WhereIs("booleanAttributes.html");
        public string linkedImage = EnvironmentManager.Instance.UrlBuilder.WhereIs("linked_image.html");
        public string xhtmlFormPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("xhtmlFormPage.xhtml");
        public string svgTestPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("svgTest.svg");
        public string slowLoadingAlertPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("slowLoadingAlert.html");
        public string dragDropOverflowPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("dragDropOverflow.html");
        public string missedJsReferencePage = EnvironmentManager.Instance.UrlBuilder.WhereIs("missedJsReference.html");
        public string authenticationPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("basicAuth");
        public string html5Page = EnvironmentManager.Instance.UrlBuilder.WhereIs("html5Page.html");

        protected IWebDriver driver;

        public IWebDriver DriverInstance
        {
            get { return driver; }
            set { driver = value; }
        }

        public bool IsNativeEventsEnabled
        {
            get
            {
                IHasCapabilities capabilitiesDriver = driver as IHasCapabilities;
                if (capabilitiesDriver != null && capabilitiesDriver.Capabilities.HasCapability(CapabilityType.HasNativeEvents) && (bool)capabilitiesDriver.Capabilities.GetCapability(CapabilityType.HasNativeEvents))
                {
                    return true;
                }

                return false;
            }
        }

        [OneTimeSetUp]
        public void SetUp()
        {
            driver = EnvironmentManager.Instance.GetCurrentDriver();
        }

        [OneTimeTearDown]
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

        protected bool WaitFor(Func<bool> waitFunction, string timeoutMessage)
        {
            return WaitFor<bool>(waitFunction, timeoutMessage);
        }

        protected T WaitFor<T>(Func<T> waitFunction, string timeoutMessage)
        {
            return this.WaitFor<T>(waitFunction, TimeSpan.FromSeconds(5), timeoutMessage);
        }

        protected T WaitFor<T>(Func<T> waitFunction, TimeSpan timeout, string timeoutMessage)
        {
            DateTime endTime = DateTime.Now.Add(timeout);
            T value = default(T);
            Exception lastException = null;
            while (DateTime.Now < endTime)
            {
                try
                {
                    value = waitFunction();
                    if (typeof(T) == typeof(bool))
                    {
                        if ((bool)(object)value)
                        {
                            return value;
                        }
                    }
                    else if (value != null)
                    {
                        return value;
                    }

                    System.Threading.Thread.Sleep(100);
                }
                catch (Exception e)
                {
                    // Swallow for later re-throwing
                    lastException = e;
                }
            }

            if (lastException != null)
            {
                throw new WebDriverException("Operation timed out", lastException);
            }

            Assert.Fail("Condition timed out: " + timeoutMessage);
            return default(T);
        }
    }
}
