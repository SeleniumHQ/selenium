// <copyright file="SvgDocumentTest.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium
{
    [TestFixture]
    public class SvgDocumentTest : DriverTestFixture
    {
        [Test]
        [IgnoreBrowser(Browser.IE, "IE driver in Edge does not support clicking on SVG element")]
        [IgnoreBrowser(Browser.Chrome, "Chrome driver does not support clicking on SVG element yet")]
        [IgnoreBrowser(Browser.Edge, "Edge driver does not support clicking on SVG element yet")]
        public void ClickOnSvgElement()
        {
            if (TestUtilities.IsOldIE(driver))
            {
                Assert.Ignore("SVG support only exists in IE9+");
            }

            driver.Url = svgTestPage;
            IWebElement rect = driver.FindElement(By.Id("rect"));

            Assert.AreEqual("blue", rect.GetAttribute("fill"));
            rect.Click();
            Assert.AreEqual("green", rect.GetAttribute("fill"));
        }

        [Test]
        public void ExecuteScriptInSvgDocument()
        {
            if (TestUtilities.IsOldIE(driver))
            {
                Assert.Ignore("SVG support only exists in IE9+");
            }

            driver.Url = svgTestPage;
            IWebElement rect = driver.FindElement(By.Id("rect"));

            Assert.AreEqual("blue", rect.GetAttribute("fill"));
            ((IJavaScriptExecutor)driver).ExecuteScript("document.getElementById('rect').setAttribute('fill', 'yellow');");
            Assert.AreEqual("yellow", rect.GetAttribute("fill"));
        }
    }
}
