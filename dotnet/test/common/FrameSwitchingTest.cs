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
            Assert.That(element, Is.Not.Null);
        }

        [Test]
        public void ShouldNotAutomaticallySwitchFocusToAnIFrameWhenAPageContainingThemIsLoaded()
        {
            driver.Url = iframePage;
            driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(1);
            IWebElement element = driver.FindElement(By.Id("iframe_page_heading"));
            driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(0);
            Assert.That(element, Is.Not.Null);
        }

        [Test]
        public void ShouldOpenPageWithBrokenFrameset()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("framesetPage3.html");

            IWebElement frame1 = driver.FindElement(By.Id("first"));
            driver.SwitchTo().Frame(frame1);

            driver.SwitchTo().DefaultContent();

            IWebElement frame2 = driver.FindElement(By.Id("second"));

            try
            {
                driver.SwitchTo().Frame(frame2);
            }
            catch (WebDriverException)
            {
                // IE9 can not switch to this broken frame - it has no window.
            }
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
            Assert.That(driver.FindElement(By.TagName("body")).Text, Does.Contain("Page number 3"));
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
        public void ShouldEnsureElementIsAFrameBeforeSwitching()
        {
            driver.Url = framesetPage;
            IWebElement frame = driver.FindElement(By.TagName("frameset"));
            Assert.That(() => driver.SwitchTo().Frame(frame), Throws.InstanceOf<NoSuchFrameException>());
        }

        [Test]
        public void FrameSearchesShouldBeRelativeToTheCurrentlySelectedFrame()
        {
            driver.Url = framesetPage;

            IWebElement frameElement = WaitFor(() => driver.FindElement(By.Name("second")), "did not find frame");
            driver.SwitchTo().Frame(frameElement);
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
        public void ShouldThrowFrameNotFoundExceptionLookingUpSubFramesWithSuperFrameNames()
        {
            driver.Url = framesetPage;
            driver.SwitchTo().Frame("fourth");
            Assert.That(() => driver.SwitchTo().Frame("second"), Throws.InstanceOf<NoSuchFrameException>());

        }

        [Test]
        public void ShouldThrowAnExceptionWhenAFrameCannotBeFound()
        {
            driver.Url = xhtmlTestPage;
            Assert.That(() => driver.SwitchTo().Frame("Nothing here"), Throws.InstanceOf<NoSuchFrameException>());
        }

        [Test]
        public void ShouldThrowAnExceptionWhenAFrameCannotBeFoundByIndex()
        {
            driver.Url = xhtmlTestPage;
            Assert.That(() => driver.SwitchTo().Frame(27), Throws.InstanceOf<NoSuchFrameException>());
        }

        [Test]
        public void ShouldBeAbleToSwitchToParentFrame()
        {
            driver.Url = framesetPage;
            driver.SwitchTo().Frame("fourth").SwitchTo().ParentFrame().SwitchTo().Frame("first");
            Assert.AreEqual("1", driver.FindElement(By.Id("pageNumber")).Text);
        }

        [Test]
        public void ShouldBeAbleToSwitchToParentFrameFromASecondLevelFrame()
        {
            driver.Url = framesetPage;

            driver.SwitchTo().Frame("fourth").SwitchTo().Frame("child1").SwitchTo().ParentFrame().SwitchTo().Frame("child2");
            Assert.AreEqual("11", driver.FindElement(By.Id("pageNumber")).Text);
        }

        [Test]
        public void SwitchingToParentFrameFromDefaultContextIsNoOp()
        {
            driver.Url = xhtmlTestPage;
            driver.SwitchTo().ParentFrame();
            Assert.AreEqual("XHTML Test Page", driver.Title);
        }

        [Test]
        public void ShouldBeAbleToSwitchToParentFromAnIframe()
        {
            driver.Url = iframePage;
            driver.SwitchTo().Frame(0);

            driver.SwitchTo().ParentFrame();
            driver.FindElement(By.Id("iframe_page_heading"));
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
            WaitFor(() => driver.FindElement(By.XPath("//p")).Text == "Success!", "result element not found");
        }

        [Test]
        public void ShouldFocusOnTheReplacementWhenAFrameFollowsALinkToA_TopTargettedPage()
        {
            driver.Url = framesetPage;

            driver.SwitchTo().Frame(0);
            driver.FindElement(By.LinkText("top")).Click();

            WaitFor(() => { return driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
            Assert.AreEqual("XHTML Test Page", driver.Title);
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
        public void ShouldBeAbleToClickInAFrameThatRewritesTopWindowLocation()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_tests/issue5237.html");
            driver.SwitchTo().Frame("search");
            driver.FindElement(By.Id("submit")).Click();
            driver.SwitchTo().DefaultContent();
            WaitFor(() => { return driver.Title == "Target page for issue 5237"; }, "Browser title was not 'Target page for issue 5237'");
        }

        [Test]
        public void ShouldBeAbleToClickInASubFrame()
        {
            driver.Url = framesetPage;
            driver.SwitchTo().Frame("sixth").SwitchTo().Frame("iframe1");

            // This should replaxe frame "iframe1" inside frame "sixth" ...
            driver.FindElement(By.Id("submitButton")).Click();

            // driver should still be focused on frame "iframe1" inside frame "sixth" ...
            Assert.AreEqual("Success!", GetTextOfGreetingElement());

            // Make sure it was really frame "iframe1" inside frame "sixth" which was replaced ...
            driver.SwitchTo().DefaultContent().SwitchTo().Frame("sixth").SwitchTo().Frame("iframe1");
            Assert.AreEqual("Success!", driver.FindElement(By.Id("greeting")).Text);
        }

        [Test]
        public void ShouldBeAbleToFindElementsInIframesByXPath()
        {
            driver.Url = iframePage;

            driver.SwitchTo().Frame("iframe1");

            IWebElement element = driver.FindElement(By.XPath("//*[@id = 'changeme']"));

            Assert.That(element, Is.Not.Null);
        }

        [Test]
        public void GetCurrentUrlShouldReturnTopLevelBrowsingContextUrl()
        {
            driver.Url = framesetPage;
            Assert.AreEqual(framesetPage, driver.Url);

            driver.SwitchTo().Frame("second");
            Assert.AreEqual(framesetPage, driver.Url);
        }

        [Test]
        public void GetCurrentUrlShouldReturnTopLevelBrowsingContextUrlForIframes()
        {
            driver.Url = iframePage;
            Assert.AreEqual(iframePage, driver.Url);


            driver.SwitchTo().Frame("iframe1");
            Assert.AreEqual(iframePage, driver.Url);
        }

        [Test]
        public void ShouldBeAbleToSwitchToTheTopIfTheFrameIsDeletedFromUnderUs()
        {
            driver.Url = deletingFrame;
            driver.SwitchTo().Frame("iframe1");

            IWebElement killIframe = driver.FindElement(By.Id("killIframe"));
            killIframe.Click();
            driver.SwitchTo().DefaultContent();

            AssertFrameNotPresent("iframe1");

            IWebElement addIFrame = driver.FindElement(By.Id("addBackFrame"));
            addIFrame.Click();

            WaitFor(() => driver.FindElement(By.Id("iframe1")), "Did not find frame element");

            driver.SwitchTo().Frame("iframe1");
            WaitFor(() => driver.FindElement(By.Id("success")), "Did not find element in frame");
        }

        [Test]
        public void ShouldBeAbleToSwitchToTheTopIfTheFrameIsDeletedFromUnderUsWithFrameIndex()
        {
            driver.Url = deletingFrame;
            int iframe = 0;
            WaitFor(() => FrameExistsAndSwitchedTo(iframe), "Did not switch to frame");

            // we should be in the frame now
            IWebElement killIframe = driver.FindElement(By.Id("killIframe"));
            killIframe.Click();
            driver.SwitchTo().DefaultContent();

            IWebElement addIFrame = driver.FindElement(By.Id("addBackFrame"));
            addIFrame.Click();
            WaitFor(() => FrameExistsAndSwitchedTo(iframe), "Did not switch to frame");

            WaitFor(() => driver.FindElement(By.Id("success")), "Did not find element in frame");
        }

        [Test]
        public void ShouldBeAbleToSwitchToTheTopIfTheFrameIsDeletedFromUnderUsWithWebelement()
        {
            driver.Url = deletingFrame;
            IWebElement iframe = driver.FindElement(By.Id("iframe1"));
            WaitFor(() => FrameExistsAndSwitchedTo(iframe), "Did not switch to frame");

            // we should be in the frame now
            IWebElement killIframe = driver.FindElement(By.Id("killIframe"));
            killIframe.Click();
            driver.SwitchTo().DefaultContent();

            IWebElement addIFrame = driver.FindElement(By.Id("addBackFrame"));
            addIFrame.Click();

            iframe = driver.FindElement(By.Id("iframe1"));
            WaitFor(() => FrameExistsAndSwitchedTo(iframe), "Did not switch to frame");
            WaitFor(() => driver.FindElement(By.Id("success")), "Did not find element in frame");
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Chrome driver throws NoSuchElementException")]
        [IgnoreBrowser(Browser.Edge, "Edge driver throws NoSuchElementException")]
        [IgnoreBrowser(Browser.IE, "IE driver throws NoSuchElementException")]
        public void ShouldNotBeAbleToDoAnythingTheFrameIsDeletedFromUnderUs()
        {
            driver.Url = deletingFrame;
            driver.SwitchTo().Frame("iframe1");

            IWebElement killIframe = driver.FindElement(By.Id("killIframe"));
            killIframe.Click();

            Assert.That(() => driver.FindElement(By.Id("killIframe")), Throws.InstanceOf<NoSuchWindowException>());
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
            Assert.That((bool)executor.ExecuteScript("return window == window.top"), Is.True);

            driver.SwitchTo().Frame("third");
            Assert.That((bool)executor.ExecuteScript("return window != window.top"), Is.True);
        }

        [Test]
        public void ShouldNotSwitchMagicallyToTheTopWindow()
        {
            string baseUrl = EnvironmentManager.Instance.UrlBuilder.WhereIs("frame_switching_tests/");
            driver.Url = baseUrl + "bug4876.html";
            driver.SwitchTo().Frame(0);
            WaitFor(() => driver.FindElement(By.Id("inputText")), "Could not find element");

            for (int i = 0; i < 20; i++)
            {
                try
                {
                    IWebElement input = WaitFor(() => driver.FindElement(By.Id("inputText")), "Did not find element");
                    IWebElement submit = WaitFor(() => driver.FindElement(By.Id("submitButton")), "Did not find input element");
                    input.Clear();
                    input.SendKeys("rand" + new Random().Next());
                    submit.Click();
                }
                finally
                {
                    System.Threading.Thread.Sleep(100);
                    string url = (string)((IJavaScriptExecutor)driver).ExecuteScript("return window.location.href");
                    // IE6 and Chrome add "?"-symbol to the end of the URL
                    if (url.EndsWith("?"))
                    {
                        url = url.Substring(0, url.Length - 1);
                    }
                    Assert.AreEqual(baseUrl + "bug4876_iframe.html", url);
                }
            }
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        public void GetShouldSwitchToDefaultContext()
        {
            driver.Url = iframePage;
            driver.SwitchTo().Frame(driver.FindElement(By.Id("iframe1")));
            driver.FindElement(By.Id("cheese")); // Found on formPage.html but not on iframes.html.

            driver.Url = iframePage; // This must effectively switchTo().defaultContent(), too.
            driver.FindElement(By.Id("iframe1"));
        }

        // ----------------------------------------------------------------------------------------------
        //
        // Frame handling behavior tests not included in Java tests
        //
        // ----------------------------------------------------------------------------------------------

        [Test]
        public void ShouldBeAbleToFlipToAFrameIdentifiedByItsId()
        {
            driver.Url = framesetPage;

            driver.SwitchTo().Frame("fifth");
            driver.FindElement(By.Id("username"));
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox)]
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

            Assert.That(element, Is.Not.Null);
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

        private void AssertFrameNotPresent(string locator)
        {
            driver.SwitchTo().DefaultContent();
            WaitFor(() => !FrameExistsAndSwitchedTo(locator), "Frame still present after timeout");
            driver.SwitchTo().DefaultContent();
        }

        private bool FrameExistsAndSwitchedTo(string locator)
        {
            try
            {
                driver.SwitchTo().Frame(locator);
                return true;
            }
            catch (NoSuchFrameException)
            {
            }

            return false;
        }

        private bool FrameExistsAndSwitchedTo(int index)
        {
            try
            {
                driver.SwitchTo().Frame(index);
                return true;
            }
            catch (NoSuchFrameException)
            {
            }

            return false;
        }

        private bool FrameExistsAndSwitchedTo(IWebElement frameElement)
        {
            try
            {
                driver.SwitchTo().Frame(frameElement);
                return true;
            }
            catch (NoSuchFrameException)
            {
            }

            return false;
        }
    }
}
