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

package org.openqa.selenium;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.testing.JupiterTestBase;

class ElementSelectingTest extends JupiterTestBase {
  private static final boolean UNSELECTED = false;
  private static final boolean SELECTED = true;

  @Test
  void testShouldBeAbleToSelectAnEnabledUnselectedCheckbox() {
    driver.get(pages.formPage);
    assertCanSelect(enabledUnselectedCheckbox());
  }

  @Test
  void testShouldBeAbleToSelectAnEnabledUnselectedRadioButton() {
    driver.get(pages.formPage);
    assertCanSelect(enabledUnselectedRadioButton());
  }

  @Test
  void testShouldNotBeAbleToSelectADisabledCheckbox() {
    driver.get(pages.formPage);
    assertCannotSelect(disabledUnselectedCheckbox());
  }

  @Test
  void testShouldNotBeAbleToSelectADisabledCheckboxDisabledWithRandomString() {
    driver.get(pages.formPage);
    assertCannotSelect(randomlyDisabledSelectedCheckbox());
  }

  @Test
  void testShouldNotBeAbleToSelectADisabledRadioButton() {
    driver.get(pages.formPage);
    assertCannotSelect(disabledUnselectedRadioButton());
  }

  @Test
  void testShouldNotBeAbleToSelectADisabledRadioButtonDisabledWithRandomString() {
    driver.get(pages.formPage);
    assertCannotSelect(randomlyDisabledUnselectedRadioButton());
  }

  @Test
  void testSelectingRadioButtonShouldUnselectItsSibling() {
    driver.get(pages.formPage);

    WebElement originallySelected = enabledSelectedRadioButton();
    assertSelected(originallySelected);

    WebElement toSelect = enabledUnselectedRadioButton();
    assertNotSelected(toSelect);

    toSelect.click();
    assertNotSelected(originallySelected);
    assertSelected(toSelect);
  }

  @Test
  void testShouldBeAbleToToggleAnEnabledUnselectedCheckbox() {
    driver.get(pages.formPage);
    assertCanToggle(enabledUnselectedCheckbox());
  }

  @Test
  void testShouldBeAbleToToggleAnEnabledSelectedCheckbox() {
    driver.get(pages.formPage);
    assertCanToggle(enabledSelectedCheckbox());
  }

  @Test
  void testClickingOnASelectedRadioButtonShouldLeaveItSelected() {
    driver.get(pages.formPage);

    WebElement button = enabledSelectedRadioButton();
    assertThat(button.isSelected()).isTrue();

    button.click();

    assertThat(button.isSelected()).isTrue();
  }

  @Test
  void testShouldBeAbleToToggleEnabledMultiSelectOption() {
    driver.get(pages.formPage);
    assertCanToggle(selectedMultipleSelectOption());
  }

  @Test
  void testShouldBeAbleToToggleSelectableCheckboxByClickingOnIt() {
    driver.get(pages.formPage);

    WebElement checkbox = enabledUnselectedCheckbox();
    assertNotSelected(checkbox);

    checkbox.click();
    assertSelected(checkbox);

    checkbox.click();
    assertNotSelected(checkbox);
  }

  @Test
  void testShouldBeAbleToSelectSelectableRadioButtonByClickingOnIt() {
    driver.get(pages.formPage);

    WebElement radioButton = enabledUnselectedRadioButton();
    assertNotSelected(radioButton);

    radioButton.click();
    assertSelected(radioButton);

    radioButton.click();
    assertSelected(radioButton);
  }

  @Test
  void testClickingDisabledSelectedCheckboxShouldBeNoop() {
    driver.get(pages.formPage);
    assertClickingPreservesCurrentlySelectedStatus(randomlyDisabledSelectedCheckbox());
  }

  @Test
  void testClickingDisabledUnselectedCheckboxShouldBeNoop() {
    driver.get(pages.formPage);
    assertClickingPreservesCurrentlySelectedStatus(disabledUnselectedCheckbox());
  }

  @Test
  void testClickingDisabledSelectedRadioButtonShouldBeNoop() {
    driver.get(pages.formPage);
    assertClickingPreservesCurrentlySelectedStatus(disabledSelectedRadioButton());
  }

  @Test
  void testClickingDisabledUnselectedRadioButtonShouldBeNoop() {
    driver.get(pages.formPage);
    assertClickingPreservesCurrentlySelectedStatus(disabledUnselectedRadioButton());
  }

  private void assertNotSelected(WebElement element) {
    assertSelected(element, UNSELECTED);
  }

  private void assertSelected(WebElement element) {
    assertSelected(element, SELECTED);
  }

  private void assertSelected(WebElement element, boolean isSelected) {
    wait.until(ExpectedConditions.elementSelectionStateToBe(element, isSelected));
    assertThat(element.isSelected())
        .describedAs(
            "Expected element %s to be %s",
            describe(element), selectedToString(isSelected), selectedToString(!isSelected))
        .isEqualTo(isSelected);
  }

  private void assertCannotSelect(WebElement element) {
    boolean previous = element.isSelected();
    element.click();
    assertThat(element.isSelected()).isEqualTo(previous);
  }

  private void assertCanSelect(WebElement element) {
    assertNotSelected(element);

    element.click();
    assertSelected(element);
  }

  private void assertClickingPreservesCurrentlySelectedStatus(WebElement element) {
    boolean currentSelectedStatus = element.isSelected();
    element.click();
    assertSelected(element, currentSelectedStatus);
  }

  private static String selectedToString(boolean isSelected) {
    return isSelected ? "[selected]" : "[not selected]";
  }

  private static String describe(WebElement element) {
    return element.getAttribute("id");
  }

  private void assertCanToggle(WebElement element) {
    final boolean originalState = element.isSelected();

    assertSelected(element, originalState);

    assertTogglingSwapsSelectedStateFrom(element, originalState);
    assertTogglingSwapsSelectedStateFrom(element, !originalState);
  }

  private void assertTogglingSwapsSelectedStateFrom(WebElement element, boolean originalState) {
    element.click();
    boolean isNowSelected = element.isSelected();
    assertThat(isNowSelected)
        .describedAs(
            "Expected element %s to have been toggled to %s",
            describe(element), selectedToString(!originalState))
        .isEqualTo(!(originalState));
    assertSelected(element, !originalState);
  }

  // TODO: Test disabled multi-selects
  // TODO: Test selecting options

  private WebElement enabledUnselectedCheckbox() {
    return driver.findElement(By.id("checky"));
  }

  private WebElement enabledSelectedCheckbox() {
    return driver.findElement(By.id("checkedchecky"));
  }

  private WebElement disabledUnselectedCheckbox() {
    return driver.findElement(By.id("disabledchecky"));
  }

  private WebElement randomlyDisabledSelectedCheckbox() {
    return driver.findElement(By.id("randomly_disabled_checky"));
  }

  private WebElement enabledUnselectedRadioButton() {
    return driver.findElement(By.id("peas"));
  }

  private WebElement enabledSelectedRadioButton() {
    return driver.findElement(By.id("cheese_and_peas"));
  }

  private WebElement disabledSelectedRadioButton() {
    return driver.findElement(By.id("lone_disabled_selected_radio"));
  }

  private WebElement disabledUnselectedRadioButton() {
    return driver.findElement(By.id("nothing"));
  }

  private WebElement randomlyDisabledUnselectedRadioButton() {
    return driver.findElement(By.id("randomly_disabled_nothing"));
  }

  private WebElement selectedMultipleSelectOption() {
    WebElement select = driver.findElement(By.name("multi"));
    return select.findElements(By.tagName("option")).get(0);
  }
}
