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

public class ElementSelectingTest extends JupiterTestBase {
  private static final boolean UNSELECTED = false;
  private static final boolean SELECTED = true;

  @Test
  public void testShouldBeAbleToSelectAnEnabledUnselectedCheckbox() {
    driver.get(pages.formPage);
    assertCanSelect(enabledUnselectedCheckbox());
  }

  @Test
  public void testShouldBeAbleToSelectAnEnabledUnselectedRadioButton() {
    driver.get(pages.formPage);
    assertCanSelect(enabledUnselectedRadioButton());
  }

  @Test
  public void testShouldNotBeAbleToSelectADisabledCheckbox() {
    driver.get(pages.formPage);
    assertCannotSelect(disabledUnselectedCheckbox());
  }

  @Test
  public void testShouldNotBeAbleToSelectADisabledCheckboxDisabledWithRandomString() {
    driver.get(pages.formPage);
    assertCannotSelect(randomlyDisabledSelectedCheckbox());
  }

  @Test
  public void testShouldNotBeAbleToSelectADisabledRadioButton() {
    driver.get(pages.formPage);
    assertCannotSelect(disabledUnselectedRadioButton());
  }

  @Test
  public void testShouldNotBeAbleToSelectADisabledRadioButtonDisabledWithRandomString() {
    driver.get(pages.formPage);
    assertCannotSelect(randomlyDisabledUnselectedRadioButton());
  }

  @Test
  public void testSelectingRadioButtonShouldUnselectItsSibling() {
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
  public void testShouldBeAbleToToggleAnEnabledUnselectedCheckbox() {
    driver.get(pages.formPage);
    assertCanToggle(enabledUnselectedCheckbox());
  }

  @Test
  public void testShouldBeAbleToToggleAnEnabledSelectedCheckbox() {
    driver.get(pages.formPage);
    assertCanToggle(enabledSelectedCheckbox());
  }

  @Test
  public void testClickingOnASelectedRadioButtonShouldLeaveItSelected() {
    driver.get(pages.formPage);

    WebElement button = enabledSelectedRadioButton();
    assertThat(button.isSelected()).isTrue();

    button.click();

    assertThat(button.isSelected()).isTrue();
  }

  @Test
  public void testShouldBeAbleToToggleEnabledMultiSelectOption() {
    driver.get(pages.formPage);
    assertCanToggle(selectedMultipleSelectOption());
  }

  @Test
  public void testShouldBeAbleToToggleSelectableCheckboxByClickingOnIt() {
    driver.get(pages.formPage);

    WebElement checkbox = enabledUnselectedCheckbox();
    assertNotSelected(checkbox);

    checkbox.click();
    assertSelected(checkbox);

    checkbox.click();
    assertNotSelected(checkbox);
  }

  @Test
  public void testShouldBeAbleToSelectSelectableRadioButtonByClickingOnIt() {
    driver.get(pages.formPage);

    WebElement radioButton = enabledUnselectedRadioButton();
    assertNotSelected(radioButton);

    radioButton.click();
    assertSelected(radioButton);

    radioButton.click();
    assertSelected(radioButton);
  }

  @Test
  public void testClickingDisabledSelectedCheckboxShouldBeNoop() {
    driver.get(pages.formPage);
    assertClickingPreservesCurrentlySelectedStatus(randomlyDisabledSelectedCheckbox());
  }

  @Test
  public void testClickingDisabledUnselectedCheckboxShouldBeNoop() {
    driver.get(pages.formPage);
    assertClickingPreservesCurrentlySelectedStatus(disabledUnselectedCheckbox());
  }

  @Test
  public void testClickingDisabledSelectedRadioButtonShouldBeNoop() {
    driver.get(pages.formPage);
    assertClickingPreservesCurrentlySelectedStatus(disabledSelectedRadioButton());
  }

  @Test
  public void testClickingDisabledUnselectedRadioButtonShouldBeNoop() {
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
        .describedAs("Expected element %s to be %s",
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
        .describedAs("Expected element %s to have been toggled to %s",
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
