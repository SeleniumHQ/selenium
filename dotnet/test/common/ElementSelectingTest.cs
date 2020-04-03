using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ElementSelectingTest : DriverTestFixture
    {
        private const string assertCannotPerformActionFormat_action_element = "Expected exception - should not be able to {0} element {1}"; 

        [Test]
        public void ShouldBeAbleToSelectAnEnabledUnselectedCheckbox()
        {
            driver.Url = formsPage;
            AssertCanSelect(this.EnabledUnselectedCheckbox);
        }

        [Test]
        public void ShouldBeAbleToSelectAnEnabledUnselectedRadioButton()
        {
            driver.Url = formsPage;
            AssertCanSelect(this.EnabledUnselectedRadioButton);
        }

        [Test]
        public void ShouldNotBeAbleToSelectADisabledCheckbox()
        {
            driver.Url = formsPage;
            AssertCannotSelect(this.DisabledUnselectedCheckbox);
        }

        [Test]
        public void ShouldNotBeAbleToSelectADisabledCheckboxDisabledWithRandomString()
        {
            driver.Url = formsPage;
            AssertCannotSelect(this.RandomlyDisabledSelectedCheckbox);
        }

        [Test]
        public void ShouldNotBeAbleToSelectADisabledRadioButton()
        {
            driver.Url = formsPage;
            AssertCannotSelect(this.DisabledUnselectedRadioButton);
        }

        [Test]
        public void ShouldNotBeAbleToSelectADisabledRadioButtonDisabledWithRandomString()
        {
            driver.Url = formsPage;
            AssertCannotSelect(this.RandomlyDisabledUnselectedRadioButton);
        }

        [Test]
        public void SelectingRadioButtonShouldUnselectItsSibling()
        {
            driver.Url = formsPage;

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
            driver.Url = formsPage;

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
            driver.Url = formsPage;

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
            driver.Url = formsPage;

            IWebElement button = this.EnabledSelectedRadioButton;
            Assert.That(button.Selected, "Radio button should be selected");

            button.Click();

            Assert.That(button.Selected, "Radio button should be selected");
        }

        [Test]
        public void ShouldBeAbleToToggleEnabledMultiSelectOption()
        {
            driver.Url = formsPage;
            AssertCanToggle(this.SelectedMultipleSelectOption);
        }

        [Test]
        public void ShouldBeAbleToToggleSelectableCheckboxByClickingOnIt()
        {
            driver.Url = formsPage;

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
            driver.Url = formsPage;

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
            driver.Url = formsPage;
            AssertClickingPreservesCurrentlySelectedStatus(this.RandomlyDisabledSelectedCheckbox);
        }

        [Test]
        public void ClickingDisabledUnselectedCheckboxShouldBeNoop()
        {
            driver.Url = formsPage;
            AssertClickingPreservesCurrentlySelectedStatus(this.DisabledUnselectedCheckbox);
        }

        [Test]
        public void ClickingDisabledSelectedRadioButtonShouldBeNoop()
        {
            driver.Url = formsPage;
            AssertClickingPreservesCurrentlySelectedStatus(this.DisabledSelectedRadioButton);
        }

        [Test]
        public void ClickingDisabledUnselectedRadioButtonShouldBeNoop()
        {
            driver.Url = formsPage;
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
            Assert.AreEqual(isSelected, element.Selected, string.Format("Expected element {0} to be {1} but was {2}", Describe(element), SelectedToString(isSelected), SelectedToString(!isSelected)));
        }

        private static void AssertCannotSelect(IWebElement element)
        {
            bool previous = element.Selected;
            element.Click();
            Assert.AreEqual(previous, element.Selected);
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
            Assert.AreNotEqual(isNowSelected, originalState, string.Format("Expected element {0} to have been toggled to {1} but was {2}", Describe(element), SelectedToString(!originalState), SelectedToString(originalState)));
            AssertSelected(element, !originalState);
        }

        //TODO: Test disabled multi-selects
        //TODO: Test selecting options


        private IWebElement EnabledUnselectedCheckbox
        {
            get
            {
                return driver.FindElement(By.Id("checky"));
            }
        }

        private IWebElement EnabledSelectedCheckbox
        {
            get
            {
                return driver.FindElement(By.Id("checkedchecky"));
            }
        }

        private IWebElement DisabledUnselectedCheckbox
        {
            get
            {
                return driver.FindElement(By.Id("disabledchecky"));
            }
        }

        private IWebElement RandomlyDisabledSelectedCheckbox
        {
            get
            {
                return driver.FindElement(By.Id("randomly_disabled_checky"));
            }
        }

        private IWebElement EnabledUnselectedRadioButton
        {
            get
            {
                return driver.FindElement(By.Id("peas"));
            }
        }

        private IWebElement EnabledSelectedRadioButton
        {
            get
            {
                return driver.FindElement(By.Id("cheese_and_peas"));
            }
        }

        private IWebElement DisabledSelectedRadioButton
        {
            get
            {
                return driver.FindElement(By.Id("lone_disabled_selected_radio"));
            }
        }

        private IWebElement DisabledUnselectedRadioButton
        {
            get
            {
                return driver.FindElement(By.Id("nothing"));
            }
        }

        private IWebElement RandomlyDisabledUnselectedRadioButton
        {
            get
            {
                return driver.FindElement(By.Id("randomly_disabled_nothing"));
            }
        }

        private IWebElement SelectedMultipleSelectOption
        {
            get
            {
                IWebElement select = driver.FindElement(By.Name("multi"));
                return select.FindElements(By.TagName("option"))[0];
            }
        }

        private IWebElement NonSelectableElement
        {
            get
            {
                return driver.FindElement(By.TagName("div"));
            }
        }
    }
}
