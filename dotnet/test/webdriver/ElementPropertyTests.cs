// <copyright file="ElementPropertyTests.cs" company="Selenium Committers">
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
public class ElementPropertyTests : DriverTestFixture
{
    [Test]
    [IgnoreBrowser(Browser.Remote)]
    public void ShouldReturnNullWhenGettingTheValueOfAPropertyThatIsNotListed()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement head = Driver.FindElement(By.XPath("/html"));
        string attribute = head.GetDomProperty("cheese");
        Assert.That(attribute, Is.Null);
    }

    [Test]
    [IgnoreBrowser(Browser.Remote)]
    public void CanRetrieveTheCurrentValueOfAProperty()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement element = Driver.FindElement(By.Id("working"));

        Assert.That(element.GetDomProperty("value"), Is.Empty);
        element.SendKeys("hello world");
        Assert.That(element.GetDomProperty("value"), Is.EqualTo("hello world"));
    }
}
