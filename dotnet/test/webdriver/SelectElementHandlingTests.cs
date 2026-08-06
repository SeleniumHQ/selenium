// <copyright file="SelectElementHandlingTests.cs" company="Selenium Committers">
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

using System.Collections.ObjectModel;

namespace OpenQA.Selenium.Tests;

[TestFixture]
public class SelectElementHandlingTests : DriverTestFixture
{
    [Test]
    public void ShouldBePossibleToDeselectASingleOptionFromASelectWhichAllowsMultipleChoices()
    {
        Driver.Url = Urls.FormsPage;

        IWebElement multiSelect = Driver.FindElement(By.Id("multi"));
        ReadOnlyCollection<IWebElement> options = multiSelect.FindElements(By.TagName("option"));

        IWebElement option = options[0];
        Assert.That(option.Selected, Is.True);
        option.Click();
        Assert.That(option.Selected, Is.False);
        option.Click();
        Assert.That(option.Selected, Is.True);

        option = options[2];
        Assert.That(option.Selected, Is.True);
    }

    [Test]
    public void ShouldBeAbleToChangeTheSelectedOptionInASelect()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement selectBox = Driver.FindElement(By.XPath("//select[@name='selectomatic']"));
        ReadOnlyCollection<IWebElement> options = selectBox.FindElements(By.TagName("option"));
        IWebElement one = options[0];
        IWebElement two = options[1];
        Assert.That(one.Selected, Is.True);
        Assert.That(two.Selected, Is.False);

        two.Click();
        Assert.That(one.Selected, Is.False);
        Assert.That(two.Selected, Is.True);
    }

    [Test]
    public void ShouldBeAbleToSelectMoreThanOneOptionFromASelectWhichAllowsMultipleChoices()
    {
        Driver.Url = Urls.FormsPage;

        IWebElement multiSelect = Driver.FindElement(By.Id("multi"));
        ReadOnlyCollection<IWebElement> options = multiSelect.FindElements(By.TagName("option"));
        foreach (IWebElement option in options)
        {
            if (!option.Selected)
            {
                option.Click();
            }
        }

        for (int i = 0; i < options.Count; i++)
        {
            IWebElement option = options[i];
            Assert.That(option.Selected, Is.True, "Option at index is not selected but should be: " + i.ToString());
        }
    }

    [Test]
    public void ShouldSelectFirstOptionByDefaultIfNoneIsSelected()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement selectBox = Driver.FindElement(By.XPath("//select[@name='select-default']"));
        IList<IWebElement> options = selectBox.FindElements(By.TagName("option"));
        IWebElement one = options[0];
        IWebElement two = options[1];
        Assert.That(one.Selected, Is.True);
        Assert.That(two.Selected, Is.False);

        two.Click();
        Assert.That(one.Selected, Is.False);
        Assert.That(two.Selected, Is.True);
    }

    [Test]
    public void CanSelectElementsInOptGroups()
    {
        Driver.Url = Urls.SelectPage;
        IWebElement element = Driver.FindElement(By.Id("two-in-group"));
        element.Click();
        Assert.That(element.Selected, Is.True, "Expected to be selected");
    }

    [Test]
    public void CanGetValueFromOptionViaAttributeWhenAttributeDoesntExist()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement element = Driver.FindElement(By.CssSelector("select[name='select-default'] option"));
        Assert.That(element.GetAttribute("value"), Is.EqualTo("One"));
        element = Driver.FindElement(By.Id("blankOption"));
        Assert.That(element.GetAttribute("value"), Is.EqualTo(""));
    }

    [Test]
    public void CanGetValueFromOptionViaAttributeWhenAttributeIsEmptyString()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement element = Driver.FindElement(By.Id("optionEmptyValueSet"));
        Assert.That(element.GetAttribute("value"), Is.EqualTo(""));
    }

    [Test]
    public void CanSelectFromMultipleSelectWhereValueIsBelowVisibleRange()
    {
        Driver.Url = Urls.SelectPage;
        IWebElement option = Driver.FindElements(By.CssSelector("#selectWithMultipleLongList option"))[4];
        option.Click();
        Assert.That(option.Selected, Is.True);
    }

    [Test]
    public void CannotSetDisabledOption()
    {
        Driver.Url = Urls.SelectPage;
        IWebElement element = Driver.FindElement(By.CssSelector("#visibility .disabled"));
        element.Click();
        Assert.That(element.Selected, Is.False, "Expected to not be selected");
    }

    [Test]
    public void CanSetHiddenOption()
    {
        Driver.Url = Urls.SelectPage;
        IWebElement element = Driver.FindElement(By.CssSelector("#visibility .hidden"));
        element.Click();
        Assert.That(element.Selected, Is.True, "Expected to be selected");
    }

    [Test]
    public void CanSetInvisibleOption()
    {
        Driver.Url = Urls.SelectPage;
        IWebElement element = Driver.FindElement(By.CssSelector("#visibility .invisible"));
        element.Click();
        Assert.That(element.Selected, Is.True, "Expected to be selected");
    }

    [Test]
    public void CanHandleTransparentSelect()
    {
        Driver.Url = Urls.SelectPage;
        IWebElement element = Driver.FindElement(By.CssSelector("#transparent option"));
        element.Click();
        Assert.That(element.Selected, Is.True, "Expected to be selected");
    }
}
