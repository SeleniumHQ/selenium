// <copyright file="NavigationTests.cs" company="Selenium Committers">
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
public class NavigationTests : DriverTestFixture
{

    [Test]
    [NeedsFreshDriver(IsCreatedBeforeTest = true)]
    public void ShouldNotHaveProblemNavigatingWithNoPagesBrowsed()
    {
        INavigation navigation;
        navigation = Driver.Navigate();
        navigation.Back();
        navigation.Forward();
    }

    [Test]
    public void ShouldGoBackAndForward()
    {
        INavigation navigation;
        navigation = Driver.Navigate();

        Driver.Url = Urls.MacbethPage;
        Driver.Url = Urls.SimpleTestPage;

        navigation.Back();
        Assert.That(Driver.Title, Is.EqualTo("Macbeth: Entire Play"));

        navigation.Forward();
        Assert.That(Driver.Title, Is.EqualTo("Hello WebDriver"));
    }

    [Test]
    public void ShouldAcceptInvalidUrlsUsingUris()
    {
        INavigation navigation;
        navigation = Driver.Navigate();
        Assert.That(() => navigation.GoToUrl((Uri)null), Throws.InstanceOf<ArgumentNullException>());
        // new Uri("") and new Uri("isidsji30342??éåµñ©æ")
        // throw an exception, so we needn't worry about them.
    }

    [Test]
    public void ShouldGoToUrlUsingString()
    {
        INavigation navigation;
        navigation = Driver.Navigate();

        navigation.GoToUrl(Urls.MacbethPage);
        Assert.That(Driver.Title, Is.EqualTo("Macbeth: Entire Play"));

        // We go to two pages to ensure that the browser wasn't
        // already at the desired page through a previous test.
        navigation.GoToUrl(Urls.SimpleTestPage);
        Assert.That(Driver.Title, Is.EqualTo("Hello WebDriver"));
    }

    [Test]
    public void ShouldGoToUrlUsingUri()
    {
        Uri macBeth = new Uri(Urls.MacbethPage);
        Uri simpleTest = new Uri(Urls.SimpleTestPage);
        INavigation navigation;
        navigation = Driver.Navigate();

        navigation.GoToUrl(macBeth);
        Assert.That(Driver.Title, Is.EqualTo("Macbeth: Entire Play"));

        // We go to two pages to ensure that the browser wasn't
        // already at the desired page through a previous test.
        navigation.GoToUrl(simpleTest);
        Assert.That(Driver.Title, Is.EqualTo("Hello WebDriver"));
    }

    [Test]
    public void ShouldRefreshPage()
    {
        Driver.Url = Urls.JavascriptPage;
        IWebElement changedDiv = Driver.FindElement(By.Id("dynamo"));
        Driver.FindElement(By.Id("updatediv")).Click();

        Assert.That(changedDiv.Text, Is.EqualTo("Fish and chips!"));
        Driver.Navigate().Refresh();

        changedDiv = Driver.FindElement(By.Id("dynamo"));
        Assert.That(changedDiv.Text, Is.EqualTo("What's for dinner?"));
    }

    [Test]
    [NeedsFreshDriver(IsCreatedBeforeTest = true)]
    public void ShouldNotHaveProblemNavigatingWithNoPagesBrowsedAsync()
    {
        var navigation = Driver.Navigate();
        Assert.That(async () => await navigation.BackAsync(), Throws.Nothing);
        Assert.That(async () => await navigation.ForwardAsync(), Throws.Nothing);
    }

    [Test]
    public async Task ShouldGoBackAndForwardAsync()
    {
        INavigation navigation = Driver.Navigate();

        await navigation.GoToUrlAsync(Urls.MacbethPage);
        await navigation.GoToUrlAsync(Urls.SimpleTestPage);

        await navigation.BackAsync();
        Assert.That(Driver.Title, Is.EqualTo("Macbeth: Entire Play"));

        await navigation.ForwardAsync();
        Assert.That(Driver.Title, Is.EqualTo("Hello WebDriver"));
    }

    [Test]
    public void ShouldAcceptInvalidUrlsUsingUrisAsync()
    {
        INavigation navigation = Driver.Navigate();
        Assert.That(async () => await navigation.GoToUrlAsync((Uri)null), Throws.InstanceOf<ArgumentNullException>());
    }

    [Test]
    public async Task ShouldGoToUrlUsingStringAsync()
    {
        var navigation = Driver.Navigate();

        await navigation.GoToUrlAsync(Urls.MacbethPage);
        Assert.That(Driver.Title, Is.EqualTo("Macbeth: Entire Play"));

        await navigation.GoToUrlAsync(Urls.SimpleTestPage);
        Assert.That(Driver.Title, Is.EqualTo("Hello WebDriver"));
    }

    [Test]
    public void ShouldGoToUrlUsingUriAsync()
    {
        var navigation = Driver.Navigate();

        navigation.GoToUrlAsync(new Uri(Urls.MacbethPage));
        Assert.That(Driver.Title, Is.EqualTo("Macbeth: Entire Play"));
        navigation.GoToUrl(new Uri(Urls.SimpleTestPage));
        Assert.That(Driver.Title, Is.EqualTo("Hello WebDriver"));
    }

    [Test]
    public async Task ShouldRefreshPageAsync()
    {
        await Driver.Navigate().GoToUrlAsync(Urls.JavascriptPage);
        IWebElement changedDiv = Driver.FindElement(By.Id("dynamo"));
        Driver.FindElement(By.Id("updatediv")).Click();

        Assert.That(changedDiv.Text, Is.EqualTo("Fish and chips!"));
        await Driver.Navigate().RefreshAsync();

        changedDiv = Driver.FindElement(By.Id("dynamo"));
        Assert.That(changedDiv.Text, Is.EqualTo("What's for dinner?"));
    }
}
