// <copyright file="ElementEqualityTest.cs" company="Selenium Committers">
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
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ElementEqualityTest : DriverTestFixture
    {
        [Test]
        public void SameElementLookedUpDifferentWaysShouldBeEqual()
        {
            driver.Url = (simpleTestPage);

            IWebElement body = driver.FindElement(By.TagName("body"));
            IWebElement xbody = driver.FindElement(By.XPath("//body"));

            Assert.AreEqual(body, xbody);
        }

        [Test]
        public void DifferentElementsShouldNotBeEqual()
        {
            driver.Url = (simpleTestPage);

            ReadOnlyCollection<IWebElement> ps = driver.FindElements(By.TagName("p"));

            Assert.AreNotEqual(ps[0], ps[1]);
        }

        [Test]
        public void SameElementLookedUpDifferentWaysUsingFindElementShouldHaveSameHashCode()
        {
            driver.Url = (simpleTestPage);
            IWebElement body = driver.FindElement(By.TagName("body"));
            IWebElement xbody = driver.FindElement(By.XPath("//body"));

            Assert.AreEqual(body.GetHashCode(), xbody.GetHashCode());
        }

        public void SameElementLookedUpDifferentWaysUsingFindElementsShouldHaveSameHashCode()
        {
            driver.Url = (simpleTestPage);
            ReadOnlyCollection<IWebElement> body = driver.FindElements(By.TagName("body"));
            ReadOnlyCollection<IWebElement> xbody = driver.FindElements(By.XPath("//body"));

            Assert.AreEqual(body[0].GetHashCode(), xbody[0].GetHashCode());
        }

        [Test]
        public void AnElementFoundInViaJsShouldHaveSameId()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("missedJsReference.html");

            driver.SwitchTo().Frame("inner");
            IWebElement first = driver.FindElement(By.Id("oneline"));

            IWebElement element = (IWebElement)((IJavaScriptExecutor)driver).ExecuteScript("return document.getElementById('oneline');");

            Assert.AreEqual(first, element);
        }
    }
}
