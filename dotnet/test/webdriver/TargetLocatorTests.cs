// <copyright file="TargetLocatorTests.cs" company="Selenium Committers">
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
public class TargetLocatorTests : DriverTestFixture
{

    [Test]
    public void ShouldThrowExceptionAfterSwitchingToNonExistingFrameIndex()
    {
        Driver.Url = Urls.FramesPage;

        Assert.That(
            () => Driver.SwitchTo().Frame(10),
            Throws.TypeOf<NoSuchFrameException>());
    }

    [Test]
    public void ShouldThrowExceptionAfterSwitchingToNonExistingFrameName()
    {
        Driver.Url = Urls.FramesPage;

        Assert.That(
            () => Driver.SwitchTo().Frame("æ©ñµøöíúüþ®éåä²doesnotexist"),
            Throws.TypeOf<NoSuchFrameException>());
    }

    [Test]
    public void ShouldThrowExceptionAfterSwitchingToNullFrameName()
    {
        string frameName = null;
        Driver.Url = Urls.FramesPage;

        Assert.That(
            () => Driver.SwitchTo().Frame(frameName),
            Throws.TypeOf<ArgumentNullException>());
    }

    [Test]
    public void ShouldSwitchToIframeByNameAndBackToDefaultContent()
    {
        Driver.Url = Urls.IframesPage;
        Driver.SwitchTo().Frame("iframe1");
        IWebElement element = Driver.FindElement(By.Name("id-name1"));
        Assert.That(element, Is.Not.Null);

        Driver.SwitchTo().DefaultContent();
        element = Driver.FindElement(By.Id("iframe_page_heading"));
        Assert.That(element, Is.Not.Null);
    }

    [Test]
    public void ShouldSwitchToIframeByIndexAndBackToDefaultContent()
    {
        Driver.Url = Urls.IframesPage;
        Driver.SwitchTo().Frame(0);
        IWebElement element = Driver.FindElement(By.Name("id-name1"));
        Assert.That(element, Is.Not.Null);

        Driver.SwitchTo().DefaultContent();
        element = Driver.FindElement(By.Id("iframe_page_heading"));
        Assert.That(element, Is.Not.Null);
    }

    [Test]
    public void ShouldSwitchToFrameByNameAndBackToDefaultContent()
    {
        Driver.Url = Urls.FramesPage;

        Driver.SwitchTo().Frame("first");
        Assert.That(Driver.FindElement(By.Id("pageNumber")).Text, Is.EqualTo("1"));

        Driver.SwitchTo().DefaultContent();

        // DefaultContent should not have the element in it.
        Assert.That(
            () => Driver.FindElement(By.Id("pageNumber")),
            Throws.TypeOf<NoSuchElementException>());

        Driver.SwitchTo().Frame("second");
        Assert.That(Driver.FindElement(By.Id("pageNumber")).Text, Is.EqualTo("2"));

        Driver.SwitchTo().DefaultContent();

        // DefaultContent should not have the element in it.
        Assert.That(
            () => Driver.FindElement(By.Id("pageNumber")),
            Throws.TypeOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldSwitchToFrameByIndexAndBackToDefaultContent()
    {
        Driver.Url = Urls.FramesPage;

        Driver.SwitchTo().Frame(0);
        Assert.That(Driver.FindElement(By.Id("pageNumber")).Text, Is.EqualTo("1"));

        Driver.SwitchTo().DefaultContent();

        // DefaultContent should not have the element in it.
        Assert.That(
            () => Driver.FindElement(By.Id("pageNumber")),
            Throws.TypeOf<NoSuchElementException>());

        Driver.SwitchTo().Frame(1);
        Assert.That(Driver.FindElement(By.Id("pageNumber")).Text, Is.EqualTo("2"));

        Driver.SwitchTo().DefaultContent();

        // DefaultContent should not have the element in it.
        Assert.That(
            () => Driver.FindElement(By.Id("pageNumber")).Text,
            Throws.TypeOf<NoSuchElementException>());
    }

}
