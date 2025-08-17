// <copyright file="ClickScrollingTest.cs" company="Selenium Committers">
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

using NUnit.Framework;
using OpenQA.Selenium.Environment;
using System;
using System.Drawing;

namespace OpenQA.Selenium;

[TestFixture]
public class ClickScrollingTest : DriverTestFixture
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

        driver.Url = macbethPage;

        driver.FindElement(By.PartialLinkText("last speech")).Click();

        // Sometimes JS is returning a double
        object result = ((IJavaScriptExecutor)driver).ExecuteScript(scrollScript);
        var yOffset = Convert.ToInt64(result);

        //Focusing on to click, but not actually following,
        //the link will scroll it in to view, which is a few pixels further than 0
        Assert.That(yOffset, Is.GreaterThan(300), "Did not scroll");
    }

    [Test]
    public void ShouldScrollToClickOnAnElementHiddenByOverflow()
    {
        string url = EnvironmentManager.Instance.UrlBuilder.WhereIs("click_out_of_bounds_overflow.html");
        driver.Url = url;

        IWebElement link = driver.FindElement(By.Id("link"));
        link.Click();
    }

    [Test]
    public void ShouldBeAbleToClickOnAnElementHiddenByOverflow()
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll.html");

        IWebElement link = driver.FindElement(By.Id("line8"));
        // This used to throw a MoveTargetOutOfBoundsException - we don't expect it to
        link.Click();

        Assert.That(driver.FindElement(By.Id("clicked")).Text, Is.EqualTo("line8"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/2013")]
    public void ShouldBeAbleToClickOnAnElementHiddenByDoubleOverflow()
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scrolling_tests/page_with_double_overflow_auto.html");

        driver.FindElement(By.Id("link")).Click();
        WaitFor(TitleToBe("Clicked Successfully!"), "Browser title was not 'Clicked Successfully'");
    }

    [Test]
    public void ShouldBeAbleToClickOnAnElementHiddenByYOverflow()
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scrolling_tests/page_with_y_overflow_auto.html");

        driver.FindElement(By.Id("link")).Click();
        WaitFor(TitleToBe("Clicked Successfully!"), "Browser title was not 'Clicked Successfully'");
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Scroll bar gets in they way of clicking center element")]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/2013")]
    public void ShouldBeAbleToClickOnAnElementPartiallyHiddenByOverflow()
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scrolling_tests/page_with_partially_hidden_element.html");
        driver.FindElement(By.Id("btn")).Click();
        WaitFor(TitleToBe("Clicked Successfully!"), "Browser title was not 'Clicked Successfully'");
    }

    [Test]
    public void ShouldNotScrollOverflowElementsWhichAreVisible()
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll2.html");
        IWebElement list = driver.FindElement(By.TagName("ul"));
        IWebElement item = list.FindElement(By.Id("desired"));
        item.Click();
        long yOffset = (long)((IJavaScriptExecutor)driver).ExecuteScript("return arguments[0].scrollTop;", list);
        Assert.That(yOffset, Is.Zero, "Should not have scrolled");
    }


    [Test]
    [IgnoreBrowser(Browser.IE, "IE is scrolling Button2 to top of screen instead of bottom of screen as per spec")]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/2013")]
    public void ShouldNotScrollIfAlreadyScrolledAndElementIsInView()
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll3.html");
        driver.FindElement(By.Id("button2")).Click();
        double scrollTop = GetScrollTop();
        driver.FindElement(By.Id("button1")).Click();
        Assert.That(GetScrollTop(), Is.EqualTo(scrollTop));
    }

    [Test]
    public void ShouldBeAbleToClickRadioButtonScrolledIntoView()
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll4.html");
        driver.FindElement(By.Id("radio")).Click();
        // If we don't throw, we're good
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "IE has special overflow handling")]
    public void ShouldScrollOverflowElementsIfClickPointIsOutOfViewButElementIsInView()
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll5.html");
        driver.FindElement(By.Id("inner")).Click();
        Assert.That(driver.FindElement(By.Id("clicked")).Text, Is.EqualTo("clicked"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://bugzilla.mozilla.org/show_bug.cgi?id=1314462")]
    public void ShouldBeAbleToClickElementInAFrameThatIsOutOfView()
    {
        try
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scrolling_tests/page_with_frame_out_of_view.html");
            driver.SwitchTo().Frame("frame");
            IWebElement element = driver.FindElement(By.Name("checkbox"));
            element.Click();
            Assert.That(element.Selected, "Element is not selected");
        }
        finally
        {
            driver.SwitchTo().DefaultContent();
        }
    }

    [Test]
    public void ShouldBeAbleToClickElementThatIsOutOfViewInAFrame()
    {
        try
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scrolling_tests/page_with_scrolling_frame.html");
            driver.SwitchTo().Frame("scrolling_frame");
            IWebElement element = driver.FindElement(By.Name("scroll_checkbox"));
            element.Click();
            Assert.That(element.Selected, "Element is not selected");
        }
        finally
        {
            driver.SwitchTo().DefaultContent();
        }
    }

    [Test]
    public void ShouldBeAbleToClickElementThatIsOutOfViewInAFrameThatIsOutOfView()
    {
        try
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scrolling_tests/page_with_scrolling_frame_out_of_view.html");
            driver.SwitchTo().Frame("scrolling_frame");
            IWebElement element = driver.FindElement(By.Name("scroll_checkbox"));
            element.Click();
            Assert.That(element.Selected, "Element is not selected");
        }
        finally
        {
            driver.SwitchTo().DefaultContent();
        }
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/2013")]
    public void ShouldBeAbleToClickElementThatIsOutOfViewInANestedFrame()
    {
        try
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scrolling_tests/page_with_nested_scrolling_frames.html");
            driver.SwitchTo().Frame("scrolling_frame");
            driver.SwitchTo().Frame("nested_scrolling_frame");
            IWebElement element = driver.FindElement(By.Name("scroll_checkbox"));
            element.Click();
            Assert.That(element.Selected, "Element is not selected");
        }
        finally
        {
            driver.SwitchTo().DefaultContent();
        }
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://github.com/mozilla/geckodriver/issues/2013")]
    public void ShouldBeAbleToClickElementThatIsOutOfViewInANestedFrameThatIsOutOfView()
    {
        try
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scrolling_tests/page_with_nested_scrolling_frames_out_of_view.html");
            driver.SwitchTo().Frame("scrolling_frame");
            driver.SwitchTo().Frame("nested_scrolling_frame");
            IWebElement element = driver.FindElement(By.Name("scroll_checkbox"));
            element.Click();
            Assert.That(element.Selected, "Element is not selected");
        }
        finally
        {
            driver.SwitchTo().DefaultContent();
        }
    }

    [Test]
    public void ShouldNotScrollWhenGettingElementSize()
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll3.html");
        double scrollTop = GetScrollTop();
        Size ignoredSize = driver.FindElement(By.Id("button1")).Size;
        Assert.That(GetScrollTop(), Is.EqualTo(scrollTop));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "https://bugzilla.mozilla.org/show_bug.cgi?id=1314462")]
    public void ShouldBeAbleToClickElementInATallFrame()
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scrolling_tests/page_with_tall_frame.html");
        driver.SwitchTo().Frame("tall_frame");
        IWebElement element = driver.FindElement(By.Name("checkbox"));
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
        driver.Url = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
            .WithBody(
                "<div style='height: 2000px;'>Force scroll needed</div><label id='wrapper'>wraps a checkbox <input id='check' type='checkbox' checked='checked'/></label>"));
        IWebElement label = driver.FindElement(By.Id("wrapper"));
        label.Click();
        IWebElement checkbox = driver.FindElement(By.Id("check"));
        Assert.That(checkbox.Selected, Is.False, "Checkbox should not be selected after click");
    }

    private double GetScrollTop()
    {
        return double.Parse(((IJavaScriptExecutor)driver).ExecuteScript("return document.body.scrollTop;").ToString());
    }

    private Func<bool> TitleToBe(string desiredTitle)
    {
        return () =>
        {
            return driver.Title == desiredTitle;
        };
    }
}
