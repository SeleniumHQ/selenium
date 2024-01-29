// <copyright file="TextPagesTest.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium
{
    [TestFixture]
    public class TextPagesTest : DriverTestFixture
    {
        private string textPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("plain.txt");

        [Test]
        public void ShouldBeAbleToLoadASimplePageOfText()
        {
            driver.Url = textPage;
            string source = driver.PageSource;
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
            driver.Url = textPage;

            Cookie cookie = new Cookie("hello", "goodbye");
            Assert.That(() => driver.Manage().Cookies.AddCookie(cookie), Throws.InstanceOf<WebDriverException>());
        }

        //------------------------------------------------------------------
        // Tests below here are not included in the Java test suite
        //------------------------------------------------------------------
        [Test]
        public void FindingAnElementOnAPlainTextPageWillNeverWork()
        {
            driver.Url = textPage;
            Assert.That(() => driver.FindElement(By.Id("foo")), Throws.InstanceOf<NoSuchElementException>());
        }
    }
}
