// <copyright file="PartialLinkTextMatchTest.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium
{
    [TestFixture]
    public class PartialLinkTextMatchTest : DriverTestFixture
    {
        [Test]
        public void LinkWithFormattingTags()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));

            IWebElement res = elem.FindElement(By.PartialLinkText("link with formatting tags"));
            Assert.That(res, Is.Not.Null);
            Assert.AreEqual("link with formatting tags", res.Text);
        }

        [Test]
        public void LinkWithLeadingSpaces()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));

            IWebElement res = elem.FindElement(By.PartialLinkText("link with leading space"));
            Assert.That(res, Is.Not.Null);
            Assert.AreEqual("link with leading space", res.Text);
        }

        [Test]
        public void LinkWithTrailingSpace()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));

            IWebElement res =
                elem.FindElement(By.PartialLinkText("link with trailing space"));
            Assert.That(res, Is.Not.Null);
            Assert.AreEqual("link with trailing space", res.Text);
        }

        [Test]
        public void FindMultipleElements()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));

            ReadOnlyCollection<IWebElement> elements = elem.FindElements(By.PartialLinkText("link"));
            Assert.That(elements, Is.Not.Null);
            Assert.AreEqual(6, elements.Count);
        }

        [Test]
        public void DriverCanGetLinkByLinkTestIgnoringTrailingWhitespace()
        {
            driver.Url = simpleTestPage;
            IWebElement link = null;
            link = driver.FindElement(By.LinkText("link with trailing space"));
            Assert.AreEqual("linkWithTrailingSpace", link.GetAttribute("id"));
        }

        [Test]
        public void ElementCanGetLinkByLinkTestIgnoringTrailingWhitespace()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));

            IWebElement link = null;
            link = elem.FindElement(By.LinkText("link with trailing space"));
            Assert.AreEqual("linkWithTrailingSpace", link.GetAttribute("id"));
        }
    }
}
