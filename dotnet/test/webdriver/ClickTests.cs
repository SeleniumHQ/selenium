// <copyright file="ClickTests.cs" company="Selenium Committers">
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
public class ClickTests : DriverTestFixture
{
    [SetUp]
    public void SetupMethod()
    {
        Driver.Url = Urls.ClicksPage;
    }

    [TearDown]
    public void TearDownMethod()
    {
        Driver.SwitchTo().DefaultContent();
    }

    [Test]
    public void CanClickOnALinkAndFollowIt()
    {
        Driver.FindElement(By.Id("normal")).Click();
        WaitFor(() => { return Driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
        Assert.That(Driver.Title, Is.EqualTo("XHTML Test Page"));
    }

    [Test]
    public void CanClickOnALinkThatOverflowsAndFollowIt()
    {
        Driver.FindElement(By.Id("overflowLink")).Click();

        WaitFor(() => { return Driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
    }

    [Test]
    public void CanClickOnAnAnchorAndNotReloadThePage()
    {
        ((IJavaScriptExecutor)Driver).ExecuteScript("document.latch = true");

        Driver.FindElement(By.Id("anchor")).Click();

        bool samePage = (bool)((IJavaScriptExecutor)Driver).ExecuteScript("return document.latch");

        Assert.That(samePage, Is.True, "Latch was reset");
    }

    [Test]
    public void CanClickOnALinkThatUpdatesAnotherFrame()
    {
        Driver.SwitchTo().Frame("source");

        Driver.FindElement(By.Id("otherframe")).Click();
        Driver.SwitchTo().DefaultContent().SwitchTo().Frame("target");

        Assert.That(Driver.PageSource, Does.Contain("Hello WebDriver"));
    }

    [Test]
    public void ElementsFoundByJsCanLoadUpdatesInAnotherFrame()
    {
        Driver.SwitchTo().Frame("source");

        IWebElement toClick = (IWebElement)((IJavaScriptExecutor)Driver).ExecuteScript("return document.getElementById('otherframe');");
        toClick.Click();
        Driver.SwitchTo().DefaultContent().SwitchTo().Frame("target");

        Assert.That(Driver.PageSource, Does.Contain("Hello WebDriver"));
    }

    [Test]
    public void JsLocatedElementsCanUpdateFramesIfFoundSomehowElse()
    {
        Driver.SwitchTo().Frame("source");

        // Prime the cache of elements
        Driver.FindElement(By.Id("otherframe"));

        // This _should_ return the same element
        IWebElement toClick = (IWebElement)((IJavaScriptExecutor)Driver).ExecuteScript("return document.getElementById('otherframe');");
        toClick.Click();
        Driver.SwitchTo().DefaultContent().SwitchTo().Frame("target");

        Assert.That(Driver.PageSource, Does.Contain("Hello WebDriver"));
    }

    [Test]

    public void CanClickOnAnElementWithTopSetToANegativeNumber()
    {
        Driver.Url = Urls.WhereIs("styledPage.html");
        IWebElement searchBox = Driver.FindElement(By.Name("searchBox"));
        searchBox.SendKeys("Cheese");
        Driver.FindElement(By.Name("btn")).Click();

        string log = Driver.FindElement(By.Id("log")).Text;
        Assert.That(log, Is.EqualTo("click"));
    }

    [Test]
    public void ShouldSetRelatedTargetForMouseOver()
    {
        Driver.Url = Urls.JavascriptPage;

        Driver.FindElement(By.Id("movable")).Click();

        string log = Driver.FindElement(By.Id("result")).Text;

        // Note: It is not guaranteed that the relatedTarget property of the mouseover
        // event will be the parent, when using native events. Only check that the mouse
        // has moved to this element, not that the parent element was the related target.
        if (this.IsNativeEventsEnabled)
        {
            Assert.That(log, Does.StartWith("parent matches?"));
        }
        else
        {
            Assert.That(log, Is.EqualTo("parent matches? true"));
        }
    }

    [Test]
    public void ShouldClickOnFirstBoundingClientRectWithNonZeroSize()
    {
        Driver.FindElement(By.Id("twoClientRects")).Click();
        WaitFor(() => { return Driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
        Assert.That(Driver.Title, Is.EqualTo("XHTML Test Page"));
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Edge in IE Mode does not properly handle multiple windows")]
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void ShouldOnlyFollowHrefOnce()
    {
        Driver.Url = Urls.ClicksPage;
        int windowHandlesBefore = Driver.WindowHandles.Count;

        Driver.FindElement(By.Id("new-window")).Click();
        WaitFor(() => { return Driver.WindowHandles.Count >= windowHandlesBefore + 1; }, "Window handles was not " + (windowHandlesBefore + 1).ToString());
        Assert.That(Driver.WindowHandles, Has.Exactly(windowHandlesBefore + 1).Items);
    }

    [Test]
    public void ClickingLabelShouldSetCheckbox()
    {
        Driver.Url = Urls.FormsPage;

        Driver.FindElement(By.Id("label-for-checkbox-with-label")).Click();

        Assert.That(Driver.FindElement(By.Id("checkbox-with-label")).Selected, "Checkbox should be selected");
    }

    [Test]
    public void CanClickOnALinkWithEnclosedImage()
    {
        Driver.FindElement(By.Id("link-with-enclosed-image")).Click();
        WaitFor(() => { return Driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
        Assert.That(Driver.Title, Is.EqualTo("XHTML Test Page"));
    }

    [Test]
    public void CanClickOnAnImageEnclosedInALink()
    {
        Driver.FindElement(By.Id("link-with-enclosed-image")).FindElement(By.TagName("img")).Click();
        WaitFor(() => { return Driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
        Assert.That(Driver.Title, Is.EqualTo("XHTML Test Page"));
    }

    [Test]
    public void CanClickOnALinkThatContainsTextWrappedInASpan()
    {
        Driver.FindElement(By.Id("link-with-enclosed-span")).Click();
        WaitFor(() => { return Driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
        Assert.That(Driver.Title, Is.EqualTo("XHTML Test Page"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/653")]
    public void CanClickOnALinkThatContainsEmbeddedBlockElements()
    {
        Driver.FindElement(By.Id("embeddedBlock")).Click();
        WaitFor(() => { return Driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
        Assert.That(Driver.Title, Is.EqualTo("XHTML Test Page"));
    }

    [Test]
    public void CanClickOnAnElementEnclosedInALink()
    {
        Driver.FindElement(By.Id("link-with-enclosed-span")).FindElement(By.TagName("span")).Click();
        WaitFor(() => { return Driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
        Assert.That(Driver.Title, Is.EqualTo("XHTML Test Page"));
    }

    [Test]
    public void ShouldBeAbleToClickOnAnElementInTheViewport()
    {
        string url = Urls.WhereIs("click_out_of_bounds.html");

        Driver.Url = url;
        IWebElement button = Driver.FindElement(By.Id("button"));
        button.Click();
    }

    [Test]
    public void ClicksASurroundingStrongTag()
    {
        Driver.Url = Urls.WhereIs("ClickTest_testClicksASurroundingStrongTag.html");
        Driver.FindElement(By.TagName("a")).Click();
        WaitFor(() => { return Driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://bugzilla.mozilla.org/show_bug.cgi?id=1502636")]
    public void CanClickAnImageMapArea()
    {
        Driver.Url = Urls.WhereIs("click_tests/google_map.html");
        Driver.FindElement(By.Id("rectG")).Click();
        WaitFor(() => { return Driver.Title == "Target Page 1"; }, "Browser title was not 'Target Page 1'");

        Driver.Url = Urls.WhereIs("click_tests/google_map.html");
        Driver.FindElement(By.Id("circleO")).Click();
        WaitFor(() => { return Driver.Title == "Target Page 2"; }, "Browser title was not 'Target Page 2'");

        Driver.Url = Urls.WhereIs("click_tests/google_map.html");
        Driver.FindElement(By.Id("polyLE")).Click();
        WaitFor(() => { return Driver.Title == "Target Page 3"; }, "Browser title was not 'Target Page 3'");
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://bugzilla.mozilla.org/show_bug.cgi?id=1422272")]
    public void ShouldBeAbleToClickOnAnElementGreaterThanTwoViewports()
    {
        string url = Urls.WhereIs("click_too_big.html");
        Driver.Url = url;

        IWebElement element = Driver.FindElement(By.Id("click"));

        element.Click();

        WaitFor(() => { return Driver.Title == "clicks"; }, "Browser title was not 'clicks'");
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://bugzilla.mozilla.org/show_bug.cgi?id=1937115")]
    public void ShouldBeAbleToClickOnAnElementInFrameGreaterThanTwoViewports()
    {
        string url = Urls.WhereIs("click_too_big_in_frame.html");
        Driver.Url = url;

        IWebElement frame = Driver.FindElement(By.Id("iframe1"));
        Driver.SwitchTo().Frame(frame);

        IWebElement element = Driver.FindElement(By.Id("click"));

        element.Click();

        WaitFor(() => { return Driver.Title == "clicks"; }, "Browser title was not 'clicks'");
    }

    [Test]
    public void ShouldBeAbleToClickOnRightToLeftLanguageLink()
    {
        String url = Urls.WhereIs("click_rtl.html");
        Driver.Url = url;

        IWebElement element = Driver.FindElement(By.Id("ar_link"));
        element.Click();

        WaitFor(() => Driver.Title == "clicks", "Expected title to be 'clicks'");
        Assert.That(Driver.Title, Is.EqualTo("clicks"));
    }

    [Test]
    public void ShouldBeAbleToClickOnLinkInAbsolutelyPositionedFooter()
    {
        string url = Urls.WhereIs("fixedFooterNoScroll.html");
        Driver.Url = url;

        Driver.FindElement(By.Id("link")).Click();
        WaitFor(() => { return Driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
        Assert.That(Driver.Title, Is.EqualTo("XHTML Test Page"));
    }

    [Test]
    public void ShouldBeAbleToClickOnLinkInAbsolutelyPositionedFooterInQuirksMode()
    {
        string url = Urls.WhereIs("fixedFooterNoScrollQuirksMode.html");
        Driver.Url = url;

        Driver.FindElement(By.Id("link")).Click();
        WaitFor(() => { return Driver.Title == "XHTML Test Page"; }, "Browser title was not 'XHTML Test Page'");
        Assert.That(Driver.Title, Is.EqualTo("XHTML Test Page"));
    }

    [Test]
    public void ShouldBeAbleToClickOnLinksWithNoHrefAttribute()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.LinkText("No href"));
        element.Click();

        WaitFor(() => Driver.Title == "Changed", "Expected title to be 'Changed'");
        Assert.That(Driver.Title, Is.EqualTo("Changed"));
    }

    [Test]
    public void ShouldBeAbleToClickOnALinkThatWrapsToTheNextLine()
    {
        Driver.Url = Urls.WhereIs("click_tests/link_that_wraps.html");

        Driver.FindElement(By.Id("link")).Click();

        WaitFor(() => Driver.Title == "Submitted Successfully!", "Expected title to be 'Submitted Successfully!'");
        Assert.That(Driver.Title, Is.EqualTo("Submitted Successfully!"));
    }

    [Test]
    public void ShouldBeAbleToClickOnASpanThatWrapsToTheNextLine()
    {
        Driver.Url = Urls.WhereIs("click_tests/span_that_wraps.html");

        Driver.FindElement(By.Id("span")).Click();

        WaitFor(() => Driver.Title == "Submitted Successfully!", "Expected title to be 'Submitted Successfully!'");
        Assert.That(Driver.Title, Is.EqualTo("Submitted Successfully!"));
    }

    [Test]
    public void ClickingOnADisabledElementIsANoOp()
    {
        Driver.Url = Urls.WhereIs("click_tests/disabled_element.html");

        IWebElement element = Driver.FindElement(By.Name("disabled"));
        element.Click();
    }

    //------------------------------------------------------------------
    // Tests below here are not included in the Java test suite
    //------------------------------------------------------------------
    [Test]
    public void ShouldBeAbleToClickLinkContainingLineBreak()
    {
        Driver.Url = Urls.SimpleTestPage;
        Driver.FindElement(By.Id("multilinelink")).Click();
        WaitFor(() => { return Driver.Title == "We Arrive Here"; }, "Browser title was not 'We Arrive Here'");
        Assert.That(Driver.Title, Is.EqualTo("We Arrive Here"));
    }
}
