// <copyright file="SvgElementTest.cs" company="Selenium Committers">
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
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium;

[TestFixture]
public class SvgElementTest : DriverTestFixture
{
    [Test]
    [IgnoreBrowser(Browser.Firefox, "wontfix: https://bugzilla.mozilla.org/show_bug.cgi?id=1428780")]
    public void ShouldClickOnGraphVisualElements()
    {
        if (TestUtilities.IsOldIE(driver))
        {
            Assert.Ignore("SVG support only exists in IE9+");
        }

        driver.Url = svgPage;
        IWebElement svg = driver.FindElement(By.CssSelector("svg"));

        ReadOnlyCollection<IWebElement> groupElements = svg.FindElements(By.CssSelector("g"));
        Assert.That(groupElements, Has.Count.EqualTo(5));

        groupElements[1].Click();
        IWebElement resultElement = driver.FindElement(By.Id("result"));
        WaitFor(() => { return resultElement.Text == "slice_red"; }, "Element text was not 'slice_red'");
        Assert.That(resultElement.Text, Is.EqualTo("slice_red"));

        groupElements[2].Click();
        resultElement = driver.FindElement(By.Id("result"));
        WaitFor(() => { return resultElement.Text == "slice_green"; }, "Element text was not 'slice_green'");
        Assert.That(resultElement.Text, Is.EqualTo("slice_green"));
    }

    [Test]
    public void ShouldClickOnGraphTextElements()
    {
        if (TestUtilities.IsOldIE(driver))
        {
            Assert.Ignore("SVG support only exists in IE9+");
        }

        driver.Url = svgPage;
        IWebElement svg = driver.FindElement(By.CssSelector("svg"));
        ReadOnlyCollection<IWebElement> textElements = svg.FindElements(By.CssSelector("text"));

        IWebElement appleElement = FindAppleElement(textElements);
        Assert.That(appleElement, Is.Not.Null);

        appleElement.Click();
        IWebElement resultElement = driver.FindElement(By.Id("result"));
        WaitFor(() => { return resultElement.Text == "text_apple"; }, "Element text was not 'text_apple'");
        Assert.That(resultElement.Text, Is.EqualTo("text_apple"));
    }

    private IWebElement FindAppleElement(IEnumerable<IWebElement> textElements)
    {
        foreach (IWebElement currentElement in textElements)
        {
            if (currentElement.Text.Contains("Apple"))
            {
                return currentElement;
            }
        }

        return null;
    }
}
