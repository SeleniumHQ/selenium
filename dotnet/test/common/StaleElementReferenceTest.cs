// <copyright file="StaleElementReferenceTest.cs" company="Selenium Committers">
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
using System.Drawing;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class StaleElementReferenceTest : DriverTestFixture
    {
        [Test]
        public void OldPage()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));
            driver.Url = xhtmlTestPage;
            Assert.That(() => elem.Click(), Throws.InstanceOf<StaleElementReferenceException>());
        }

        [Test]
        public void ShouldNotCrashWhenCallingGetSizeOnAnObsoleteElement()
        {
            driver.Url = simpleTestPage;
            IWebElement elem = driver.FindElement(By.Id("links"));
            driver.Url = xhtmlTestPage;
            Assert.That(() => { Size elementSize = elem.Size; }, Throws.InstanceOf<StaleElementReferenceException>());
        }

        [Test]
        public void ShouldNotCrashWhenQueryingTheAttributeOfAStaleElement()
        {
            driver.Url = xhtmlTestPage;
            IWebElement heading = driver.FindElement(By.XPath("//h1"));
            driver.Url = simpleTestPage;
            Assert.That(() => { string className = heading.GetAttribute("class"); }, Throws.InstanceOf<StaleElementReferenceException>());
        }

        [Test]
        public void RemovingAnElementDynamicallyFromTheDomShouldCauseAStaleRefException()
        {
            driver.Url = javascriptPage;

            IWebElement toBeDeleted = driver.FindElement(By.Id("deleted"));
            Assert.That(toBeDeleted.Displayed, Is.True);

            driver.FindElement(By.Id("delete")).Click();

            bool wasStale = WaitFor(() =>
            {
                try
                {
                    string tagName = toBeDeleted.TagName;
                    return false;
                }
                catch (StaleElementReferenceException)
                {
                    return true;
                }
            }, "Element did not become stale.");
            Assert.That(wasStale, Is.True, "Element should be stale at this point");
        }
    }
}
