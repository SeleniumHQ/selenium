// <copyright file="ElementSelectingTests.cs" company="Selenium Committers">
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
public class ElementSelectingTests : DriverTestFixture
{
    private const string assertCannotPerformActionFormat_action_element = "Expected exception - should not be able to {0} element {1}";

    [Test]
    public void ShouldBeAbleToSelectAnEnabledUnselectedCheckbox()
    {
        Driver.Url = Urls.FormsPage;
        AssertCanSelect(this.EnabledUnselectedCheckbox);
    }

    [Test]
    public void ShouldBeAbleToSelectAnEnabledUnselectedRadioButton()
    {
        Driver.Url = Urls.FormsPage;
        AssertCanSelect(this.EnabledUnselectedRadioButton);
    }

    [Test]
    public void ShouldNotBeAbleToSelectADisabledCheckbox()
    {
        Driver.Url = Urls.FormsPage;
        AssertCannotSelect(this.DisabledUnselectedCheckbox);
    }

    [Test]
    public void ShouldNotBeAbleToSelectADisabledCheckboxDisabledWithRandomString()
    {
        Driver.Url = Urls.FormsPage;
        AssertCannotSelect(this.RandomlyDisabledSelectedCheckbox);
    }

    [Test]
    public void ShouldNotBeAbleToSelectADisabledRadioButton()
    {
        Driver.Url = Urls.FormsPage;
        AssertCannotSelect(this.DisabledUnselectedRadioButton);
    }

    [Test]
    public void ShouldNotBeAbleToSelectADisabledRadioButtonDisabledWithRandomString()
    {
        Driver.Url = Urls.FormsPage;
        AssertCannotSelect(this.RandomlyDisabledUnselectedRadioButton);
    }

    [Test]
    public void SelectingRadioButtonShouldUnselectItsSibling()
    {
        Driver.Url = Urls.FormsPage;

        IWebElement originallySelected = this.EnabledSelectedRadioButton;
        AssertSelected(originallySelected);

        IWebElement toSelect = this.EnabledUnselectedRadioButton;
        AssertNotSelected(toSelect);

        toSelect.Click();
        AssertNotSelected(originallySelected);
        AssertSelected(toSelect);
    }

    [Test]
    public void ShouldBeAbleToToggleAnEnabledUnselectedCheckbox()
    {
        Driver.Url = Urls.FormsPage;

        IWebElement checkbox = this.EnabledUnselectedCheckbox;
        AssertNotSelected(checkbox);

        checkbox.Click();
        AssertSelected(checkbox);

        checkbox.Click();
        AssertNotSelected(checkbox);
    }

    [Test]
    public void ShouldBeAbleToToggleAnEnabledSelectedCheckbox()
    {
        Driver.Url = Urls.FormsPage;

        IWebElement checkbox = this.EnabledSelectedCheckbox;
        AssertSelected(checkbox);

        checkbox.Click();
        AssertNotSelected(checkbox);

        checkbox.Click();
        AssertSelected(checkbox);
    }

    [Test]
    public void ClickingOnASelectedRadioButtonShouldLeaveItSelected()
    {
        Driver.Url = Urls.FormsPage;

        IWebElement button = this.EnabledSelectedRadioButton;
        Assert.That(button.Selected, "Radio button should be selected");

        button.Click();

        Assert.That(button.Selected, "Radio button should be selected");
    }

    [Test]
    public void ShouldBeAbleToToggleEnabledMultiSelectOption()
    {
        Driver.Url = Urls.FormsPage;
        AssertCanToggle(this.SelectedMultipleSelectOption);
    }

    [Test]
    public void ShouldBeAbleToToggleSelectableCheckboxByClickingOnIt()
    {
        Driver.Url = Urls.FormsPage;

        IWebElement checkbox = this.EnabledUnselectedCheckbox;
        AssertNotSelected(checkbox);

        checkbox.Click();
        AssertSelected(checkbox);

        checkbox.Click();
        AssertNotSelected(checkbox);
    }

    [Test]
    public void ShouldBeAbleToSelectSelectableRadioButtonByClickingOnIt()
    {
        Driver.Url = Urls.FormsPage;

        IWebElement radioButton = this.EnabledUnselectedRadioButton;
        AssertNotSelected(radioButton);

        radioButton.Click();
        AssertSelected(radioButton);

        radioButton.Click();
        AssertSelected(radioButton);
    }

    [Test]
    public void ClickingDisabledSelectedCheckboxShouldBeNoop()
    {
        Driver.Url = Urls.FormsPage;
        AssertClickingPreservesCurrentlySelectedStatus(this.RandomlyDisabledSelectedCheckbox);
    }

    [Test]
    public void ClickingDisabledUnselectedCheckboxShouldBeNoop()
    {
        Driver.Url = Urls.FormsPage;
        AssertClickingPreservesCurrentlySelectedStatus(this.DisabledUnselectedCheckbox);
    }

    [Test]
    public void ClickingDisabledSelectedRadioButtonShouldBeNoop()
    {
        Driver.Url = Urls.FormsPage;
        AssertClickingPreservesCurrentlySelectedStatus(this.DisabledSelectedRadioButton);
    }

    [Test]
    public void ClickingDisabledUnselectedRadioButtonShouldBeNoop()
    {
        Driver.Url = Urls.FormsPage;
        AssertClickingPreservesCurrentlySelectedStatus(this.DisabledUnselectedRadioButton);
    }

    private static void AssertNotSelected(IWebElement element)
    {
        AssertSelected(element, false);
    }

    private static void AssertSelected(IWebElement element)
    {
        AssertSelected(element, true);
    }

    private static void AssertSelected(IWebElement element, bool isSelected)
    {
        Assert.That(element.Selected, Is.EqualTo(isSelected), string.Format("Expected element {0} to be {1} but was {2}", Describe(element), SelectedToString(isSelected), SelectedToString(!isSelected)));
    }

    private static void AssertCannotSelect(IWebElement element)
    {
        bool previous = element.Selected;
        element.Click();
        Assert.That(element.Selected, Is.EqualTo(previous));
    }

    private static void AssertCanSelect(IWebElement element)
    {
        AssertNotSelected(element);

        element.Click();
        AssertSelected(element);
    }

    private static void AssertClickingPreservesCurrentlySelectedStatus(IWebElement element)
    {
        bool currentSelectedStatus = element.Selected;
        try
        {
            element.Click();
        }
        catch (InvalidElementStateException)
        {
            // This is expected, as we are clicking disabled elements.
        }

        AssertSelected(element, currentSelectedStatus);
    }

    private static string SelectedToString(bool isSelected)
    {
        return isSelected ? "[selected]" : "[not selected]";
    }

    private static string Describe(IWebElement element)
    {
        return element.GetAttribute("id");
    }

    private static void AssertCanToggle(IWebElement element)
    {
        bool originalState = element.Selected;

        AssertSelected(element, originalState);

        AssertTogglingSwapsSelectedStateFrom(element, originalState);
        AssertTogglingSwapsSelectedStateFrom(element, !originalState);
    }

    private static void AssertTogglingSwapsSelectedStateFrom(IWebElement element, bool originalState)
    {
        element.Click();
        bool isNowSelected = element.Selected;
        Assert.That(originalState, Is.Not.EqualTo(isNowSelected), string.Format("Expected element {0} to have been toggled to {1} but was {2}", Describe(element), SelectedToString(!originalState), SelectedToString(originalState)));
        AssertSelected(element, !originalState);
    }

    //TODO: Test disabled multi-selects
    //TODO: Test selecting options

    private IWebElement EnabledUnselectedCheckbox => Driver.FindElement(By.Id("checky"));

    private IWebElement EnabledSelectedCheckbox => Driver.FindElement(By.Id("checkedchecky"));

    private IWebElement DisabledUnselectedCheckbox => Driver.FindElement(By.Id("disabledchecky"));

    private IWebElement RandomlyDisabledSelectedCheckbox => Driver.FindElement(By.Id("randomly_disabled_checky"));

    private IWebElement EnabledUnselectedRadioButton => Driver.FindElement(By.Id("peas"));

    private IWebElement EnabledSelectedRadioButton => Driver.FindElement(By.Id("cheese_and_peas"));

    private IWebElement DisabledSelectedRadioButton => Driver.FindElement(By.Id("lone_disabled_selected_radio"));

    private IWebElement DisabledUnselectedRadioButton => Driver.FindElement(By.Id("nothing"));

    private IWebElement RandomlyDisabledUnselectedRadioButton => Driver.FindElement(By.Id("randomly_disabled_nothing"));

    private IWebElement SelectedMultipleSelectOption
    {
        get
        {
            IWebElement select = Driver.FindElement(By.Name("multi"));
            return select.FindElements(By.TagName("option"))[0];
        }
    }

    private IWebElement NonSelectableElement => Driver.FindElement(By.TagName("div"));
}
