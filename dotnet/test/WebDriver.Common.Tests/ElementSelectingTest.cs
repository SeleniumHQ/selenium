using System;
using System.Collections.Generic;
using System.Text;
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
            driver.Url = (formsPage);
            assertCanSelect(enabledUnselectedCheckbox());
        }

        [Test]
        public void ShouldBeAbleToSelectAnEnabledUnselectedRadioButton()
        {
            driver.Url = formsPage;
            assertCanSelect(enabledUnselectedRadioButton());
        }

        [Test]
        public void SelectingAlreadySelectedCheckboxShouldBeNoop()
        {
            driver.Url = formsPage;
            assertSelectingPreservesAlreadySelectedStatus(enabledSelectedCheckbox());
        }

        [Test]
        public void SelectingAlreadySelectedRadioButtonShouldBeNoop()
        {
            driver.Url = formsPage;
            assertSelectingPreservesAlreadySelectedStatus(enabledSelectedRadioButton());
        }

        [Test]
        public void ShouldNotBeAbleToSelectADisabledCheckbox()
        {
            driver.Url = formsPage;
            assertCannotSelect(disabledUnselectedCheckbox());
        }

        [Test]
        public void ShouldNotBeAbleToSelectADisabledCheckboxDisabledWithRandomString()
        {
            driver.Url = formsPage;
            assertCannotSelect(randomlyDisabledSelectedCheckbox());
        }

        [Test]
        public void ShouldNotBeAbleToSelectADisabledRadioButton()
        {
            driver.Url = formsPage;
            assertCannotSelect(disabledUnselectedRadioButton());
        }

        [Test]
        public void ShouldNotBeAbleToSelectADisabledRadioButtonDisabledWithRandomString()
        {
            driver.Url = formsPage;
            assertCannotSelect(randomlyDisabledUnselectedRadioButton());
        }

        [Test]
        public void ShouldNotBeAbleToSelectUnselectableElement()
        {
            driver.Url = formsPage;
            assertCannotSelect(nonSelectableElement());
        }

        [Test]
        public void SelectingRadioButtonShouldUnselectItsSibling()
        {
            driver.Url = formsPage;

            IWebElement originallySelected = enabledSelectedRadioButton();
            assertSelected(originallySelected);

            IWebElement toSelect = enabledUnselectedRadioButton();
            assertNotSelected(toSelect);

            toSelect.Select();
            assertNotSelected(originallySelected);
            assertSelected(toSelect);
        }

        [Test]
        public void ShouldBeAbleToToggleAnEnabledUnselectedCheckbox()
        {
            driver.Url = formsPage;
            assertCanToggle(enabledUnselectedCheckbox());
        }

        [Test]
        public void ShouldBeAbleToToggleAnEnabledSelectedCheckbox()
        {
            driver.Url = formsPage;
            assertCanToggle(enabledSelectedCheckbox());
        }

        [Test]
        public void ShouldNotBeAbleToToggleEnabledRadioButton()
        {
            driver.Url = formsPage;
            assertCannotToggle(enabledSelectedRadioButton());
        }

        [Test]
        public void ShouldBeAbleToToggleEnabledMultiSelectOption()
        {
            driver.Url = formsPage;
            assertCanToggle(selectedMultipleSelectOption());
        }


        [Test]
        [IgnoreBrowser(Browser.Firefox)]
        public void ShouldNotBeAbleToToggleADisabledCheckbox()
        {
            driver.Url = formsPage;
            assertCannotToggle(disabledUnselectedCheckbox());
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox)]
        public void ShouldNotBeAbleToToggleADisabledCheckboxDisabledWithRandomString()
        {
            driver.Url = formsPage;
            assertCannotToggle(randomlyDisabledSelectedCheckbox());
        }

        [Test]
        public void ShouldNotBeAbleToToggleADisabledRadioButton()
        {
            driver.Url = formsPage;
            assertCannotToggle(disabledUnselectedRadioButton());
        }

        [Test]
        public void ShouldNotBeAbleToToggleADisabledRadioButtonDisabledWithRandomString()
        {
            driver.Url = formsPage;
            assertCannotToggle(randomlyDisabledUnselectedRadioButton());
        }

        [Test]
        [IgnoreBrowser(Browser.IE)]
        public void ShouldNotBeAbleToToggleAnEnabledNonMultiSelectOption()
        {
            driver.Url = formsPage;
            assertCannotToggle(selectedNonMultipleSelectOption());
        }

        [Test]
        public void ShouldNotBeAbleToToggleUnselectableElement()
        {
            driver.Url = formsPage;
            assertCannotToggle(nonSelectableElement());
        }

        [Test]
        public void ShouldBeAbleToToggleSelectableCheckboxByClickingOnIt()
        {
            driver.Url = formsPage;

            IWebElement checkbox = enabledUnselectedCheckbox();
            assertNotSelected(checkbox);

            checkbox.Click();
            assertSelected(checkbox);

            checkbox.Click();
            assertNotSelected(checkbox);
        }

        [Test]
        public void ShouldBeAbleToSelectSelectableRadioButtonByClickingOnIt()
        {
            driver.Url = formsPage;

            IWebElement radioButton = enabledUnselectedRadioButton();
            assertNotSelected(radioButton);

            radioButton.Click();
            assertSelected(radioButton);

            radioButton.Click();
            assertSelected(radioButton);
        }

        [Test]
        [IgnoreBrowser(Browser.IE)]
        public void ClickingDisabledSelectedCheckboxShouldBeNoop()
        {
            driver.Url = formsPage;
            assertClickingPreservesCurrentlySelectedStatus(randomlyDisabledSelectedCheckbox());
        }

        [Test]
        [IgnoreBrowser(Browser.IE)]
        public void ClickingDisabledUnselectedCheckboxShouldBeNoop()
        {
            driver.Url = formsPage;
            assertClickingPreservesCurrentlySelectedStatus(disabledUnselectedCheckbox());
        }

        [Test]
        [IgnoreBrowser(Browser.IE)]
        public void ClickingDisabledSelectedRadioButtonShouldBeNoop()
        {
            driver.Url = formsPage;
            assertClickingPreservesCurrentlySelectedStatus(disabledSelectedRadioButton());
        }

        [Test]
        [IgnoreBrowser(Browser.IE)]
        public void ClickingDisabledUnselectedRadioButtonShouldBeNoop()
        {
            driver.Url = formsPage;
            assertClickingPreservesCurrentlySelectedStatus(disabledUnselectedRadioButton());
        }



        private static void assertNotSelected(IWebElement element)
        {
            assertSelected(element, false);
        }

        private static void assertSelected(IWebElement element)
        {
            assertSelected(element, true);
        }

        private static void assertSelected(IWebElement element, bool isSelected) {
            Assert.AreEqual(isSelected, element.Selected, string.Format("Expected element {0} to be {1} but was {2}", describe(element), selectedToString(isSelected), selectedToString(!isSelected)));
  }

        private static void assertCannotSelect(IWebElement element)
        {
            try
            {
                element.Select();
                Assert.Fail(string.Format(assertCannotPerformActionFormat_action_element, "select", describe(element)));
            }
            catch (InvalidElementStateException)
            {
                //Expected
            }
        }

        private static void assertCanSelect(IWebElement element)
        {
            assertNotSelected(element);

            element.Select();
            assertSelected(element);

            element.Select();
            assertSelected(element);
        }

        private static void assertSelectingPreservesAlreadySelectedStatus(IWebElement element)
        {
            assertSelected(element);

            element.Select();
            assertSelected(element);
        }

        private static void assertClickingPreservesCurrentlySelectedStatus(IWebElement element)
        {
            bool currentSelectedStatus = element.Selected;
            element.Click();
            assertSelected(element, currentSelectedStatus);
        }

        private static String selectedToString(bool isSelected)
        {
            return isSelected ? "[selected]" : "[not selected]";
        }

        private static String describe(IWebElement element)
        {
            return element.GetAttribute("id");
        }

        private static void assertCanToggle(IWebElement element)
        {
            bool originalState = element.Selected;

            assertSelected(element, originalState);

            assertTogglingSwapsSelectedStateFrom(element, originalState);
            assertTogglingSwapsSelectedStateFrom(element, !originalState);
        }

        private static void assertTogglingSwapsSelectedStateFrom(IWebElement element, bool originalState)
        {
            bool isNowSelected = element.Toggle();
            Assert.AreNotEqual(isNowSelected, originalState, string.Format("Expected element {0} to have been toggled to {1} but was {2}", describe(element), selectedToString(!originalState), selectedToString(originalState)));
            assertSelected(element, !originalState);
        }

        private static void assertCannotToggle(IWebElement element)
        {
            try
            {
                element.Toggle();
                Assert.Fail(string.Format(assertCannotPerformActionFormat_action_element, "toggle", describe(element)));
            }
            catch (InvalidElementStateException)
            {
                //Expected
            }
        }


        //TODO: Test disabled multi-selects
        //TODO: Test selecting options


        private IWebElement enabledUnselectedCheckbox()
        {
            return driver.FindElement(By.Id("checky"));
        }

        private IWebElement enabledSelectedCheckbox()
        {
            return driver.FindElement(By.Id("checkedchecky"));
        }

        private IWebElement disabledUnselectedCheckbox()
        {
            return driver.FindElement(By.Id("disabledchecky"));
        }

        private IWebElement randomlyDisabledSelectedCheckbox()
        {
            return driver.FindElement(By.Id("randomly_disabled_checky"));
        }

        private IWebElement enabledUnselectedRadioButton()
        {
            return driver.FindElement(By.Id("peas"));
        }

        private IWebElement enabledSelectedRadioButton()
        {
            return driver.FindElement(By.Id("cheese_and_peas"));
        }

        private IWebElement disabledSelectedRadioButton()
        {
            return driver.FindElement(By.Id("lone_disabled_selected_radio"));
        }

        private IWebElement disabledUnselectedRadioButton()
        {
            return driver.FindElement(By.Id("nothing"));
        }

        private IWebElement randomlyDisabledUnselectedRadioButton()
        {
            return driver.FindElement(By.Id("randomly_disabled_nothing"));
        }

        private IWebElement selectedNonMultipleSelectOption()
        {
            IWebElement select = driver.FindElement(By.Name("selectomatic"));
            return select.FindElements(By.TagName("option"))[0];
        }

        private IWebElement selectedMultipleSelectOption()
        {
            IWebElement select = driver.FindElement(By.Name("multi"));
            return select.FindElements(By.TagName("option"))[0];
        }

        private IWebElement nonSelectableElement()
        {
            return driver.FindElement(By.TagName("div"));
        }
    }
}
