// <copyright file="PartialLinkTextMatchTests.cs" company="Selenium Committers">
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
public class PartialLinkTextMatchTests : DriverTestFixture
{
    [Test]
    public void LinkWithFormattingTags()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement elem = Driver.FindElement(By.Id("links"));

        IWebElement res = elem.FindElement(By.PartialLinkText("link with formatting tags"));
        Assert.That(res, Is.Not.Null);
        Assert.That(res.Text, Is.EqualTo("link with formatting tags"));
    }

    [Test]
    public void LinkWithLeadingSpaces()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement elem = Driver.FindElement(By.Id("links"));

        IWebElement res = elem.FindElement(By.PartialLinkText("link with leading space"));
        Assert.That(res, Is.Not.Null);
        Assert.That(res.Text, Is.EqualTo("link with leading space"));
    }

    [Test]
    public void LinkWithTrailingSpace()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement elem = Driver.FindElement(By.Id("links"));

        IWebElement res =
            elem.FindElement(By.PartialLinkText("link with trailing space"));
        Assert.That(res, Is.Not.Null);
        Assert.That(res.Text, Is.EqualTo("link with trailing space"));
    }

    [Test]
    public void FindMultipleElements()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement elem = Driver.FindElement(By.Id("links"));

        ReadOnlyCollection<IWebElement> elements = elem.FindElements(By.PartialLinkText("link"));
        Assert.That(elements, Is.Not.Null);
        Assert.That(elements, Has.Count.EqualTo(6));
    }

    [Test]
    public void DriverCanGetLinkByLinkTestIgnoringTrailingWhitespace()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement link = Driver.FindElement(By.LinkText("link with trailing space"));
        Assert.That(link.GetAttribute("id"), Is.EqualTo("linkWithTrailingSpace"));
    }

    [Test]
    public void ElementCanGetLinkByLinkTestIgnoringTrailingWhitespace()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement elem = Driver.FindElement(By.Id("links"));
        IWebElement link = elem.FindElement(By.LinkText("link with trailing space"));
        Assert.That(link.GetAttribute("id"), Is.EqualTo("linkWithTrailingSpace"));
    }
}
