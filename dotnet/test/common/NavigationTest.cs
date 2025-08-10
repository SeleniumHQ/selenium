// <copyright file="NavigationTest.cs" company="Selenium Committers">
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
using System.Threading.Tasks;

namespace OpenQA.Selenium;


[TestFixture]
public class NavigationTest : DriverTestFixture
{

    [Test]
    [NeedsFreshDriver(IsCreatedBeforeTest = true)]
    public void ShouldNotHaveProblemNavigatingWithNoPagesBrowsed()
    {
        INavigation navigation;
        navigation = driver.Navigate();
        navigation.Back();
        navigation.Forward();
    }

    [Test]
    public void ShouldGoBackAndForward()
    {
        INavigation navigation;
        navigation = driver.Navigate();

        driver.Url = macbethPage;
        driver.Url = simpleTestPage;

        navigation.Back();
        Assert.That(driver.Title, Is.EqualTo(macbethTitle));

        navigation.Forward();
        Assert.That(driver.Title, Is.EqualTo(simpleTestTitle));
    }

    [Test]
    public void ShouldAcceptInvalidUrlsUsingUris()
    {
        INavigation navigation;
        navigation = driver.Navigate();
        Assert.That(() => navigation.GoToUrl((Uri)null), Throws.InstanceOf<ArgumentNullException>());
        // new Uri("") and new Uri("isidsji30342??éåµñ©æ")
        // throw an exception, so we needn't worry about them.
    }

    [Test]
    public void ShouldGoToUrlUsingString()
    {
        INavigation navigation;
        navigation = driver.Navigate();

        navigation.GoToUrl(macbethPage);
        Assert.That(driver.Title, Is.EqualTo(macbethTitle));

        // We go to two pages to ensure that the browser wasn't
        // already at the desired page through a previous test.
        navigation.GoToUrl(simpleTestPage);
        Assert.That(driver.Title, Is.EqualTo(simpleTestTitle));
    }

    [Test]
    public void ShouldGoToUrlUsingUri()
    {
        Uri macBeth = new Uri(macbethPage);
        Uri simpleTest = new Uri(simpleTestPage);
        INavigation navigation;
        navigation = driver.Navigate();

        navigation.GoToUrl(macBeth);
        Assert.That(macbethTitle, Is.EqualTo(driver.Title));

        // We go to two pages to ensure that the browser wasn't
        // already at the desired page through a previous test.
        navigation.GoToUrl(simpleTest);
        Assert.That(driver.Title, Is.EqualTo(simpleTestTitle));
    }

    [Test]
    public void ShouldRefreshPage()
    {
        driver.Url = javascriptPage;
        IWebElement changedDiv = driver.FindElement(By.Id("dynamo"));
        driver.FindElement(By.Id("updatediv")).Click();

        Assert.That(changedDiv.Text, Is.EqualTo("Fish and chips!"));
        driver.Navigate().Refresh();

        changedDiv = driver.FindElement(By.Id("dynamo"));
        Assert.That(changedDiv.Text, Is.EqualTo("What's for dinner?"));
    }

    [Test]
    [NeedsFreshDriver(IsCreatedBeforeTest = true)]
    public void ShouldNotHaveProblemNavigatingWithNoPagesBrowsedAsync()
    {
        var navigation = driver.Navigate();
        Assert.That(async () => await navigation.BackAsync(), Throws.Nothing);
        Assert.That(async () => await navigation.ForwardAsync(), Throws.Nothing);
    }

    [Test]
    public async Task ShouldGoBackAndForwardAsync()
    {
        INavigation navigation = driver.Navigate();

        await navigation.GoToUrlAsync(macbethPage);
        await navigation.GoToUrlAsync(simpleTestPage);

        await navigation.BackAsync();
        Assert.That(driver.Title, Is.EqualTo(macbethTitle));

        await navigation.ForwardAsync();
        Assert.That(driver.Title, Is.EqualTo(simpleTestTitle));
    }

    [Test]
    public void ShouldAcceptInvalidUrlsUsingUrisAsync()
    {
        INavigation navigation = driver.Navigate();
        Assert.That(async () => await navigation.GoToUrlAsync((Uri)null), Throws.InstanceOf<ArgumentNullException>());
    }

    [Test]
    public async Task ShouldGoToUrlUsingStringAsync()
    {
        var navigation = driver.Navigate();

        await navigation.GoToUrlAsync(macbethPage);
        Assert.That(driver.Title, Is.EqualTo(macbethTitle));

        await navigation.GoToUrlAsync(simpleTestPage);
        Assert.That(driver.Title, Is.EqualTo(simpleTestTitle));
    }

    [Test]
    public void ShouldGoToUrlUsingUriAsync()
    {
        var navigation = driver.Navigate();

        navigation.GoToUrlAsync(new Uri(macbethPage));
        Assert.That(macbethTitle, Is.EqualTo(driver.Title));
        navigation.GoToUrl(new Uri(simpleTestPage));
        Assert.That(driver.Title, Is.EqualTo(simpleTestTitle));
    }

    [Test]
    public async Task ShouldRefreshPageAsync()
    {
        await driver.Navigate().GoToUrlAsync(javascriptPage);
        IWebElement changedDiv = driver.FindElement(By.Id("dynamo"));
        driver.FindElement(By.Id("updatediv")).Click();

        Assert.That(changedDiv.Text, Is.EqualTo("Fish and chips!"));
        await driver.Navigate().RefreshAsync();

        changedDiv = driver.FindElement(By.Id("dynamo"));
        Assert.That(changedDiv.Text, Is.EqualTo("What's for dinner?"));
    }
}
