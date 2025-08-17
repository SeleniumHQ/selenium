// <copyright file="ClearTest.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium;

[TestFixture]
public class ClearTest : DriverTestFixture
{
    [Test]
    public void WritableTextInputShouldClear()
    {
        driver.Url = readOnlyPage;
        IWebElement element = driver.FindElement(By.Id("writableTextInput"));
        element.Clear();
        Assert.That(element.GetAttribute("value"), Is.Empty);
    }

    [Test]
    public void TextInputShouldNotClearWhenDisabled()
    {
        driver.Url = readOnlyPage;
        IWebElement element = driver.FindElement(By.Id("textInputNotEnabled"));
        Assert.That(element.Enabled, Is.False);
        Assert.That(
            () => element.Clear(),
            Throws.InstanceOf<InvalidElementStateException>());
    }

    [Test]
    public void TextInputShouldNotClearWhenReadOnly()
    {
        driver.Url = readOnlyPage;
        IWebElement element = driver.FindElement(By.Id("readOnlyTextInput"));
        Assert.That(
            () => element.Clear(),
            Throws.InstanceOf<InvalidElementStateException>());
    }

    [Test]
    public void WritableTextAreaShouldClear()
    {
        driver.Url = readOnlyPage;
        IWebElement element = driver.FindElement(By.Id("writableTextArea"));
        element.Clear();
        Assert.That(element.GetAttribute("value"), Is.Empty);
    }

    [Test]
    public void TextAreaShouldNotClearWhenDisabled()
    {
        driver.Url = readOnlyPage;
        IWebElement element = driver.FindElement(By.Id("textAreaNotEnabled"));
        Assert.That(() => element.Clear(), Throws.InstanceOf<InvalidElementStateException>());
    }

    [Test]
    public void TextAreaShouldNotClearWhenReadOnly()
    {
        driver.Url = readOnlyPage;
        IWebElement element = driver.FindElement(By.Id("textAreaReadOnly"));
        Assert.That(
            () => element.Clear(),
             Throws.InstanceOf<InvalidElementStateException>());
    }

    [Test]
    public void ContentEditableAreaShouldClear()
    {
        driver.Url = readOnlyPage;
        IWebElement element = driver.FindElement(By.Id("content-editable"));
        element.Clear();

        Assert.That(element.Text, Is.Empty);
    }

    [Test]
    public void ShouldBeAbleToClearNoTypeInput()
    {
        ShouldBeAbleToClearInput(By.Name("no_type"), "input with no type");
    }

    [Test]
    public void ShouldBeAbleToClearNumberInput()
    {
        ShouldBeAbleToClearInput(By.Name("number_input"), "42");
    }

    [Test]
    public void ShouldBeAbleToClearEmailInput()
    {
        ShouldBeAbleToClearInput(By.Name("email_input"), "admin@localhost");
    }

    [Test]
    public void ShouldBeAbleToClearPasswordInput()
    {
        ShouldBeAbleToClearInput(By.Name("password_input"), "qwerty");
    }

    [Test]
    public void ShouldBeAbleToClearSearchInput()
    {
        ShouldBeAbleToClearInput(By.Name("search_input"), "search");
    }

    [Test]
    public void ShouldBeAbleToClearTelInput()
    {
        ShouldBeAbleToClearInput(By.Name("tel_input"), "911");
    }

    [Test]
    public void ShouldBeAbleToClearTextInput()
    {
        ShouldBeAbleToClearInput(By.Name("text_input"), "text input");
    }

    [Test]
    public void ShouldBeAbleToClearUrlInput()
    {
        ShouldBeAbleToClearInput(By.Name("url_input"), "https://selenium.dev/");
    }

    [Test]
    public void ShouldBeAbleToClearRangeInput()
    {
        ShouldBeAbleToClearInput(By.Name("range_input"), "42", "50");
    }

    [Test]
    [IgnoreBrowser(Browser.IE, "Driver does not support clearing color elements")]
    public void ShouldBeAbleToClearColorInput()
    {
        ShouldBeAbleToClearInput(By.Name("color_input"), "#00ffff", "#000000");
    }

    [Test]
    public void ShouldBeAbleToClearDateInput()
    {
        ShouldBeAbleToClearInput(By.Name("date_input"), "2017-11-22");
    }

    [Test]
    public void ShouldBeAbleToClearDatetimeInput()
    {
        ShouldBeAbleToClearInput(By.Name("datetime_input"), "2017-11-22T11:22");
    }

    [Test]
    public void ShouldBeAbleToClearDatetimeLocalInput()
    {
        ShouldBeAbleToClearInput(By.Name("datetime_local_input"), "2017-11-22T11:22");
    }

    [Test]
    public void ShouldBeAbleToClearTimeInput()
    {
        ShouldBeAbleToClearInput(By.Name("time_input"), "11:22");
    }

    [Test]
    public void ShouldBeAbleToClearMonthInput()
    {
        ShouldBeAbleToClearInput(By.Name("month_input"), "2017-11");
    }

    [Test]
    public void ShouldBeAbleToClearWeekInput()
    {
        ShouldBeAbleToClearInput(By.Name("week_input"), "2017-W47");
    }

    private void ShouldBeAbleToClearInput(By locator, string oldValue)
    {
        ShouldBeAbleToClearInput(locator, oldValue, string.Empty);
    }

    private void ShouldBeAbleToClearInput(By locator, string oldValue, string clearedValue)
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("inputs.html");
        IWebElement element = driver.FindElement(locator);
        Assert.That(element.GetAttribute("value"), Is.EqualTo(oldValue));

        element.Clear();
        Assert.That(element.GetAttribute("value"), Is.EqualTo(clearedValue));
    }
}
