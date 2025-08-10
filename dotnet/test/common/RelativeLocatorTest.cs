// <copyright file="RelativeLocatorTest.cs" company="Selenium Committers">
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
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace OpenQA.Selenium;

[TestFixture]
[IgnoreBrowser(Browser.IE, "IE does not like this JS")]
public class RelativeLocatorTest : DriverTestFixture
{
    [Test]
    public void ShouldBeAbleToFindElementsAboveAnotherWithTagName()
    {
        driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

        IWebElement lowest = driver.FindElement(By.Id("below"));

        ReadOnlyCollection<IWebElement> elements = driver.FindElements(RelativeBy.WithLocator(By.TagName("p")).Above(lowest));

        var values = elements.Select(element => element.GetDomAttribute("id"));
        Assert.That(values, Is.EquivalentTo(new List<string>() { "above", "mid" }));
    }

    [Test]
    public void ShouldBeAbleToFindElementsAboveAnotherWithXpath()
    {
        driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

        IWebElement lowest = driver.FindElement(By.Id("bottomLeft"));

        var elements = driver.FindElements(RelativeBy.WithLocator(By.XPath("//td[1]")).Above(lowest));

        var values = elements.Select(element => element.GetDomAttribute("id"));
        Assert.That(values, Is.EquivalentTo(new List<string> { "left", "topLeft" }));
    }

    [Test]
    public void ShouldBeAbleToFindElementsAboveAnotherWithCssSelector()
    {
        driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

        IWebElement lowest = driver.FindElement(By.Id("below"));

        var elements = driver.FindElements(RelativeBy.WithLocator(By.CssSelector("p")).Above(lowest));

        var values = elements.Select(element => element.GetDomAttribute("id"));
        Assert.That(values, Is.EquivalentTo(new List<string> { "mid", "above" }));
    }

    [Test]
    public void ShouldBeAbleToCombineFilters()
    {
        driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

        ReadOnlyCollection<IWebElement> seen = driver.FindElements(RelativeBy.WithLocator(By.TagName("td")).Above(By.Id("center")).RightOf(By.Id("top")));

        var elementIds = seen.Select(element => element.GetDomAttribute("id"));
        Assert.That(elementIds, Is.EquivalentTo(new List<string>() { "topRight" }));
    }


    [Test]
    public void ShouldBeAbleToCombineFiltersWithXpath()
    {
        driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

        ReadOnlyCollection<IWebElement> seen = driver.FindElements(RelativeBy.WithLocator(By.XPath("//td[1]")).Below(By.Id("top")).Above(By.Id("bottomLeft")));

        var values = seen.Select(element => element.GetDomAttribute("id"));
        Assert.That(values, Is.EquivalentTo(new List<string> { "left" }));
    }

    [Test]
    public void ShouldBeAbleToCombineFiltersWithCssSelector()
    {
        driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

        ReadOnlyCollection<IWebElement> seen = driver.FindElements(
            RelativeBy.WithLocator(By.CssSelector("td")).Above(By.Id("center")).RightOf(By.Id("top")));

        var values = seen.Select(element => element.GetDomAttribute("id"));
        Assert.That(values, Is.EquivalentTo(new List<string> { "topRight" }));
    }

    [Test]
    public void ExerciseNearLocatorWithTagName()
    {
        driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

        ReadOnlyCollection<IWebElement> seen = driver.FindElements(RelativeBy.WithLocator(By.TagName("td")).Near(By.Id("center")));

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
        driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

        ReadOnlyCollection<IWebElement> seen = driver.FindElements(RelativeBy.WithLocator(By.XPath("//td")).Near(By.Id("center")));

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
        driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

        ReadOnlyCollection<IWebElement> seen = driver.FindElements(RelativeBy.WithLocator(By.CssSelector("td")).Near(By.Id("center")));

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
        driver.Url = EnvironmentManager.Instance.UrlBuilder.CreateInlinePage(new InlinePage()
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

        IWebElement @base = driver.FindElement(By.Id("e"));
        ReadOnlyCollection<IWebElement> cells = driver.FindElements(RelativeBy.WithLocator(By.TagName("div")).Above(@base));

        IWebElement a = driver.FindElement(By.Id("a"));
        IWebElement b = driver.FindElement(By.Id("b"));

        var values = cells.Select(element => element.GetDomAttribute("id"));
        Assert.That(values, Is.EqualTo(new List<string> { b.GetDomAttribute("id"), a.GetDomAttribute("id") }));
    }

    [Test]
    public void NearLocatorShouldFindNearElements()
    {
        driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

        var rect1 = driver.FindElement(By.Id("rect1"));

        var rect2 = driver.FindElement(RelativeBy.WithLocator(By.Id("rect2")).Near(rect1));

        Assert.That(rect2.GetDomAttribute("id"), Is.EqualTo("rect2"));
    }

    [Test]
    public void NearLocatorShouldNotFindFarElements()
    {
        driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

        var rect = driver.FindElement(By.Id("rect1"));

        Assert.That(() =>
        {
            var rect2 = driver.FindElement(RelativeBy.WithLocator(By.Id("rect4")).Near(rect));

        }, Throws.TypeOf<NoSuchElementException>().With.Message.EqualTo("Unable to find element; For documentation on this error, please visit: https://www.selenium.dev/documentation/webdriver/troubleshooting/errors#no-such-element-exception"));
    }

    //------------------------------------------------------------------
    // Tests below here are not included in the Java test suite
    //------------------------------------------------------------------

    [Test]
    public void ShouldReturnEmptyListWhenNoElementsFound()
    {
        driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

        var elements = driver.FindElements(RelativeBy.WithLocator(By.TagName("does-not-exist")));

        Assert.That(elements, Is.Empty);
    }
}
