// <copyright file="ShadowRootHandlingTest.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium;

[IgnoreBrowser(Browser.IE, "IE does not support Shadow DOM natively")]
[IgnoreBrowser(Browser.Safari, "Safari driver does not support Shadow DOM end points")]
[TestFixture]
public class ShadowRootHandlingTest : DriverTestFixture
{
    [Test]
    public void ShouldReturnShadowRoot()
    {
        driver.Url = shadowRootPage;
        IWebElement element = driver.FindElement(By.CssSelector("custom-checkbox-element"));
        ISearchContext shadowRoot = element.GetShadowRoot();
        Assert.That(shadowRoot, Is.Not.Null, "Did not find shadow root");
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Firefox does not support finding Shadow DOM elements")]
    public void ShouldFindElementUnderShadowRoot()
    {
        driver.Url = shadowRootPage;
        IWebElement element = driver.FindElement(By.CssSelector("custom-checkbox-element"));
        ISearchContext shadowRoot = element.GetShadowRoot();
        IWebElement elementInShadow = shadowRoot.FindElement(By.CssSelector("input"));
        Assert.That(elementInShadow.GetAttribute("type"), Is.EqualTo("checkbox"), "Did not find element in shadow root");
    }

    [Test]
    [IgnoreBrowser(Browser.Chrome, "https://issues.chromium.org/issues/375892677")]
    [IgnoreBrowser(Browser.Edge, "https://issues.chromium.org/issues/375892677")]
    public void ShouldThrowGettingShadowRootWithElementNotHavingShadowRoot()
    {
        driver.Url = shadowRootPage;
        IWebElement element = driver.FindElement(By.CssSelector("#noShadowRoot"));
        Assert.That(() => element.GetShadowRoot(), Throws.InstanceOf(typeof(NoSuchShadowRootException)));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Firefox does not support finding Shadow DOM elements")]
    public void ShouldGetShadowRootReferenceFromJavaScript()
    {
        driver.Url = shadowRootPage;
        IWebElement element = driver.FindElement(By.CssSelector("custom-checkbox-element"));
        object shadowRoot = ((IJavaScriptExecutor)driver).ExecuteScript("return arguments[0].shadowRoot;", element);
        Assert.That(shadowRoot, Is.InstanceOf<ISearchContext>(), "Did not find shadow root");
    }

    [Test]
    public void ShouldAllowShadowRootReferenceAsArgumentToJavaScript()
    {
        driver.Url = shadowRootPage;
        IWebElement element = driver.FindElement(By.CssSelector("custom-checkbox-element"));
        ISearchContext shadowRoot = element.GetShadowRoot();
        object elementInShadow = ((IJavaScriptExecutor)driver).ExecuteScript("return arguments[0].querySelector('input');", shadowRoot);
        Assert.That(elementInShadow, Is.InstanceOf<IWebElement>(), "Did not find shadow root");
    }
}
