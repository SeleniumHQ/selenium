// <copyright file="StaleElementReferenceTests.cs" company="Selenium Committers">
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

using System.Drawing;

namespace OpenQA.Selenium.Tests;

[TestFixture]
public class StaleElementReferenceTests : DriverTestFixture
{
    [Test]
    public void OldPage()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement elem = Driver.FindElement(By.Id("links"));
        Driver.Url = Urls.XhtmlTestPage;
        Assert.That(() => elem.Click(), Throws.InstanceOf<StaleElementReferenceException>());
    }

    [Test]
    public void ShouldNotCrashWhenCallingGetSizeOnAnObsoleteElement()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement elem = Driver.FindElement(By.Id("links"));
        Driver.Url = Urls.XhtmlTestPage;
        Assert.That(() => { Size elementSize = elem.Size; }, Throws.InstanceOf<StaleElementReferenceException>());
    }

    [Test]
    public void ShouldNotCrashWhenQueryingTheAttributeOfAStaleElement()
    {
        Driver.Url = Urls.XhtmlTestPage;
        IWebElement heading = Driver.FindElement(By.XPath("//h1"));
        Driver.Url = Urls.SimpleTestPage;
        Assert.That(() => { string className = heading.GetAttribute("class"); }, Throws.InstanceOf<StaleElementReferenceException>());
    }

    [Test]
    public void RemovingAnElementDynamicallyFromTheDomShouldCauseAStaleRefException()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement toBeDeleted = Driver.FindElement(By.Id("deleted"));
        Assert.That(toBeDeleted.Displayed, Is.True);

        Driver.FindElement(By.Id("delete")).Click();

        Assert.That(() =>
        {
            WaitFor(() =>
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
        }, Throws.Nothing, "Element should be stale at this point");
    }
}
