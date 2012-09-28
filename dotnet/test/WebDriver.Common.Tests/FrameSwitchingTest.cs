using System;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class FrameSwitchingTest : DriverTestFixture
    {
        // ----------------------------------------------------------------------------------------------
        //
        // Tests that WebDriver doesn't do anything fishy when it navigates to a page with frames.
        //
        // ----------------------------------------------------------------------------------------------

        [Test]
        public void ShouldAlwaysFocusOnTheTopMostFrameAfterANavigationEvent()
        {
            driver.Url = framesetPage;
            IWebElement element = driver.FindElement(By.TagName("frameset"));
            Assert.IsNotNull(element);
        }

        [Test]
        public void ShouldNotAutomaticallySwitchFocusToAnIFrameWhenAPageContainingThemIsLoaded()
        {
            driver.Url = iframePage;
            driver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromSeconds(1));
            IWebElement element = driver.FindElement(By.Id("iframe_page_heading"));
            Assert.IsNotNull(element);
        }

        // ----------------------------------------------------------------------------------------------
        //
        // Tests that WebDriver can switch to frames as expected.
        //
        // ----------------------------------------------------------------------------------------------

        [Test]
        public void ShouldBeAbleToSwitchToAFrameByItsIndex()
        {
            driver.Url = framesetPage;
            driver.SwitchTo().Frame(1);

            Assert.AreEqual("2", driver.FindElement(By.Id("pageNumber")).Text);
        }

        [Test]
        public void ShouldBeAbleToSwitchToAnIframeByItsIndex()
        {
            driver.Url = iframePage;
            driver.SwitchTo().Frame(0);

            Assert.AreEqual("name", driver.FindElement(By.Name("id-name1")).GetAttribute("value"));
        }

        [Test]
        public void ShouldBeAbleToSwitchToAFrameByItsName()
        {
            driver.Url = framesetPage;
            driver.SwitchTo().Frame("fourth");
            Assert.AreEqual("child1", driver.FindElement(By.TagName("frame")).GetAttribute("name"));

        }

        [Test]
        public void ShouldBeAbleToSwitchToAnIframeByItsName()
        {
            driver.Url = iframePage;
            driver.SwitchTo().Frame("iframe1-name");
            Assert.AreEqual("name", driver.FindElement(By.Name("id-name1")).GetAttribute("value"));

        }

        [Test]
        public void ShouldBeAbleToSwitchToAFrameByItsID()
        {
            driver.Url = framesetPage;
            driver.SwitchTo().Frame("fifth");
            Assert.AreEqual("Open new window", driver.FindElement(By.Name("windowOne")).Text);

        }

        [Test]
        public void ShouldBeAbleToSwitchToAnIframeByItsID()
        {
            driver.Url = iframePage;
            driver.SwitchTo().Frame("iframe1");
            Assert.AreEqual("name", driver.FindElement(By.Name("id-name1")).GetAttribute("value"));
        }

        [Test]
        public void ShouldBeAbleToSwitchToFrameWithNameContainingDot()
        {
            driver.Url = framesetPage;
            driver.SwitchTo().Frame("sixth.iframe1");
            Assert.IsTrue(driver.FindElement(By.TagName("body")).Text.Contains("Page number 3"));
        }

        [Test]
        public void ShouldBeAbleToSwitchToAFrameUsingAPreviouslyLocatedWebElement()
        {
            driver.Url = framesetPage;
            IWebElement frame = driver.FindElement(By.TagName("frame"));
            driver.SwitchTo().Frame(frame);
            Assert.AreEqual("1", driver.FindElement(By.Id("pageNumber")).Text);
        }

        [Test]
        public void ShouldBeAbleToSwitchToAnIFrameUsingAPreviouslyLocatedWebElement()
        {
            driver.Url = iframePage;
            IWebElement frame = driver.FindElement(By.TagName("iframe"));
            driver.SwitchTo().Frame(frame);
            Assert.AreEqual("name", driver.FindElement(By.Name("id-name1")).GetAttribute("value"));

        }

        [Test]
        [ExpectedException(typeof(NoSuchFrameException))]
        public void ShouldEnsureElementIsAFrameBeforeSwitching()
        {
            driver.Url = framesetPage;
            IWebElement frame = driver.FindElement(By.TagName("frameset"));
            driver.SwitchTo().Frame(frame);
        }

        [Test]
        public void FrameSearchesShouldBeRelativeToTheCurrentlySelectedFrame()
        {
            driver.Url = framesetPage;

            driver.SwitchTo().Frame("second");
            Assert.AreEqual("2", driver.FindElement(By.Id("pageNumber")).Text);

            try
            {
                driver.SwitchTo().Frame("third");
                Assert.Fail();
            }
            catch (NoSuchFrameException)
            {
                // Do nothing
            }

            driver.SwitchTo().DefaultContent();
            driver.SwitchTo().Frame("third");

            try
            {
                driver.SwitchTo().Frame("second");
                Assert.Fail();
            }
            catch (NoSuchFrameException)
            {
                // Do nothing
            }

            driver.SwitchTo().DefaultContent();
            driver.SwitchTo().Frame("second");
            Assert.AreEqual("2", driver.FindElement(By.Id("pageNumber")).Text);
        }

        [Test]
        public void ShouldSelectChildFramesByChainedCalls()
        {
            driver.Url = framesetPage;
            driver.SwitchTo().Frame("fourth").SwitchTo().Frame("child2");
            Assert.AreEqual("11", driver.FindElement(By.Id("pageNumber")).Text);
        }

        [Test]
        [ExpectedException(typeof(NoSuchFrameException))]
        public void ShouldThrowFrameNotFoundExceptionLookingUpSubFramesWithSuperFrameNames()
        {
            driver.Url = framesetPage;
            driver.SwitchTo().Frame("fourth");
            driver.SwitchTo().Frame("second");

        }

        [Test]
        [ExpectedException(typeof(NoSuchFrameException))]
        public void ShouldThrowAnExceptionWhenAFrameCannotBeFound()
        {
            driver.Url = xhtmlTestPage;
            driver.SwitchTo().Frame("Nothing here");
        }

        [Test]
        [ExpectedException(typeof(NoSuchFrameException))]
        public void ShouldThrowAnExceptionWhenAFrameCannotBeFoundByIndex()
        {
            driver.Url = xhtmlTestPage;
            driver.SwitchTo().Frame(27);
        }

        // ----------------------------------------------------------------------------------------------
        //
        // General frame handling behavior tests
        //
        // ----------------------------------------------------------------------------------------------
        [Test]
        public void ShouldContinueToReferToTheSameFrameOnceItHasBeenSelected()
        {
            driver.Url = framesetPage;

            driver.SwitchTo().Frame(2);
            IWebElement checkbox = driver.FindElement(By.XPath("//input[@name='checky']"));
            checkbox.Click();
            checkbox.Submit();

            Assert.AreEqual("Success!", driver.FindElement(By.XPath("//p")).Text);
        }

        [Test]
        public void ShouldFocusOnTheReplacementWhenAFrameFollowsALinkToA_TopTargettedPage()
        {
            driver.Url = framesetPage;

            driver.SwitchTo().Frame(0);
            driver.FindElement(By.LinkText("top")).Click();

            // TODO(simon): Avoid going too fast when native events are there.
            System.Threading.Thread.Sleep(1000);
            Assert.AreEqual("XHTML Test Page", driver.Title);
            Assert.AreEqual("XHTML Test Page", driver.FindElement(By.XPath("/html/head/title")).Text);
        }

        [Test]
        public void ShouldAllowAUserToSwitchFromAnIframeBackToTheMainContentOfThePage()
        {
            driver.Url = iframePage;
            driver.SwitchTo().Frame(0);

            driver.SwitchTo().DefaultContent();
            driver.FindElement(By.Id("iframe_page_heading"));
        }


        [Test]
        public void ShouldAllowTheUserToSwitchToAnIFrameAndRemainFocusedOnIt()
        {
            driver.Url = iframePage;
            driver.SwitchTo().Frame(0);

            driver.FindElement(By.Id("submitButton")).Click();

            string hello = GetTextOfGreetingElement();
            Assert.AreEqual(hello, "Success!");
        }

        [Test]
        public void ShouldBeAbleToClickInAFrame()
        {
            driver.Url = framesetPage;
            driver.SwitchTo().Frame("third");

            // This should replace frame "third" ...
            driver.FindElement(By.Id("submitButton")).Click();

            // driver should still be focused on frame "third" ...
            Assert.AreEqual("Success!", GetTextOfGreetingElement());

            // Make sure it was really frame "third" which was replaced ...
            driver.SwitchTo().DefaultContent().SwitchTo().Frame("third");
            Assert.AreEqual("Success!", GetTextOfGreetingElement());
        }

        [Test]
        [IgnoreBrowser(Browser.HtmlUnit)]
        public void ShouldBeAbleToClickInASubFrame()
        {
            driver.Url = framesetPage;
            driver.SwitchTo().Frame("sixth").SwitchTo().Frame("iframe1");

            // This should replaxe frame "iframe1" inside frame "sixth" ...
            driver.FindElement(By.Id("submitButton")).Click();

            driver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromMilliseconds(500));
            // driver should still be focused on frame "iframe1" inside frame "sixth" ...
            Assert.AreEqual("Success!", GetTextOfGreetingElement());

            // Make sure it was really frame "iframe1" inside frame "sixth" which was replaced ...
            driver.SwitchTo().DefaultContent().SwitchTo().Frame("sixth").SwitchTo().Frame("iframe1");
            Assert.AreEqual("Success!", driver.FindElement(By.Id("greeting")).Text);
        }

        [Test]
        [NeedsFreshDriver(AfterTest = true)]
        public void ClosingTheFinalBrowserWindowShouldNotCauseAnExceptionToBeThrown()
        {
            driver.Url = simpleTestPage;
            driver.Close();
        }

        [Test]
        public void ShouldBeAbleToFlipToAFrameIdentifiedByItsId()
        {
            driver.Url = framesetPage;

            driver.SwitchTo().Frame("fifth");
            driver.FindElement(By.Id("username"));
        }

        [Test]
        public void ShouldBeAbleToFindElementsInIframesByXPath()
        {
            driver.Url = iframePage;

            driver.SwitchTo().Frame("iframe1");

            IWebElement element = driver.FindElement(By.XPath("//*[@id = 'changeme']"));

            Assert.IsNotNull(element);
        }

        [Test]
        public void GetCurrentUrl()
        {
            driver.Url = framesetPage;

            driver.SwitchTo().Frame("second");
            string url = EnvironmentManager.Instance.UrlBuilder.WhereIs("page/2");
            Assert.AreEqual(url + "?title=Fish", driver.Url);

            url = EnvironmentManager.Instance.UrlBuilder.WhereIs("iframes.html");
            driver.Url = iframePage;
            Assert.AreEqual(url, driver.Url);


            url = EnvironmentManager.Instance.UrlBuilder.WhereIs("formPage.html");
            driver.SwitchTo().Frame("iframe1");
            Assert.AreEqual(url, driver.Url);
        }

        [Test]
        [IgnoreBrowser(Browser.PhantomJS, "Causes browser to exit")]
        public void ShouldBeAbleToCarryOnWorkingIfTheFrameIsDeletedFromUnderUs()
        {
            driver.Url = deletingFrame;
            driver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromMilliseconds(1000));
            driver.SwitchTo().Frame("iframe1");

            IWebElement killIframe = driver.FindElement(By.Id("killIframe"));
            killIframe.Click();

            bool frameExists = true;
            DateTime timeout = DateTime.Now.Add(TimeSpan.FromMilliseconds(4000));
            while (DateTime.Now < timeout)
            {
                try
                {
                    driver.SwitchTo().Frame("iframe1");
                }
                catch (NoSuchFrameException)
                {
                    frameExists = false;
                    break;
                }
            }

            Assert.IsFalse(frameExists);

            driver.SwitchTo().DefaultContent();
            IWebElement addIFrame = driver.FindElement(By.Id("addBackFrame"));
            addIFrame.Click();

            timeout = DateTime.Now.Add(TimeSpan.FromMilliseconds(4000));
            while (DateTime.Now < timeout)
            {
                try
                {
                    driver.SwitchTo().Frame("iframe1");
                    break;
                }
                catch (NoSuchFrameException)
                {
                }
            }

            try
            {
                driver.FindElement(By.Id("checkbox"));
            }
            catch (WebDriverException)
            {
                Assert.Fail("Could not find element after switching frame");
            }
        }

        [Test]
        public void ShouldReturnWindowTitleInAFrameset()
        {
            driver.Url = framesetPage;
            driver.SwitchTo().Frame("third");
            Assert.AreEqual("Unique title", driver.Title);
        }

        [Test]
        public void JavaScriptShouldExecuteInTheContextOfTheCurrentFrame()
        {
            IJavaScriptExecutor executor = driver as IJavaScriptExecutor;

            driver.Url = framesetPage;
            Assert.IsTrue((bool)executor.ExecuteScript("return window == window.top"));

            driver.SwitchTo().Frame("third");
            Assert.IsTrue((bool)executor.ExecuteScript("return window != window.top"));
        }

        // ----------------------------------------------------------------------------------------------
        //
        // Frame handling behavior tests not included in Java tests
        //
        // ----------------------------------------------------------------------------------------------

        [Test]
        public void ShouldBeAbleToSelectAFrameByName()
        {
            driver.Url = framesetPage;

            driver.SwitchTo().Frame("second");
            Assert.AreEqual(driver.FindElement(By.Id("pageNumber")).Text, "2");

            driver.SwitchTo().DefaultContent().SwitchTo().Frame("third");
            driver.FindElement(By.Id("changeme")).Click();

            driver.SwitchTo().DefaultContent().SwitchTo().Frame("second");
            Assert.AreEqual(driver.FindElement(By.Id("pageNumber")).Text, "2");
        }

        [Test]
        public void ShouldBeAbleToFindElementsInIframesByName()
        {
            driver.Url = iframePage;

            driver.SwitchTo().Frame("iframe1");
            IWebElement element = driver.FindElement(By.Name("id-name1"));

            Assert.IsNotNull(element);
        }

        private string GetTextOfGreetingElement()
        {
            string text = string.Empty;
            DateTime end = DateTime.Now.Add(TimeSpan.FromMilliseconds(3000));
            while (DateTime.Now < end)
            {
                try
                {
                    IWebElement element = driver.FindElement(By.Id("greeting"));
                    text = element.Text;
                    break;
                }
                catch (NoSuchElementException)
                {
                }
            }

            return text;
        }
    }
}
