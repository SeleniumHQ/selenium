// <copyright file="TargetLocatorTest.cs" company="Selenium Committers">
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
using System;

namespace OpenQA.Selenium;

[TestFixture]
public class TargetLocatorTest : DriverTestFixture
{

    [Test]
    public void ShouldThrowExceptionAfterSwitchingToNonExistingFrameIndex()
    {
        driver.Url = framesPage;

        Assert.That(
            () => driver.SwitchTo().Frame(10),
            Throws.TypeOf<NoSuchFrameException>());
    }

    [Test]
    public void ShouldThrowExceptionAfterSwitchingToNonExistingFrameName()
    {
        driver.Url = framesPage;

        Assert.That(
            () => driver.SwitchTo().Frame("æ©ñµøöíúüþ®éåä²doesnotexist"),
            Throws.TypeOf<NoSuchFrameException>());
    }

    [Test]
    public void ShouldThrowExceptionAfterSwitchingToNullFrameName()
    {
        string frameName = null;
        driver.Url = framesPage;

        Assert.That(
            () => driver.SwitchTo().Frame(frameName),
            Throws.TypeOf<ArgumentNullException>());
    }

    [Test]
    public void ShouldSwitchToIframeByNameAndBackToDefaultContent()
    {
        driver.Url = iframesPage;
        driver.SwitchTo().Frame("iframe1");
        IWebElement element = driver.FindElement(By.Name("id-name1"));
        Assert.That(element, Is.Not.Null);

        driver.SwitchTo().DefaultContent();
        element = driver.FindElement(By.Id("iframe_page_heading"));
        Assert.That(element, Is.Not.Null);
    }

    [Test]
    public void ShouldSwitchToIframeByIndexAndBackToDefaultContent()
    {
        driver.Url = iframesPage;
        driver.SwitchTo().Frame(0);
        IWebElement element = driver.FindElement(By.Name("id-name1"));
        Assert.That(element, Is.Not.Null);

        driver.SwitchTo().DefaultContent();
        element = driver.FindElement(By.Id("iframe_page_heading"));
        Assert.That(element, Is.Not.Null);
    }

    [Test]
    public void ShouldSwitchToFrameByNameAndBackToDefaultContent()
    {
        driver.Url = framesPage;

        driver.SwitchTo().Frame("first");
        Assert.That(driver.FindElement(By.Id("pageNumber")).Text, Is.EqualTo("1"));

        driver.SwitchTo().DefaultContent();

        // DefaultContent should not have the element in it.
        Assert.That(
            () => driver.FindElement(By.Id("pageNumber")),
            Throws.TypeOf<NoSuchElementException>());

        driver.SwitchTo().Frame("second");
        Assert.That(driver.FindElement(By.Id("pageNumber")).Text, Is.EqualTo("2"));

        driver.SwitchTo().DefaultContent();

        // DefaultContent should not have the element in it.
        Assert.That(
            () => driver.FindElement(By.Id("pageNumber")),
            Throws.TypeOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldSwitchToFrameByIndexAndBackToDefaultContent()
    {
        driver.Url = framesPage;

        driver.SwitchTo().Frame(0);
        Assert.That(driver.FindElement(By.Id("pageNumber")).Text, Is.EqualTo("1"));

        driver.SwitchTo().DefaultContent();

        // DefaultContent should not have the element in it.
        Assert.That(
            () => driver.FindElement(By.Id("pageNumber")),
            Throws.TypeOf<NoSuchElementException>());


        driver.SwitchTo().Frame(1);
        Assert.That(driver.FindElement(By.Id("pageNumber")).Text, Is.EqualTo("2"));

        driver.SwitchTo().DefaultContent();

        // DefaultContent should not have the element in it.
        Assert.That(
            () => driver.FindElement(By.Id("pageNumber")).Text,
            Throws.TypeOf<NoSuchElementException>());
    }

}
