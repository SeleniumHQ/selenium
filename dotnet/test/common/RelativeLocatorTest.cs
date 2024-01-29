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
using System.Collections.ObjectModel;
using OpenQA.Selenium.Environment;
using System.Collections.Generic;

namespace OpenQA.Selenium
{
    [TestFixture]
    [IgnoreBrowser(Browser.IE, "IE does not like this JS")]
    public class RelativeLocatorTest : DriverTestFixture
    {
        [Test]
        public void ShouldBeAbleToFindElementsAboveAnother()
        {
            driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

            IWebElement lowest = driver.FindElement(By.Id("below"));

            ReadOnlyCollection<IWebElement> elements = driver.FindElements(RelativeBy.WithLocator(By.TagName("p")).Above(lowest));
            List<string> elementIds = new List<string>();
            foreach (IWebElement element in elements)
            {
                string id = element.GetAttribute("id");
                elementIds.Add(id);
            }

            Assert.That(elementIds, Is.EquivalentTo(new List<string>() { "above", "mid" }));
        }

        [Test]
        public void ShouldBeAbleToCombineFilters()
        {
            driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

            ReadOnlyCollection<IWebElement> seen = driver.FindElements(RelativeBy.WithLocator(By.TagName("td")).Above(By.Id("center")).RightOf(By.Id("second")));

            List<string> elementIds = new List<string>();
            foreach (IWebElement element in seen)
            {
                string id = element.GetAttribute("id");
                elementIds.Add(id);
            }

            Assert.That(elementIds, Is.EquivalentTo(new List<string>() { "third" }));
        }
    }
}
