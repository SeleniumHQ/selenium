// <copyright file="RelativeLocatorTests.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.Tests;

[TestFixture]
[IgnoreBrowser(Browser.IE, "IE does not like this JS")]
public class RelativeLocatorTests : DriverTestFixture
{
    [Test]
    public void ShouldBeAbleToFindElementsAboveAnotherWithTagName()
    {
        Driver.Url = (Urls.WhereIs("relative_locators.html"));

        IWebElement lowest = Driver.FindElement(By.Id("below"));

        ReadOnlyCollection<IWebElement> elements = Driver.FindElements(RelativeBy.WithLocator(By.TagName("p")).Above(lowest));

        var values = elements.Select(element => element.GetDomAttribute("id"));
        Assert.That(values, Is.EquivalentTo(new List<string>() { "above", "mid" }));
    }

    [Test]
    public void ShouldBeAbleToFindElementsAboveAnotherWithXpath()
    {
        Driver.Url = (Urls.WhereIs("relative_locators.html"));

        IWebElement lowest = Driver.FindElement(By.Id("bottomLeft"));

        var elements = Driver.FindElements(RelativeBy.WithLocator(By.XPath("//td[1]")).Above(lowest));

        var values = elements.Select(element => element.GetDomAttribute("id"));
        Assert.That(values, Is.EquivalentTo(new List<string> { "left", "topLeft" }));
    }

    [Test]
    public void ShouldBeAbleToFindElementsAboveAnotherWithCssSelector()
    {
        Driver.Url = (Urls.WhereIs("relative_locators.html"));

        IWebElement lowest = Driver.FindElement(By.Id("below"));

        var elements = Driver.FindElements(RelativeBy.WithLocator(By.CssSelector("p")).Above(lowest));

        var values = elements.Select(element => element.GetDomAttribute("id"));
        Assert.That(values, Is.EquivalentTo(new List<string> { "mid", "above" }));
    }

    [Test]
    public void ShouldBeAbleToCombineFilters()
    {
        Driver.Url = (Urls.WhereIs("relative_locators.html"));

        ReadOnlyCollection<IWebElement> seen = Driver.FindElements(RelativeBy.WithLocator(By.TagName("td")).Above(By.Id("center")).RightOf(By.Id("top")));

        var elementIds = seen.Select(element => element.GetDomAttribute("id"));
        Assert.That(elementIds, Is.EquivalentTo(new List<string>() { "topRight" }));
    }

    [Test]
    public void ShouldBeAbleToCombineFiltersWithXpath()
    {
        Driver.Url = (Urls.WhereIs("relative_locators.html"));

        ReadOnlyCollection<IWebElement> seen = Driver.FindElements(RelativeBy.WithLocator(By.XPath("//td[1]")).Below(By.Id("top")).Above(By.Id("bottomLeft")));

        var values = seen.Select(element => element.GetDomAttribute("id"));
        Assert.That(values, Is.EquivalentTo(new List<string> { "left" }));
    }

    [Test]
    public void ShouldBeAbleToCombineFiltersWithCssSelector()
    {
        Driver.Url = (Urls.WhereIs("relative_locators.html"));

        ReadOnlyCollection<IWebElement> seen = Driver.FindElements(
            RelativeBy.WithLocator(By.CssSelector("td")).Above(By.Id("center")).RightOf(By.Id("top")));

        var values = seen.Select(element => element.GetDomAttribute("id"));
        Assert.That(values, Is.EquivalentTo(new List<string> { "topRight" }));
    }

    [Test]
    public void ExerciseNearLocatorWithTagName()
    {
        Driver.Url = (Urls.WhereIs("relative_locators.html"));

        ReadOnlyCollection<IWebElement> seen = Driver.FindElements(RelativeBy.WithLocator(By.TagName("td")).Near(By.Id("center")));

        // Elements are sorted by proximity and then DOM insertion order.
        // Proximity is determined using distance from center points, so
        // we expect the order to be:
        // 1. Directly above (short vertical distance, first in DOM)
        // 2. Directly below (short vertical distance, later in DOM)
        // 3. Directly left (slight longer distance horizontally, first in DOM)
        // 4. Directly right (slight longer distance horizontally, later in DOM)
        // 5-8. Diagonally close (pythagoras sorting, with top row first
        //    because of DOM insertion order)
        var values = seen.Select(element => element.GetDomAttribute("id"));
        Assert.That(values, Is.EquivalentTo(new List<string> { "top", "bottom", "left", "right", "topLeft", "topRight", "bottomLeft", "bottomRight" }));
    }

    [Test]
    public void ExerciseNearLocatorWithXpath()
    {
        Driver.Url = (Urls.WhereIs("relative_locators.html"));

        ReadOnlyCollection<IWebElement> seen = Driver.FindElements(RelativeBy.WithLocator(By.XPath("//td")).Near(By.Id("center")));

        // Elements are sorted by proximity and then DOM insertion order.
        // Proximity is determined using distance from center points, so
        // we expect the order to be:
        // 1. Directly above (short vertical distance, first in DOM)
        // 2. Directly below (short vertical distance, later in DOM)
        // 3. Directly left (slight longer distance horizontally, first in DOM)
        // 4. Directly right (slight longer distance horizontally, later in DOM)
        // 5-8. Diagonally close (pythagoras sorting, with top row first
        //    because of DOM insertion order)
        var values = seen.Select(element => element.GetDomAttribute("id"));
        Assert.That(values, Is.EquivalentTo(new List<string> { "top", "bottom", "left", "right", "topLeft", "topRight", "bottomLeft", "bottomRight" }));
    }

    [Test]
    public void ExerciseNearLocatorWithCssSelector()
    {
        Driver.Url = (Urls.WhereIs("relative_locators.html"));

        ReadOnlyCollection<IWebElement> seen = Driver.FindElements(RelativeBy.WithLocator(By.CssSelector("td")).Near(By.Id("center")));

        // Elements are sorted by proximity and then DOM insertion order.
        // Proximity is determined using distance from center points, so
        // we expect the order to be:
        // 1. Directly above (short vertical distance, first in DOM)
        // 2. Directly below (short vertical distance, later in DOM)
        // 3. Directly left (slight longer distance horizontally, first in DOM)
        // 4. Directly right (slight longer distance horizontally, later in DOM)
        // 5-8. Diagonally close (pythagoras sorting, with top row first
        //    because of DOM insertion order)
        var values = seen.Select(element => element.GetDomAttribute("id"));
        Assert.That(values, Is.EquivalentTo(new List<string> { "top", "bottom", "left", "right", "topLeft", "topRight", "bottomLeft", "bottomRight" }));
    }

    [Test]
    public void EnsureNoRepeatedElements()
    {
        Driver.Url = Urls.CreateInlinePage(new InlinePage()
           .WithTitle("Repeated Elements")
           .WithStyles(
            """
             .c {
                	position: absolute;
                	border: 1px solid black;
                	height: 50px;
                	width: 50px;
                }
            """
            )
           .WithBody(
              """
              <span style="position: relative;">
                  <div id= "a" class="c" style="left:25;top:0;">El-A</div>
                  <div id= "b" class="c" style="left:78;top:30;">El-B</div>
                  <div id= "c" class="c" style="left:131;top:60;">El-C</div>
                  <div id= "d" class="c" style="left:0;top:53;">El-D</div>
                  <div id= "e" class="c" style="left:53;top:83;">El-E</div>
                  <div id= "f" class="c" style="left:106;top:113;">El-F</div>
                </span>
              """
            ));

        IWebElement @base = Driver.FindElement(By.Id("e"));
        ReadOnlyCollection<IWebElement> cells = Driver.FindElements(RelativeBy.WithLocator(By.TagName("div")).Above(@base));

        IWebElement a = Driver.FindElement(By.Id("a"));
        IWebElement b = Driver.FindElement(By.Id("b"));

        var values = cells.Select(element => element.GetDomAttribute("id"));
        Assert.That(values, Is.EqualTo(new List<string> { b.GetDomAttribute("id"), a.GetDomAttribute("id") }));
    }

    [Test]
    public void NearLocatorShouldFindNearElements()
    {
        Driver.Url = (Urls.WhereIs("relative_locators.html"));

        var rect1 = Driver.FindElement(By.Id("rect1"));

        var rect2 = Driver.FindElement(RelativeBy.WithLocator(By.Id("rect2")).Near(rect1));

        Assert.That(rect2.GetDomAttribute("id"), Is.EqualTo("rect2"));
    }

    [Test]
    public void NearLocatorShouldNotFindFarElements()
    {
        Driver.Url = (Urls.WhereIs("relative_locators.html"));

        var rect = Driver.FindElement(By.Id("rect1"));

        Assert.That(() =>
        {
            var rect2 = Driver.FindElement(RelativeBy.WithLocator(By.Id("rect4")).Near(rect));

        }, Throws.TypeOf<NoSuchElementException>().With.Message.EqualTo("Unable to find element; For documentation on this error, please visit: https://www.selenium.dev/documentation/webdriver/troubleshooting/errors#nosuchelementexception"));
    }

    //------------------------------------------------------------------
    // Tests below here are not included in the Java test suite
    //------------------------------------------------------------------

    [Test]
    public void ShouldReturnEmptyListWhenNoElementsFound()
    {
        Driver.Url = (Urls.WhereIs("relative_locators.html"));

        var elements = Driver.FindElements(RelativeBy.WithLocator(By.TagName("does-not-exist")));

        Assert.That(elements, Is.Empty);
    }
}
