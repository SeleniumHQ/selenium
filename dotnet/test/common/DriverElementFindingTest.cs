// <copyright file="DriverElementFindingTest.cs" company="Selenium Committers">
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
    public class DriverElementFindingTest : DriverTestFixture
    {

        #region FindElemement Tests

        [Test]
        public void ShouldFindElementById()
        {
            driver.Url = simpleTestPage;
            IWebElement e = driver.FindElement(By.Id("oneline"));
            Assert.That(e.Text, Is.EqualTo("A single line of text"));
        }

        [Test]
        public void ShouldFindElementByLinkText()
        {
            driver.Url = simpleTestPage;
            IWebElement e = driver.FindElement(By.LinkText("link with leading space"));
            Assert.That(e.Text, Is.EqualTo("link with leading space"));
        }

        [Test]
        public void ShouldFindElementByName()
        {
            driver.Url = nestedPage;
            IWebElement e = driver.FindElement(By.Name("div1"));
            Assert.That(e.Text, Is.EqualTo("hello world hello world"));
        }

        [Test]
        public void ShouldFindElementByXPath()
        {
            driver.Url = simpleTestPage;
            IWebElement e = driver.FindElement(By.XPath("/html/body/p[1]"));
            Assert.That(e.Text, Is.EqualTo("A single line of text"));
        }

        [Test]
        public void ShouldFindElementByClassName()
        {
            driver.Url = nestedPage;
            IWebElement e = driver.FindElement(By.ClassName("one"));
            Assert.That(e.Text, Is.EqualTo("Span with class of one"));
        }

        [Test]
        public void ShouldFindElementByPartialLinkText()
        {
            driver.Url = simpleTestPage;
            IWebElement e = driver.FindElement(By.PartialLinkText("leading space"));
            Assert.That(e.Text, Is.EqualTo("link with leading space"));
        }

        [Test]
        public void ShouldFindElementByTagName()
        {
            driver.Url = simpleTestPage;
            IWebElement e = driver.FindElement(By.TagName("H1"));
            Assert.That(e.Text, Is.EqualTo("Heading"));
        }
        #endregion

        //TODO(andre.nogueira): We're not checking the right elements are being returned!
        #region FindElemements Tests

        [Test]
        public void ShouldFindElementsById()
        {
            driver.Url = nestedPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.Id("test_id"));
            Assert.That(elements.Count, Is.EqualTo(2));
        }

        [Test]
        public void ShouldFindElementsByLinkText()
        {
            driver.Url = nestedPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.LinkText("hello world"));
            Assert.That(elements.Count, Is.EqualTo(12));
        }

        [Test]
        public void ShouldFindElementsByName()
        {
            driver.Url = nestedPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.Name("form1"));
            Assert.That(elements.Count, Is.EqualTo(4));
        }

        [Test]
        public void ShouldFindElementsByXPath()
        {
            driver.Url = nestedPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.XPath("//a"));
            Assert.That(elements.Count, Is.EqualTo(12));
        }

        [Test]
        public void ShouldFindElementsByClassName()
        {
            driver.Url = nestedPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.ClassName("one"));
            Assert.That(elements.Count, Is.EqualTo(3));
        }

        [Test]
        public void ShouldFindElementsByPartialLinkText()
        {
            driver.Url = nestedPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.PartialLinkText("world"));
            Assert.That(elements.Count, Is.EqualTo(12));
        }

        [Test]
        public void ShouldFindElementsByTagName()
        {
            driver.Url = nestedPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.TagName("a"));
            Assert.That(elements.Count, Is.EqualTo(12));
        }
        #endregion
    }
}
