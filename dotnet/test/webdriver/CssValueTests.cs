// <copyright file="CssValueTests.cs" company="Selenium Committers">
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
public class CssValueTests : DriverTestFixture
{
    [Test]
    public void ShouldPickUpStyleOfAnElement()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("green-parent"));
        string backgroundColour = element.GetCssValue("background-color");

        Assert.That(backgroundColour, Is.EqualTo("#008000").Or.EqualTo("rgba(0, 128, 0, 1)").Or.EqualTo("rgb(0, 128, 0)"));

        element = Driver.FindElement(By.Id("red-item"));
        backgroundColour = element.GetCssValue("background-color");

        Assert.That(backgroundColour, Is.EqualTo("#ff0000").Or.EqualTo("rgba(255, 0, 0, 1)").Or.EqualTo("rgb(255, 0, 0)"));
    }

    [Test]
    public void GetCssValueShouldReturnStandardizedColour()
    {
        Driver.Url = Urls.WhereIs("colorPage.html");

        IWebElement element = Driver.FindElement(By.Id("namedColor"));
        string backgroundColour = element.GetCssValue("background-color");
        Assert.That(backgroundColour, Is.EqualTo("rgba(0, 128, 0, 1)").Or.EqualTo("rgb(0, 128, 0)"));

        element = Driver.FindElement(By.Id("rgb"));
        backgroundColour = element.GetCssValue("background-color");
        Assert.That(backgroundColour, Is.EqualTo("rgba(0, 128, 0, 1)").Or.EqualTo("rgb(0, 128, 0)"));
    }

    [Test]
    public void ShouldAllowInheritedStylesToBeUsed()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement element = Driver.FindElement(By.Id("green-item"));
        string backgroundColour = element.GetCssValue("background-color");

        Assert.That(backgroundColour, Is.EqualTo("transparent").Or.EqualTo("rgba(0, 0, 0, 0)"));
    }
}
