// <copyright file="VisibilityTests.cs" company="Selenium Committers">
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

using System.Collections.ObjectModel;
using System.Drawing;

namespace OpenQA.Selenium.Tests;

[TestFixture]
public class VisibilityTests : DriverTestFixture
{
    [Test]
    public void ShouldAllowTheUserToTellIfAnElementIsDisplayedOrNot()
    {
        Driver.Url = Urls.JavascriptPage;

        Assert.That(Driver.FindElement(By.Id("displayed")).Displayed, Is.True, "Element with ID 'displayed' should be displayed");
        Assert.That(Driver.FindElement(By.Id("none")).Displayed, Is.False, "Element with ID 'none' should not be displayed");
        Assert.That(Driver.FindElement(By.Id("suppressedParagraph")).Displayed, Is.False, "Element with ID 'suppressedParagraph' should not be displayed");
        Assert.That(Driver.FindElement(By.Id("hidden")).Displayed, Is.False, "Element with ID 'hidden' should not be displayed");
    }

    [Test]
    public void VisibilityShouldTakeIntoAccountParentVisibility()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement childDiv = Driver.FindElement(By.Id("hiddenchild"));
        IWebElement hiddenLink = Driver.FindElement(By.Id("hiddenlink"));

        Assert.That(childDiv.Displayed, Is.False, "Child div should not be displayed");
        Assert.That(hiddenLink.Displayed, Is.False, "Hidden link should not be displayed");
    }

    [Test]
    public void ShouldCountElementsAsVisibleIfStylePropertyHasBeenSet()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement shown = Driver.FindElement(By.Id("visibleSubElement"));

        Assert.That(shown.Displayed, Is.True);
    }

    [Test]
    public void ShouldModifyTheVisibilityOfAnElementDynamically()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("hideMe"));

        Assert.That(element.Displayed, Is.True);

        element.Click();

        Assert.That(element.Displayed, Is.False);
    }

    [Test]
    public void HiddenInputElementsAreNeverVisible()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement shown = Driver.FindElement(By.Name("hidden"));

        Assert.That(shown.Displayed, Is.False);
    }

    [Test]
    public void ShouldNotBeAbleToClickOnAnElementThatIsNotDisplayed()
    {
        Driver.Url = Urls.JavascriptPage;
        IWebElement element = Driver.FindElement(By.Id("unclickable"));
        Assert.That(() => element.Click(), Throws.InstanceOf<ElementNotInteractableException>());
    }

    [Test]
    public void ShouldNotBeAbleToTypeAnElementThatIsNotDisplayed()
    {
        Driver.Url = Urls.JavascriptPage;
        IWebElement element = Driver.FindElement(By.Id("unclickable"));
        Assert.That(() => element.SendKeys("You don't see me"), Throws.InstanceOf<ElementNotInteractableException>());

        Assert.That(element.GetAttribute("value"), Is.Not.EqualTo("You don't see me"));
    }

    [Test]
    public void ZeroSizedDivIsShownIfDescendantHasSize()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("zero"));
        Size size = element.Size;

        Assert.That(size.Width, Is.Zero, "Should have 0 width");
        Assert.That(size.Height, Is.Zero, "Should have 0 height");
        Assert.That(element.Displayed, Is.True);
    }

    [Test]
    public void ParentNodeVisibleWhenAllChildrenAreAbsolutelyPositionedAndOverflowIsHidden()
    {
        String url = Urls.WhereIs("visibility-css.html");
        Driver.Url = url;

        IWebElement element = Driver.FindElement(By.Id("suggest"));
        Assert.That(element.Displayed, Is.True);
    }

    [Test]
    public void ElementHiddenByOverflowXIsNotVisible()
    {
        string[] pages = new string[]{
            "overflow/x_hidden_y_hidden.html",
            "overflow/x_hidden_y_scroll.html",
            "overflow/x_hidden_y_auto.html",
        };
        foreach (string page in pages)
        {
            Driver.Url = Urls.WhereIs(page);
            IWebElement right = Driver.FindElement(By.Id("right"));
            Assert.That(right.Displayed, Is.False, "Failed for " + page);
            IWebElement bottomRight = Driver.FindElement(By.Id("bottom-right"));
            Assert.That(bottomRight.Displayed, Is.False, "Failed for " + page);
        }
    }

    [Test]
    public void ElementHiddenByOverflowYIsNotVisible()
    {
        string[] pages = new string[]{
            "overflow/x_hidden_y_hidden.html",
            "overflow/x_scroll_y_hidden.html",
            "overflow/x_auto_y_hidden.html",
        };
        foreach (string page in pages)
        {
            Driver.Url = Urls.WhereIs(page);
            IWebElement bottom = Driver.FindElement(By.Id("bottom"));
            Assert.That(bottom.Displayed, Is.False, "Failed for " + page);
            IWebElement bottomRight = Driver.FindElement(By.Id("bottom-right"));
            Assert.That(bottomRight.Displayed, Is.False, "Failed for " + page);
        }
    }

    [Test]
    public void ElementScrollableByOverflowXIsVisible()
    {
        string[] pages = new string[]{
            "overflow/x_scroll_y_hidden.html",
            "overflow/x_scroll_y_scroll.html",
            "overflow/x_scroll_y_auto.html",
            "overflow/x_auto_y_hidden.html",
            "overflow/x_auto_y_scroll.html",
            "overflow/x_auto_y_auto.html",
        };
        foreach (string page in pages)
        {
            Driver.Url = Urls.WhereIs(page);
            IWebElement right = Driver.FindElement(By.Id("right"));
            Assert.That(right.Displayed, Is.True, "Failed for " + page);
        }
    }

    [Test]
    public void ElementScrollableByOverflowYIsVisible()
    {
        string[] pages = new string[]{
            "overflow/x_hidden_y_scroll.html",
            "overflow/x_scroll_y_scroll.html",
            "overflow/x_auto_y_scroll.html",
            "overflow/x_hidden_y_auto.html",
            "overflow/x_scroll_y_auto.html",
            "overflow/x_auto_y_auto.html",
        };
        foreach (string page in pages)
        {
            Driver.Url = Urls.WhereIs(page);
            IWebElement bottom = Driver.FindElement(By.Id("bottom"));
            Assert.That(bottom.Displayed, Is.True, "Failed for " + page);
        }
    }

    [Test]
    public void ElementScrollableByOverflowXAndYIsVisible()
    {
        string[] pages = new string[]{
            "overflow/x_scroll_y_scroll.html",
            "overflow/x_scroll_y_auto.html",
            "overflow/x_auto_y_scroll.html",
            "overflow/x_auto_y_auto.html",
        };
        foreach (string page in pages)
        {
            Driver.Url = Urls.WhereIs(page);
            IWebElement bottomRight = Driver.FindElement(By.Id("bottom-right"));
            Assert.That(bottomRight.Displayed, Is.True, "Failed for " + page);
        }
    }

    [Test]
    public void TooSmallAWindowWithOverflowHiddenIsNotAProblem()
    {
        IWindow window = Driver.Manage().Window;
        Size originalSize = window.Size;

        try
        {
            // Short in the Y dimension
            window.Size = new Size(1024, 500);

            Driver.Url = Urls.WhereIs("overflow-body.html");

            IWebElement element = Driver.FindElement(By.Name("resultsFrame"));
            Assert.That(element.Displayed, Is.True);
        }
        finally
        {
            window.Size = originalSize;
        }
    }

    [Test]
    public void ShouldShowElementNotVisibleWithHiddenAttribute()
    {
        string url = Urls.WhereIs("hidden.html");
        Driver.Url = url;
        IWebElement element = Driver.FindElement(By.Id("singleHidden"));
        Assert.That(element.Displayed, Is.False);
    }

    [Test]
    public void ShouldShowElementNotVisibleWhenParentElementHasHiddenAttribute()
    {
        string url = Urls.WhereIs("hidden.html");
        Driver.Url = url;

        IWebElement element = Driver.FindElement(By.Id("child"));
        Assert.That(element.Displayed, Is.False);
    }

    [Test]
    public void ShouldBeAbleToClickOnElementsWithOpacityZero()
    {
        if (TestUtilities.IsOldIE(Driver))
        {
            return;
        }

        Driver.Url = Urls.ClickJackerPage;
        IWebElement element = Driver.FindElement(By.Id("clickJacker"));
        Assert.That(element.GetCssValue("opacity"), Is.EqualTo("0"), "Precondition failed: clickJacker should be transparent");
        element.Click();
        Assert.That(element.GetCssValue("opacity"), Is.EqualTo("1"));
    }

    [Test]
    public void ShouldBeAbleToSelectOptionsFromAnInvisibleSelect()
    {
        Driver.Url = Urls.FormsPage;

        IWebElement select = Driver.FindElement(By.Id("invisi_select"));

        ReadOnlyCollection<IWebElement> options = select.FindElements(By.TagName("option"));
        IWebElement apples = options[0];
        IWebElement oranges = options[1];

        Assert.That(apples.Selected, Is.True, "Apples should be selected");
        Assert.That(oranges.Selected, Is.False, "Oranges should be selected");

        oranges.Click();
        Assert.That(apples.Selected, Is.False, "Apples should not be selected");
        Assert.That(oranges.Selected, Is.True, "Oranges should be selected");
    }

    [Test]
    public void CorrectlyDetectMapElementsAreShown()
    {
        Driver.Url = Urls.MapVisibilityPage;

        IWebElement area = Driver.FindElement(By.Id("mtgt_unnamed_0"));

        bool isShown = area.Displayed;
        Assert.That(isShown, Is.True, "The element and the enclosing map should be considered shown.");
    }

    //------------------------------------------------------------------
    // Tests below here are not included in the Java test suite
    //------------------------------------------------------------------
    [Test]
    public void ShouldNotBeAbleToSelectAnElementThatIsNotDisplayed()
    {
        Driver.Url = Urls.JavascriptPage;
        IWebElement element = Driver.FindElement(By.Id("untogglable"));
        Assert.That(() => element.Click(), Throws.InstanceOf<ElementNotInteractableException>());
    }

    [Test]
    public void ElementsWithOpacityZeroShouldNotBeVisible()
    {
        Driver.Url = Urls.ClickJackerPage;
        IWebElement element = Driver.FindElement(By.Id("clickJacker"));
        Assert.That(element.Displayed, Is.False);
    }
}
