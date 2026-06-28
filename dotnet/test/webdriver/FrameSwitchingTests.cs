// <copyright file="FrameSwitchingTests.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.Tests;

[TestFixture]
public class FrameSwitchingTests : DriverTestFixture
{
    // ----------------------------------------------------------------------------------------------
    //
    // Tests that WebDriver doesn't do anything fishy when it navigates to a page with frames.
    //
    // ----------------------------------------------------------------------------------------------

    [Test]
    public void ShouldAlwaysFocusOnTheTopMostFrameAfterANavigationEvent()
    {
        Driver.Url = Urls.FramesetPage;
        IWebElement element = Driver.FindElement(By.TagName("frameset"));
        Assert.That(element, Is.Not.Null);
    }

    [Test]
    public void ShouldNotAutomaticallySwitchFocusToAnIFrameWhenAPageContainingThemIsLoaded()
    {
        Driver.Url = Urls.IframesPage;
        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(1);
        IWebElement element = Driver.FindElement(By.Id("iframe_page_heading"));
        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(0);
        Assert.That(element, Is.Not.Null);
    }

    [Test]
    public void ShouldOpenPageWithBrokenFrameset()
    {
        Driver.Url = Urls.WhereIs("framesetPage3.html");

        IWebElement frame1 = Driver.FindElement(By.Id("first"));
        Driver.SwitchTo().Frame(frame1);

        Driver.SwitchTo().DefaultContent();

        IWebElement frame2 = Driver.FindElement(By.Id("second"));

        try
        {
            Driver.SwitchTo().Frame(frame2);
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
        Driver.Url = Urls.FramesetPage;
        Driver.SwitchTo().Frame(1);

        Assert.That(Driver.FindElement(By.Id("pageNumber")).Text, Is.EqualTo("2"));
    }

    [Test]
    public void ShouldBeAbleToSwitchToAnIframeByItsIndex()
    {
        Driver.Url = Urls.IframesPage;
        Driver.SwitchTo().Frame(0);

        Assert.That(Driver.FindElement(By.Name("id-name1")).GetAttribute("value"), Is.EqualTo("name"));
    }

    [Test]
    public void ShouldBeAbleToSwitchToAFrameByItsName()
    {
        Driver.Url = Urls.FramesetPage;
        Driver.SwitchTo().Frame("fourth");
        Assert.That(Driver.FindElement(By.TagName("frame")).GetAttribute("name"), Is.EqualTo("child1"));

    }

    [Test]
    public void ShouldBeAbleToSwitchToAnIframeByItsName()
    {
        Driver.Url = Urls.IframesPage;
        Driver.SwitchTo().Frame("iframe1-name");
        Assert.That(Driver.FindElement(By.Name("id-name1")).GetAttribute("value"), Is.EqualTo("name"));

    }

    [Test]
    public void ShouldBeAbleToSwitchToAFrameByItsID()
    {
        Driver.Url = Urls.FramesetPage;
        Driver.SwitchTo().Frame("fifth");
        Assert.That(Driver.FindElement(By.Name("windowOne")).Text, Is.EqualTo("Open new window"));

    }

    [Test]
    public void ShouldBeAbleToSwitchToAnIframeByItsID()
    {
        Driver.Url = Urls.IframesPage;
        Driver.SwitchTo().Frame("iframe1");
        Assert.That(Driver.FindElement(By.Name("id-name1")).GetAttribute("value"), Is.EqualTo("name"));
    }

    [Test]
    public void ShouldBeAbleToSwitchToFrameWithNameContainingDot()
    {
        Driver.Url = Urls.FramesetPage;
        Driver.SwitchTo().Frame("sixth.iframe1");
        Assert.That(Driver.FindElement(By.TagName("body")).Text, Does.Contain("Page number 3"));
    }

    [Test]
    public void ShouldBeAbleToSwitchToAFrameUsingAPreviouslyLocatedWebElement()
    {
        Driver.Url = Urls.FramesetPage;
        IWebElement frame = Driver.FindElement(By.TagName("frame"));
        Driver.SwitchTo().Frame(frame);
        Assert.That(Driver.FindElement(By.Id("pageNumber")).Text, Is.EqualTo("1"));
    }

    [Test]
    public void ShouldBeAbleToSwitchToAnIFrameUsingAPreviouslyLocatedWebElement()
    {
        Driver.Url = Urls.IframesPage;
        IWebElement frame = Driver.FindElement(By.TagName("iframe"));
        Driver.SwitchTo().Frame(frame);
        Assert.That(Driver.FindElement(By.Name("id-name1")).GetAttribute("value"), Is.EqualTo("name"));

    }

    [Test]
    public void ShouldEnsureElementIsAFrameBeforeSwitching()
    {
        Driver.Url = Urls.FramesetPage;
        IWebElement frame = Driver.FindElement(By.TagName("frameset"));
        Assert.That(() => Driver.SwitchTo().Frame(frame), Throws.InstanceOf<NoSuchFrameException>());
    }

    [Test]
    public void FrameSearchesShouldBeRelativeToTheCurrentlySelectedFrame()
    {
        Driver.Url = Urls.FramesetPage;

        IWebElement frameElement = WaitFor(() => Driver.FindElement(By.Name("second")), "did not find frame");
        Driver.SwitchTo().Frame(frameElement);
        Assert.That(Driver.FindElement(By.Id("pageNumber")).Text, Is.EqualTo("2"));

        Assert.That(
            () => Driver.SwitchTo().Frame("third"),
            Throws.TypeOf<NoSuchFrameException>());

        Driver.SwitchTo().DefaultContent();
        Driver.SwitchTo().Frame("third");

        Assert.That(
            () => Driver.SwitchTo().Frame("second"),
            Throws.TypeOf<NoSuchFrameException>());

        Driver.SwitchTo().DefaultContent();
        Driver.SwitchTo().Frame("second");
        Assert.That(Driver.FindElement(By.Id("pageNumber")).Text, Is.EqualTo("2"));
    }

    [Test]
    public void ShouldSelectChildFramesByChainedCalls()
    {
        Driver.Url = Urls.FramesetPage;
        Driver.SwitchTo().Frame("fourth").SwitchTo().Frame("child2");
        Assert.That(Driver.FindElement(By.Id("pageNumber")).Text, Is.EqualTo("11"));
    }

    [Test]
    public void ShouldThrowFrameNotFoundExceptionLookingUpSubFramesWithSuperFrameNames()
    {
        Driver.Url = Urls.FramesetPage;
        Driver.SwitchTo().Frame("fourth");
        Assert.That(
            () => Driver.SwitchTo().Frame("second"),
            Throws.TypeOf<NoSuchFrameException>());

    }

    [Test]
    public void ShouldThrowAnExceptionWhenAFrameCannotBeFound()
    {
        Driver.Url = Urls.XhtmlTestPage;

        Assert.That(
            () => Driver.SwitchTo().Frame("Nothing here"),
            Throws.TypeOf<NoSuchFrameException>());
    }

    [Test]
    public void ShouldThrowAnExceptionWhenAFrameCannotBeFoundByIndex()
    {
        Driver.Url = Urls.XhtmlTestPage;

        Assert.That(
            () => Driver.SwitchTo().Frame(27),
            Throws.TypeOf<NoSuchFrameException>());
    }

    [Test]
    public void ShouldBeAbleToSwitchToParentFrame()
    {
        Driver.Url = Urls.FramesetPage;
        Driver.SwitchTo().Frame("fourth").SwitchTo().ParentFrame().SwitchTo().Frame("first");
        Assert.That(Driver.FindElement(By.Id("pageNumber")).Text, Is.EqualTo("1"));
    }

    [Test]
    public void ShouldBeAbleToSwitchToParentFrameFromASecondLevelFrame()
    {
        Driver.Url = Urls.FramesetPage;

        Driver.SwitchTo().Frame("fourth").SwitchTo().Frame("child1").SwitchTo().ParentFrame().SwitchTo().Frame("child2");
        Assert.That(Driver.FindElement(By.Id("pageNumber")).Text, Is.EqualTo("11"));
    }

    [Test]
    public void SwitchingToParentFrameFromDefaultContextIsNoOp()
    {
        Driver.Url = Urls.XhtmlTestPage;
        Driver.SwitchTo().ParentFrame();
        Assert.That(Driver.Title, Is.EqualTo("XHTML Test Page"));
    }

    [Test]
    public void ShouldBeAbleToSwitchToParentFromAnIframe()
    {
        Driver.Url = Urls.IframesPage;
        Driver.SwitchTo().Frame(0);

        Driver.SwitchTo().ParentFrame();
        Driver.FindElement(By.Id("iframe_page_heading"));
    }

    // ----------------------------------------------------------------------------------------------
    //
    // General frame handling behavior tests
    //
    // ----------------------------------------------------------------------------------------------
    [Test]
    public void ShouldContinueToReferToTheSameFrameOnceItHasBeenSelected()
    {
        Driver.Url = Urls.FramesetPage;

        Driver.SwitchTo().Frame(2);
        IWebElement checkbox = Driver.FindElement(By.XPath("//input[@name='checky']"));
        checkbox.Click();
        checkbox.Submit();
        WaitFor(() => Driver.FindElement(By.XPath("//p")).Text == "Success!", "result element not found");
    }

    [Test]
    public void ShouldFocusOnTheReplacementWhenAFrameFollowsALinkToA_TopTargettedPage()
    {
        Driver.Url = Urls.FramesetPage;

        Driver.SwitchTo().Frame(0);
        Driver.FindElement(By.LinkText("top")).Click();

        WaitFor(() => { return Driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
        Assert.That(Driver.Title, Is.EqualTo("XHTML Test Page"));
    }

    [Test]
    public void ShouldAllowAUserToSwitchFromAnIframeBackToTheMainContentOfThePage()
    {
        Driver.Url = Urls.IframesPage;
        Driver.SwitchTo().Frame(0);

        Driver.SwitchTo().DefaultContent();
        Driver.FindElement(By.Id("iframe_page_heading"));
    }

    [Test]
    public void ShouldAllowTheUserToSwitchToAnIFrameAndRemainFocusedOnIt()
    {
        Driver.Url = Urls.IframesPage;
        Driver.SwitchTo().Frame(0);

        Driver.FindElement(By.Id("submitButton")).Click();

        string hello = GetTextOfGreetingElement();
        Assert.That(hello, Is.EqualTo("Success!"));
    }

    [Test]
    public void ShouldBeAbleToClickInAFrame()
    {
        Driver.Url = Urls.FramesetPage;
        Driver.SwitchTo().Frame("third");

        // This should replace frame "third" ...
        Driver.FindElement(By.Id("submitButton")).Click();

        // driver should still be focused on frame "third" ...
        Assert.That(GetTextOfGreetingElement(), Is.EqualTo("Success!"));

        // Make sure it was really frame "third" which was replaced ...
        Driver.SwitchTo().DefaultContent().SwitchTo().Frame("third");
        Assert.That(GetTextOfGreetingElement(), Is.EqualTo("Success!"));
    }

    [Test]
    public void ShouldBeAbleToClickInAFrameThatRewritesTopWindowLocation()
    {
        Driver.Url = Urls.WhereIs("click_tests/issue5237.html");
        Driver.SwitchTo().Frame("search");
        Driver.FindElement(By.Id("submit")).Click();
        Driver.SwitchTo().DefaultContent();
        WaitFor(() => { return Driver.Title == "Target page for issue 5237"; }, "Browser title was not 'Target page for issue 5237'");
    }

    [Test]
    public void ShouldBeAbleToClickInASubFrame()
    {
        Driver.Url = Urls.FramesetPage;
        Driver.SwitchTo().Frame("sixth").SwitchTo().Frame("iframe1");

        // This should replaxe frame "iframe1" inside frame "sixth" ...
        Driver.FindElement(By.Id("submitButton")).Click();

        // driver should still be focused on frame "iframe1" inside frame "sixth" ...
        Assert.That(GetTextOfGreetingElement(), Is.EqualTo("Success!"));

        // Make sure it was really frame "iframe1" inside frame "sixth" which was replaced ...
        Driver.SwitchTo().DefaultContent().SwitchTo().Frame("sixth").SwitchTo().Frame("iframe1");
        Assert.That(Driver.FindElement(By.Id("greeting")).Text, Is.EqualTo("Success!"));
    }

    [Test]
    public void ShouldBeAbleToFindElementsInIframesByXPath()
    {
        Driver.Url = Urls.IframesPage;

        Driver.SwitchTo().Frame("iframe1");

        IWebElement element = Driver.FindElement(By.XPath("//*[@id = 'changeme']"));

        Assert.That(element, Is.Not.Null);
    }

    [Test]
    public void GetCurrentUrlShouldReturnTopLevelBrowsingContextUrl()
    {
        Driver.Url = Urls.FramesetPage;
        Assert.That(Driver.Url, Is.EqualTo(Urls.FramesetPage));

        Driver.SwitchTo().Frame("second");
        Assert.That(Driver.Url, Is.EqualTo(Urls.FramesetPage));
    }

    [Test]
    public void GetCurrentUrlShouldReturnTopLevelBrowsingContextUrlForIframes()
    {
        Driver.Url = Urls.IframesPage;
        Assert.That(Driver.Url, Is.EqualTo(Urls.IframesPage));

        Driver.SwitchTo().Frame("iframe1");
        Assert.That(Driver.Url, Is.EqualTo(Urls.IframesPage));
    }

    [Test]
    public void ShouldBeAbleToSwitchToTheTopIfTheFrameIsDeletedFromUnderUs()
    {
        Driver.Url = Urls.DeletingFrame;
        Driver.SwitchTo().Frame("iframe1");

        IWebElement killIframe = Driver.FindElement(By.Id("killIframe"));
        killIframe.Click();
        Driver.SwitchTo().DefaultContent();

        AssertFrameNotPresent("iframe1");

        IWebElement addIFrame = Driver.FindElement(By.Id("addBackFrame"));
        addIFrame.Click();

        WaitFor(() => Driver.FindElement(By.Id("iframe1")), "Did not find frame element");

        Driver.SwitchTo().Frame("iframe1");
        WaitFor(() => Driver.FindElement(By.Id("success")), "Did not find element in frame");
    }

    [Test]
    public void ShouldBeAbleToSwitchToTheTopIfTheFrameIsDeletedFromUnderUsWithFrameIndex()
    {
        Driver.Url = Urls.DeletingFrame;
        int iframe = 0;
        WaitFor(() => FrameExistsAndSwitchedTo(iframe), "Did not switch to frame");

        // we should be in the frame now
        IWebElement killIframe = Driver.FindElement(By.Id("killIframe"));
        killIframe.Click();
        Driver.SwitchTo().DefaultContent();

        IWebElement addIFrame = Driver.FindElement(By.Id("addBackFrame"));
        addIFrame.Click();
        WaitFor(() => FrameExistsAndSwitchedTo(iframe), "Did not switch to frame");

        WaitFor(() => Driver.FindElement(By.Id("success")), "Did not find element in frame");
    }

    [Test]
    public void ShouldBeAbleToSwitchToTheTopIfTheFrameIsDeletedFromUnderUsWithWebelement()
    {
        Driver.Url = Urls.DeletingFrame;
        IWebElement iframe = Driver.FindElement(By.Id("iframe1"));
        WaitFor(() => FrameExistsAndSwitchedTo(iframe), "Did not switch to frame");

        // we should be in the frame now
        IWebElement killIframe = Driver.FindElement(By.Id("killIframe"));
        killIframe.Click();
        Driver.SwitchTo().DefaultContent();

        IWebElement addIFrame = Driver.FindElement(By.Id("addBackFrame"));
        addIFrame.Click();

        iframe = Driver.FindElement(By.Id("iframe1"));
        WaitFor(() => FrameExistsAndSwitchedTo(iframe), "Did not switch to frame");
        WaitFor(() => Driver.FindElement(By.Id("success")), "Did not find element in frame");
    }

    [Test]
    [IgnoreBrowser(Browser.Chrome, "Chrome driver throws NoSuchElementException")]
    [IgnoreBrowser(Browser.Edge, "Edge driver throws NoSuchElementException")]
    [IgnoreBrowser(Browser.IE, "IE driver throws NoSuchElementException")]
    public void ShouldNotBeAbleToDoAnythingTheFrameIsDeletedFromUnderUs()
    {
        Driver.Url = Urls.DeletingFrame;
        Driver.SwitchTo().Frame("iframe1");

        IWebElement killIframe = Driver.FindElement(By.Id("killIframe"));
        killIframe.Click();

        Assert.That(
            () => Driver.FindElement(By.Id("killIframe")),
            Throws.TypeOf<NoSuchWindowException>());
    }

    [Test]
    public void ShouldReturnWindowTitleInAFrameset()
    {
        Driver.Url = Urls.FramesetPage;
        Driver.SwitchTo().Frame("third");
        Assert.That(Driver.Title, Is.EqualTo("Unique title"));
    }

    [Test]
    public void JavaScriptShouldExecuteInTheContextOfTheCurrentFrame()
    {
        IJavaScriptExecutor executor = Driver as IJavaScriptExecutor;

        Driver.Url = Urls.FramesetPage;
        Assert.That((bool)executor.ExecuteScript("return window == window.top"), Is.True);

        Driver.SwitchTo().Frame("third");
        Assert.That((bool)executor.ExecuteScript("return window != window.top"), Is.True);
    }

    [Test]
    public void ShouldNotSwitchMagicallyToTheTopWindow()
    {
        string baseUrl = Urls.WhereIs("frame_switching_tests/");
        Driver.Url = baseUrl + "bug4876.html";
        Driver.SwitchTo().Frame(0);
        WaitFor(() => Driver.FindElement(By.Id("inputText")), "Could not find element");

        for (int i = 0; i < 20; i++)
        {
            try
            {
                IWebElement input = WaitFor(() => Driver.FindElement(By.Id("inputText")), "Did not find element");
                IWebElement submit = WaitFor(() => Driver.FindElement(By.Id("submitButton")), "Did not find input element");
                input.Clear();
                input.SendKeys("rand" + new Random().Next());
                submit.Click();
            }
            finally
            {
                System.Threading.Thread.Sleep(100);
                string url = (string)((IJavaScriptExecutor)Driver).ExecuteScript("return window.location.href");
                // IE6 and Chrome add "?"-symbol to the end of the URL
                if (url.EndsWith("?"))
                {
                    url = url.Substring(0, url.Length - 1);
                }
                Assert.That(url, Is.EqualTo(baseUrl + "bug4876_iframe.html"));
            }
        }
    }

    [Test]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void GetShouldSwitchToDefaultContext()
    {
        Driver.Url = Urls.IframesPage;
        Driver.SwitchTo().Frame(Driver.FindElement(By.Id("iframe1")));
        Driver.FindElement(By.Id("cheese")); // Found on formPage.html but not on iframes.html.

        Driver.Url = Urls.IframesPage; // This must effectively switchTo().defaultContent(), too.
        Driver.FindElement(By.Id("iframe1"));
    }

    // ----------------------------------------------------------------------------------------------
    //
    // Frame handling behavior tests not included in Java tests
    //
    // ----------------------------------------------------------------------------------------------

    [Test]
    public void ShouldBeAbleToFlipToAFrameIdentifiedByItsId()
    {
        Driver.Url = Urls.FramesetPage;

        Driver.SwitchTo().Frame("fifth");
        Driver.FindElement(By.Id("username"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox)]
    public void ShouldBeAbleToSelectAFrameByName()
    {
        Driver.Url = Urls.FramesetPage;

        Driver.SwitchTo().Frame("second");
        Assert.That(Driver.FindElement(By.Id("pageNumber")).Text, Is.EqualTo("2"));

        Driver.SwitchTo().DefaultContent().SwitchTo().Frame("third");
        Driver.FindElement(By.Id("changeme")).Click();

        Driver.SwitchTo().DefaultContent().SwitchTo().Frame("second");
        Assert.That(Driver.FindElement(By.Id("pageNumber")).Text, Is.EqualTo("2"));
    }

    [Test]
    public void ShouldBeAbleToFindElementsInIframesByName()
    {
        Driver.Url = Urls.IframesPage;

        Driver.SwitchTo().Frame("iframe1");
        IWebElement element = Driver.FindElement(By.Name("id-name1"));

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
                IWebElement element = Driver.FindElement(By.Id("greeting"));
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
        Driver.SwitchTo().DefaultContent();
        WaitFor(() => !FrameExistsAndSwitchedTo(locator), "Frame still present after timeout");
        Driver.SwitchTo().DefaultContent();
    }

    private bool FrameExistsAndSwitchedTo(string locator)
    {
        try
        {
            Driver.SwitchTo().Frame(locator);
            return true;
        }
        catch (NoSuchFrameException)
        {
            return false;
        }
    }

    private bool FrameExistsAndSwitchedTo(int index)
    {
        try
        {
            Driver.SwitchTo().Frame(index);
            return true;
        }
        catch (NoSuchFrameException)
        {
            return false;
        }
    }

    private bool FrameExistsAndSwitchedTo(IWebElement frameElement)
    {
        try
        {
            Driver.SwitchTo().Frame(frameElement);
            return true;
        }
        catch (NoSuchFrameException)
        {
            return false;
        }
    }
}
