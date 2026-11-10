// <copyright file="TextPagesTests.cs" company="Selenium Committers">
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
public class TextPagesTests : DriverTestFixture
{
    private readonly string textPage = Urls.WhereIs("plain.txt");

    [Test]
    public void ShouldBeAbleToLoadASimplePageOfText()
    {
        Driver.Url = textPage;
        string source = Driver.PageSource;
        Assert.That(source, Does.Contain("Test"));
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "IE allows addition of cookie on text pages")]
    [IgnoreBrowser(Browser.Chrome, "Chrome allows addition of cookie on text pages")]
    [IgnoreBrowser(Browser.Edge, "Edge allows addition of cookie on text pages")]
    [IgnoreBrowser(Browser.Firefox, "Firefox allows addition of cookie on text pages")]
    [IgnoreBrowser(Browser.Safari, "Safari allows addition of cookie on text pages")]
    public void ShouldThrowExceptionWhenAddingCookieToAPageThatIsNotHtml()
    {
        Driver.Url = textPage;

        Cookie cookie = new Cookie("hello", "goodbye");
        Assert.That(() => Driver.Manage().Cookies.AddCookie(cookie), Throws.InstanceOf<WebDriverException>());
    }

    //------------------------------------------------------------------
    // Tests below here are not included in the Java test suite
    //------------------------------------------------------------------
    [Test]
    public void FindingAnElementOnAPlainTextPageWillNeverWork()
    {
        Driver.Url = textPage;
        Assert.That(() => Driver.FindElement(By.Id("foo")), Throws.InstanceOf<NoSuchElementException>());
    }
}
