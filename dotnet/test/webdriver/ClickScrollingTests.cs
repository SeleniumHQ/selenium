// <copyright file="ClickScrollingTests.cs" company="Selenium Committers">
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

using System.Drawing;

namespace OpenQA.Selenium.Tests;

[TestFixture]
public class ClickScrollingTests : DriverTestFixture
{
    [Test]
    public void ClickingOnAnchorScrollsPage()
    {
        string scrollScript = "var pageY;";
        scrollScript += "if (typeof(window.pageYOffset) == 'number') {";
        scrollScript += "pageY = window.pageYOffset;";
        scrollScript += "} else {";
        scrollScript += "pageY = document.documentElement.scrollTop;";
        scrollScript += "}";
        scrollScript += "return pageY;";

        Driver.Url = Urls.MacbethPage;

        Driver.FindElement(By.PartialLinkText("last speech")).Click();

        // Sometimes JS is returning a double
        object result = ((IJavaScriptExecutor)Driver).ExecuteScript(scrollScript);
        var yOffset = Convert.ToInt64(result);

        //Focusing on to click, but not actually following,
        //the link will scroll it in to view, which is a few pixels further than 0
        Assert.That(yOffset, Is.GreaterThan(300), "Did not scroll");
    }

    [Test]
    public void ShouldScrollToClickOnAnElementHiddenByOverflow()
    {
        string url = Urls.WhereIs("click_out_of_bounds_overflow.html");
        Driver.Url = url;

        IWebElement link = Driver.FindElement(By.Id("link"));
        link.Click();
    }

    [Test]
    public void ShouldBeAbleToClickOnAnElementHiddenByOverflow()
    {
        Driver.Url = Urls.WhereIs("scroll.html");

        IWebElement link = Driver.FindElement(By.Id("line8"));
        // This used to throw a MoveTargetOutOfBoundsException - we don't expect it to
        link.Click();

        Assert.That(Driver.FindElement(By.Id("clicked")).Text, Is.EqualTo("line8"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/2013")]
    public void ShouldBeAbleToClickOnAnElementHiddenByDoubleOverflow()
    {
        Driver.Url = Urls.WhereIs("scrolling_tests/page_with_double_overflow_auto.html");

        Driver.FindElement(By.Id("link")).Click();
        WaitFor(TitleToBe("Clicked Successfully!"), "Browser title was not 'Clicked Successfully'");
    }

    [Test]
    public void ShouldBeAbleToClickOnAnElementHiddenByYOverflow()
    {
        Driver.Url = Urls.WhereIs("scrolling_tests/page_with_y_overflow_auto.html");

        Driver.FindElement(By.Id("link")).Click();
        WaitFor(TitleToBe("Clicked Successfully!"), "Browser title was not 'Clicked Successfully'");
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Scroll bar gets in they way of clicking center element")]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/2013")]
    public void ShouldBeAbleToClickOnAnElementPartiallyHiddenByOverflow()
    {
        Driver.Url = Urls.WhereIs("scrolling_tests/page_with_partially_hidden_element.html");
        Driver.FindElement(By.Id("btn")).Click();
        WaitFor(TitleToBe("Clicked Successfully!"), "Browser title was not 'Clicked Successfully'");
    }

    [Test]
    public void ShouldNotScrollOverflowElementsWhichAreVisible()
    {
        Driver.Url = Urls.WhereIs("scroll2.html");
        IWebElement list = Driver.FindElement(By.TagName("ul"));
        IWebElement item = list.FindElement(By.Id("desired"));
        item.Click();
        long yOffset = (long)((IJavaScriptExecutor)Driver).ExecuteScript("return arguments[0].scrollTop;", list);
        Assert.That(yOffset, Is.Zero, "Should not have scrolled");
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "IE is scrolling Button2 to top of screen instead of bottom of screen as per spec")]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/2013")]
    public void ShouldNotScrollIfAlreadyScrolledAndElementIsInView()
    {
        Driver.Url = Urls.WhereIs("scroll3.html");
        Driver.FindElement(By.Id("button2")).Click();
        double scrollTop = GetScrollTop();
        Driver.FindElement(By.Id("button1")).Click();
        Assert.That(GetScrollTop(), Is.EqualTo(scrollTop));
    }

    [Test]
    public void ShouldBeAbleToClickRadioButtonScrolledIntoView()
    {
        Driver.Url = Urls.WhereIs("scroll4.html");
        Driver.FindElement(By.Id("radio")).Click();
        // If we don't throw, we're good
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "IE has special overflow handling")]
    public void ShouldScrollOverflowElementsIfClickPointIsOutOfViewButElementIsInView()
    {
        Driver.Url = Urls.WhereIs("scroll5.html");
        Driver.FindElement(By.Id("inner")).Click();
        Assert.That(Driver.FindElement(By.Id("clicked")).Text, Is.EqualTo("clicked"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://bugzilla.mozilla.org/show_bug.cgi?id=1314462")]
    public void ShouldBeAbleToClickElementInAFrameThatIsOutOfView()
    {
        try
        {
            Driver.Url = Urls.WhereIs("scrolling_tests/page_with_frame_out_of_view.html");
            Driver.SwitchTo().Frame("frame");
            IWebElement element = Driver.FindElement(By.Name("checkbox"));
            element.Click();
            Assert.That(element.Selected, "Element is not selected");
        }
        finally
        {
            Driver.SwitchTo().DefaultContent();
        }
    }

    [Test]
    public void ShouldBeAbleToClickElementThatIsOutOfViewInAFrame()
    {
        try
        {
            Driver.Url = Urls.WhereIs("scrolling_tests/page_with_scrolling_frame.html");
            Driver.SwitchTo().Frame("scrolling_frame");
            IWebElement element = Driver.FindElement(By.Name("scroll_checkbox"));
            element.Click();
            Assert.That(element.Selected, "Element is not selected");
        }
        finally
        {
            Driver.SwitchTo().DefaultContent();
        }
    }

    [Test]
    public void ShouldBeAbleToClickElementThatIsOutOfViewInAFrameThatIsOutOfView()
    {
        try
        {
            Driver.Url = Urls.WhereIs("scrolling_tests/page_with_scrolling_frame_out_of_view.html");
            Driver.SwitchTo().Frame("scrolling_frame");
            IWebElement element = Driver.FindElement(By.Name("scroll_checkbox"));
            element.Click();
            Assert.That(element.Selected, "Element is not selected");
        }
        finally
        {
            Driver.SwitchTo().DefaultContent();
        }
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/2013")]
    public void ShouldBeAbleToClickElementThatIsOutOfViewInANestedFrame()
    {
        try
        {
            Driver.Url = Urls.WhereIs("scrolling_tests/page_with_nested_scrolling_frames.html");
            Driver.SwitchTo().Frame("scrolling_frame");
            Driver.SwitchTo().Frame("nested_scrolling_frame");
            IWebElement element = Driver.FindElement(By.Name("scroll_checkbox"));
            element.Click();
            Assert.That(element.Selected, "Element is not selected");
        }
        finally
        {
            Driver.SwitchTo().DefaultContent();
        }
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/2013")]
    public void ShouldBeAbleToClickElementThatIsOutOfViewInANestedFrameThatIsOutOfView()
    {
        try
        {
            Driver.Url = Urls.WhereIs("scrolling_tests/page_with_nested_scrolling_frames_out_of_view.html");
            Driver.SwitchTo().Frame("scrolling_frame");
            Driver.SwitchTo().Frame("nested_scrolling_frame");
            IWebElement element = Driver.FindElement(By.Name("scroll_checkbox"));
            element.Click();
            Assert.That(element.Selected, "Element is not selected");
        }
        finally
        {
            Driver.SwitchTo().DefaultContent();
        }
    }

    [Test]
    public void ShouldNotScrollWhenGettingElementSize()
    {
        Driver.Url = Urls.WhereIs("scroll3.html");
        double scrollTop = GetScrollTop();
        Size ignoredSize = Driver.FindElement(By.Id("button1")).Size;
        Assert.That(GetScrollTop(), Is.EqualTo(scrollTop));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://bugzilla.mozilla.org/show_bug.cgi?id=1314462")]
    public void ShouldBeAbleToClickElementInATallFrame()
    {
        Driver.Url = Urls.WhereIs("scrolling_tests/page_with_tall_frame.html");
        Driver.SwitchTo().Frame("tall_frame");
        IWebElement element = Driver.FindElement(By.Name("checkbox"));
        element.Click();
        Assert.That(element.Selected, "Element is not selected");
    }

    //------------------------------------------------------------------
    // Tests below here are not included in the Java test suite
    //------------------------------------------------------------------
    [Test]
    [IgnoreBrowser(Browser.IE, "Clicking label is not changing checkbox")]
    [IgnoreTarget("net48", "Cannot create inline page with UrlBuilder")]
    public void ShouldBeAbleToClickInlineTextElementWithChildElementAfterScrolling()
    {
        Driver.Url = Urls.CreateInlinePage(new InlinePage()
            .WithBody(
                "<div style='height: 2000px;'>Force scroll needed</div><label id='wrapper'>wraps a checkbox <input id='check' type='checkbox' checked='checked'/></label>"));
        IWebElement label = Driver.FindElement(By.Id("wrapper"));
        label.Click();
        IWebElement checkbox = Driver.FindElement(By.Id("check"));
        Assert.That(checkbox.Selected, Is.False, "Checkbox should not be selected after click");
    }

    private double GetScrollTop()
    {
        return double.Parse(((IJavaScriptExecutor)Driver).ExecuteScript("return document.body.scrollTop;").ToString());
    }

    private Func<bool> TitleToBe(string desiredTitle)
    {
        return () =>
        {
            return Driver.Title == desiredTitle;
        };
    }
}
