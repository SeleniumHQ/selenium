using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class FrameSwitchingTest : DriverTestFixture
    {
        [Test]
        public void ShouldContinueToReferToTheSameFrameOnceItHasBeenSelected()
        {
            driver.Url = framesetPage;

            driver.SwitchTo().Frame(2);
            IWebElement checkbox = driver.FindElement(By.XPath("//input[@name='checky']"));
            checkbox.Toggle();
            checkbox.Submit();

            Assert.AreEqual(driver.FindElement(By.XPath("//p")).Text, "Success!");
        }

        [Test]
        public void ShouldAutomaticallyUseTheFirstFrameOnAPage()
        {
            driver.Url = framesetPage;

            // Notice that we've not switched to the 0th frame
            IWebElement pageNumber = driver.FindElement(By.XPath("//span[@id='pageNumber']"));
            Assert.AreEqual(pageNumber.Text.Trim(), "1");
        }

        [Test]
        public void ShouldFocusOnTheReplacementWhenAFrameFollowsALinkToA_TopTargettedPage()
        {
            driver.Url = framesetPage;

            driver.FindElement(By.LinkText("top")).Click();
            //TODO (jimevan): this is an ugly sleep. Remove when implicit waiting is implemented.
            System.Threading.Thread.Sleep(1000);

            Assert.AreEqual("XHTML Test Page", driver.Title);
            Assert.AreEqual("XHTML Test Page", driver.FindElement(By.XPath("/html/head/title")).Text);
        }

        [Test]
        public void ShouldNotAutomaticallySwitchFocusToAnIFrameWhenAPageContainingThemIsLoaded()
        {
            driver.Url = iframePage;
            driver.FindElement(By.Id("iframe_page_heading"));
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
        [IgnoreBrowser(Browser.Chrome, "Can't execute script in iframe, track crbug 20773")]
        public void ShouldAllowTheUserToSwitchToAnIFrameAndRemainFocusedOnIt()
        {
            driver.Url = iframePage;
            driver.SwitchTo().Frame(0);

            driver.FindElement(By.Id("submitButton")).Click();
            //TODO (jimevan): this is an ugly sleep. Remove when implicit waiting is implemented.
            System.Threading.Thread.Sleep(500);
            String hello = driver.FindElement(By.Id("greeting")).Text;
            Assert.AreEqual(hello, "Success!");
        }

        [Test]
        public void ShouldBeAbleToClickInAFrame()
        {
            driver.Url = framesetPage;
            driver.SwitchTo().Frame("third");

            driver.FindElement(By.Id("submitButton")).Click();
            //TODO (jimevan): this is an ugly sleep. Remove when implicit waiting is implemented.
            System.Threading.Thread.Sleep(500);
            String hello = driver.FindElement(By.Id("greeting")).Text;
            Assert.AreEqual(hello, "Success!");
            driver.SwitchTo().DefaultContent();
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        public void ShouldBeAbleToClickInASubFrame()
        {
            driver.Url = framesetPage;
            driver.SwitchTo().Frame("sixth.iframe1");

            // This should replaxe frame "iframe1" inside frame "sixth" ...
            driver.FindElement(By.Id("submitButton")).Click();
            //TODO (jimevan): this is an ugly sleep. Remove when implicit waiting is implemented.
            System.Threading.Thread.Sleep(500);

            // driver should still be focused on frame "iframe1" inside frame "sixth" ...
            String hello = driver.FindElement(By.Id("greeting")).Text;
            Assert.AreEqual(hello, "Success!");

            // Make sure it was really frame "iframe1" inside frame "sixth" which was replaced ...
            driver.SwitchTo().DefaultContent().SwitchTo().Frame("sixth.iframe1");
            hello = driver.FindElement(By.Id("greeting")).Text;
            Assert.AreEqual(hello, "Success!");
        }

        [Test]
        public void ShouldBeAbleToSelectAFrameByName()
        {
            driver.Url = framesetPage;

            driver.SwitchTo().Frame("second");
            Assert.AreEqual(driver.FindElement(By.Id("pageNumber")).Text, "2");

            driver.SwitchTo().Frame("third");
            driver.FindElement(By.Id("changeme")).Select();

            driver.SwitchTo().Frame("second");
            Assert.AreEqual(driver.FindElement(By.Id("pageNumber")).Text, "2");
        }

        [Test]
        public void ShouldSelectChildFramesByUsingADotSeparatedString()
        {
            driver.Url = framesetPage;

            driver.SwitchTo().Frame("fourth.child2");
            Assert.AreEqual(driver.FindElement(By.Id("pageNumber")).Text, "11");
        }

        [Test]
        public void ShouldSwitchToChildFramesTreatingNumbersAsIndex()
        {
            driver.Url = framesetPage;

            driver.SwitchTo().Frame("fourth.1");
            Assert.AreEqual(driver.FindElement(By.Id("pageNumber")).Text, "11");
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox, "Frame parsing issue with both parent and child as indexes")]
        public void ShouldSwitchToChildFramesTreatingParentAndChildNumbersAsIndex()
        {
            driver.Url = framesetPage;

            driver.SwitchTo().Frame("3.1");
            Assert.AreEqual(driver.FindElement(By.Id("pageNumber")).Text, "11");
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome)]
        [ExpectedException(typeof(NoSuchFrameException))]
        public void ShouldThrowFrameNotFoundExceptionLookingUpSubFramesWithSuperFrameNames()
        {
            driver.Url = framesetPage;
            driver.SwitchTo().Frame("fourth.second");

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

        [Test]
        public void ShouldBeAbleToFindElementsInIframesByName()
        {
            driver.Url = iframePage;

            driver.SwitchTo().Frame("iframe1");
            IWebElement element = driver.FindElement(By.Name("id-name1"));

            Assert.IsNotNull(element);
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

            String url = EnvironmentManager.Instance.UrlBuilder.WhereIs("page/2");
            Assert.AreEqual(driver.Url, (url + "?title=Fish"));

            url = EnvironmentManager.Instance.UrlBuilder.WhereIs("iframes.html");
            driver.Url = iframePage;
            Assert.AreEqual(driver.Url, url);

            url = EnvironmentManager.Instance.UrlBuilder.WhereIs("formPage.html");
            driver.SwitchTo().Frame("iframe1");
            Assert.AreEqual(driver.Url, url);
        }
    }
}
