// <copyright file="SelectBrowserTests.cs" company="Selenium Committers">
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
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Support.UI;

[TestFixture]
public class SelectBrowserTests : DriverTestFixture
{
    [OneTimeSetUp]
    public async Task RunBeforeAnyTestAsync()
    {
        await EnvironmentManager.Instance.WebServer.StartAsync();
    }

    [OneTimeTearDown]
    public async Task RunAfterAnyTestsAsync()
    {
        EnvironmentManager.Instance.CloseCurrentDriver();
        await EnvironmentManager.Instance.WebServer.StopAsync();
    }

    [SetUp]
    public void Setup()
    {
        driver.Url = formsPage;
    }

    [Test]
    public void ShouldThrowAnExceptionIfTheElementIsNotASelectElement()
    {
        IWebElement element = driver.FindElement(By.Name("checky"));
        Assert.That(
            () => new SelectElement(element),
            Throws.TypeOf<UnexpectedTagNameException>());
    }

    [Test]
    public void ShouldIndicateThatASelectCanSupportMultipleOptions()
    {
        IWebElement element = driver.FindElement(By.Name("multi"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(elementWrapper.IsMultiple, Is.True);
    }

    [Test]
    public void ShouldIndicateThatASelectCanSupportMultipleOptionsWithEmptyMultipleAttribute()
    {
        IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(elementWrapper.IsMultiple, Is.True);
    }

    [Test]
    public void ShouldIndicateThatASelectCanSupportMultipleOptionsWithTrueMultipleAttribute()
    {
        IWebElement element = driver.FindElement(By.Name("multi_true"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(elementWrapper.IsMultiple, Is.True);
    }

    [Test]
    public void ShouldNotIndicateThatANormalSelectSupportsMulitpleOptions()
    {
        IWebElement element = driver.FindElement(By.Name("selectomatic"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(elementWrapper.IsMultiple, Is.False);
    }

    [Test]
    public void ShouldIndicateThatASelectCanSupportMultipleOptionsWithFalseMultipleAttribute()
    {
        IWebElement element = driver.FindElement(By.Name("multi_false"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(elementWrapper.IsMultiple, Is.True);
    }

    [Test]
    public void ShouldReturnAllOptionsWhenAsked()
    {
        IWebElement element = driver.FindElement(By.Name("selectomatic"));
        SelectElement elementWrapper = new SelectElement(element);
        IList<IWebElement> returnedOptions = elementWrapper.Options;

        Assert.That(returnedOptions, Has.Exactly(4).Items);

        string one = returnedOptions[0].Text;
        Assert.That(one, Is.EqualTo("One"));

        string two = returnedOptions[1].Text;
        Assert.That(two, Is.EqualTo("Two"));

        string three = returnedOptions[2].Text;
        Assert.That(three, Is.EqualTo("Four"));

        string four = returnedOptions[3].Text;
        Assert.That(four, Is.EqualTo("Still learning how to count, apparently"));

    }

    [Test]
    public void ShouldReturnOptionWhichIsSelected()
    {
        IWebElement element = driver.FindElement(By.Name("selectomatic"));
        SelectElement elementWrapper = new SelectElement(element);

        IList<IWebElement> returnedOptions = elementWrapper.AllSelectedOptions;

        Assert.That(returnedOptions, Has.One.Items);

        string one = returnedOptions[0].Text;
        Assert.That(one, Is.EqualTo("One"));
    }

    [Test]
    public void ShouldReturnOptionsWhichAreSelected()
    {
        IWebElement element = driver.FindElement(By.Name("multi"));
        SelectElement elementWrapper = new SelectElement(element);

        IList<IWebElement> returnedOptions = elementWrapper.AllSelectedOptions;

        Assert.That(returnedOptions, Has.Exactly(2).Items);

        string one = returnedOptions[0].Text;
        Assert.That(one, Is.EqualTo("Eggs"));

        string two = returnedOptions[1].Text;
        Assert.That(two, Is.EqualTo("Sausages"));
    }

    [Test]
    public void ShouldReturnFirstSelectedOption()
    {
        IWebElement element = driver.FindElement(By.Name("multi"));
        SelectElement elementWrapper = new SelectElement(element);

        IWebElement firstSelected = elementWrapper.AllSelectedOptions[0];

        Assert.That(firstSelected.Text, Is.EqualTo("Eggs"));
    }

    // [Test]
    // [ExpectedException(typeof(NoSuchElementException))]
    // The .NET bindings do not have a "FirstSelectedOption" property,
    // and no one has asked for it to this point. Given that, this test
    // is not a valid test.
    public void ShouldThrowANoSuchElementExceptionIfNothingIsSelected()
    {
        IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
        SelectElement elementWrapper = new SelectElement(element);

        Assert.That(elementWrapper.AllSelectedOptions.Count, Is.Zero);
    }

    [Test]
    public void ShouldAllowOptionsToBeSelectedByVisibleText()
    {
        IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
        SelectElement elementWrapper = new SelectElement(element);
        elementWrapper.SelectByText("select_2");
        IWebElement firstSelected = elementWrapper.AllSelectedOptions[0];
        Assert.That(firstSelected.Text, Is.EqualTo("select_2"));
    }

    [Test]
    public void ShouldAllowOptionsToBeSelectedByPartialText()
    {
        IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
        SelectElement elementWrapper = new SelectElement(element);
        elementWrapper.SelectByText("4", true);
        IWebElement firstSelected = elementWrapper.AllSelectedOptions[0];
        Assert.That(firstSelected.Text, Is.EqualTo("select_4"));
    }

    [Test]
    public void ShouldThrowExceptionOnSelectByTextExactMatchIfOptionDoesNotExist()
    {
        IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(
            () => elementWrapper.SelectByText("4"),
            Throws.TypeOf<NoSuchElementException>());
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Not working in all bindings.")]
    public void ShouldNotAllowInvisibleOptionsToBeSelectedByVisibleText()
    {
        IWebElement element = driver.FindElement(By.Name("invisi_select"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(
            () => elementWrapper.SelectByText("Apples"),
            Throws.TypeOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldThrowExceptionOnSelectByVisibleTextIfOptionDoesNotExist()
    {
        IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(
            () => elementWrapper.SelectByText("not there"),
            Throws.TypeOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldThrowExceptionOnSelectByVisibleTextIfOptionDisabled()
    {
        IWebElement element = driver.FindElement(By.Name("single_disabled"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(
            () => elementWrapper.SelectByText("Disabled"),
            Throws.TypeOf<InvalidOperationException>());
    }

    [Test]
    public void ShouldAllowOptionsToBeSelectedByIndex()
    {
        IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
        SelectElement elementWrapper = new SelectElement(element);
        elementWrapper.SelectByIndex(1);
        IWebElement firstSelected = elementWrapper.AllSelectedOptions[0];
        Assert.That(firstSelected.Text, Is.EqualTo("select_2"));
    }

    [Test]
    public void ShouldThrowExceptionOnSelectByIndexIfOptionDoesNotExist()
    {
        IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(
            () => elementWrapper.SelectByIndex(10),
            Throws.TypeOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldThrowExceptionOnSelectByIndexIfOptionDisabled()
    {
        IWebElement element = driver.FindElement(By.Name("single_disabled"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(
            () => elementWrapper.SelectByIndex(1),
            Throws.InvalidOperationException);
    }

    [Test]
    public void ShouldAllowOptionsToBeSelectedByReturnedValue()
    {
        IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
        SelectElement elementWrapper = new SelectElement(element);
        elementWrapper.SelectByValue("select_2");
        IWebElement firstSelected = elementWrapper.AllSelectedOptions[0];
        Assert.That(firstSelected.Text, Is.EqualTo("select_2"));
    }

    [Test]
    public void ShouldThrowExceptionOnSelectByReturnedValueIfOptionDoesNotExist()
    {
        IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(
            () => elementWrapper.SelectByValue("not there"),
            Throws.TypeOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldThrowExceptionOnSelectByReturnedValueIfOptionDisabled()
    {
        IWebElement element = driver.FindElement(By.Name("single_disabled"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(
            () => elementWrapper.SelectByValue("disabled"),
            Throws.InvalidOperationException);
    }

    [Test]
    public void ShouldAllowUserToDeselectAllWhenSelectSupportsMultipleSelections()
    {
        IWebElement element = driver.FindElement(By.Name("multi"));
        SelectElement elementWrapper = new SelectElement(element);
        elementWrapper.DeselectAll();
        IList<IWebElement> returnedOptions = elementWrapper.AllSelectedOptions;

        Assert.That(returnedOptions, Is.Empty);
    }

    [Test]
    public void ShouldNotAllowUserToDeselectAllWhenSelectDoesNotSupportMultipleSelections()
    {
        IWebElement element = driver.FindElement(By.Name("selectomatic"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(
            () => elementWrapper.DeselectAll(),
            Throws.InvalidOperationException);
    }

    [Test]
    public void ShouldAllowUserToDeselectOptionsByVisibleText()
    {
        IWebElement element = driver.FindElement(By.Name("multi"));
        SelectElement elementWrapper = new SelectElement(element);
        elementWrapper.DeselectByText("Eggs");
        IList<IWebElement> returnedOptions = elementWrapper.AllSelectedOptions;

        Assert.That(returnedOptions.Count, Is.EqualTo(1));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Not working in all bindings.")]
    public void ShouldNotAllowUserToDeselectOptionsByInvisibleText()
    {
        IWebElement element = driver.FindElement(By.Name("invisi_select"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(
            () => elementWrapper.DeselectByText("Apples"),
            Throws.TypeOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldAllowOptionsToBeDeselectedByIndex()
    {
        IWebElement element = driver.FindElement(By.Name("multi"));
        SelectElement elementWrapper = new SelectElement(element);
        elementWrapper.DeselectByIndex(0);
        IList<IWebElement> returnedOptions = elementWrapper.AllSelectedOptions;

        Assert.That(returnedOptions.Count, Is.EqualTo(1));
    }

    [Test]
    public void ShouldAllowOptionsToBeDeselectedByReturnedValue()
    {
        IWebElement element = driver.FindElement(By.Name("multi"));
        SelectElement elementWrapper = new SelectElement(element);
        elementWrapper.DeselectByValue("eggs");
        IList<IWebElement> returnedOptions = elementWrapper.AllSelectedOptions;

        Assert.That(returnedOptions.Count, Is.EqualTo(1));
    }

    [Test]
    public void ShouldThrowExceptionOnDeselectByReturnedValueIfOptionDoesNotExist()
    {
        IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(
            () => elementWrapper.DeselectByValue("not there"),
            Throws.TypeOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldThrowExceptionOnDeselectByTextIfOptionDoesNotExist()
    {
        IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(
            () => elementWrapper.DeselectByText("not there"),
            Throws.TypeOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldThrowExceptionOnDeselectByIndexIfOptionDoesNotExist()
    {
        IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(
            () => elementWrapper.DeselectByIndex(10),
            Throws.TypeOf<NoSuchElementException>());
    }

    [Test]
    public void ShouldNotAllowUserToDeselectByTextWhenSelectDoesNotSupportMultipleSelections()
    {
        IWebElement element = driver.FindElement(By.Name("selectomatic"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(
            () => elementWrapper.DeselectByText("Four"),
            Throws.InvalidOperationException);
    }

    [Test]
    public void ShouldNotAllowUserToDeselectByValueWhenSelectDoesNotSupportMultipleSelections()
    {
        IWebElement element = driver.FindElement(By.Name("selectomatic"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(
            () => elementWrapper.DeselectByValue("two"),
            Throws.InvalidOperationException);
    }

    [Test]
    public void ShouldNotAllowUserToDeselectByIndexWhenSelectDoesNotSupportMultipleSelections()
    {
        IWebElement element = driver.FindElement(By.Name("selectomatic"));
        SelectElement elementWrapper = new SelectElement(element);
        Assert.That(
            () => elementWrapper.DeselectByIndex(0),
            Throws.InvalidOperationException);
    }
}
