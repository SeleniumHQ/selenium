package org.openqa.selenium;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

//TODO(dawagner): Ignored tests are for issue 1468
public class ElementSelectingTest extends AbstractDriverTestCase {
  private static final boolean UNSELECTED = false;
  private static final boolean SELECTED = true;
  
  public void testShouldBeAbleToSelectAnEnabledUnselectedCheckbox() {
    driver.get(pages.formPage);
    assertCanSelect(enabledUnselectedCheckbox());
  }
  
  public void testShouldBeAbleToSelectAnEnabledUnselectedRadioButton() {
    driver.get(pages.formPage);
    assertCanSelect(enabledUnselectedRadioButton());
  }
  
  public void testShouldNotBeAbleToSelectADisabledCheckbox() {
    driver.get(pages.formPage);
    assertCannotSelect(disabledUnselectedCheckbox());
  }
  
  public void testShouldNotBeAbleToSelectADisabledCheckboxDisabledWithRandomString() {
    driver.get(pages.formPage);
    assertCannotSelect(randomlyDisabledSelectedCheckbox());
  }
  
  public void testShouldNotBeAbleToSelectADisabledRadioButton() {
    driver.get(pages.formPage);
    assertCannotSelect(disabledUnselectedRadioButton());
  }
  
  public void testShouldNotBeAbleToSelectADisabledRadioButtonDisabledWithRandomString() {
    driver.get(pages.formPage);
    assertCannotSelect(randomlyDisabledUnselectedRadioButton());
  }
  
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

  
  public void testShouldBeAbleToToggleAnEnabledUnselectedCheckbox() {
    driver.get(pages.formPage);
    assertCanToggle(enabledUnselectedCheckbox());
  }
  
  public void testShouldBeAbleToToggleAnEnabledSelectedCheckbox() {
    driver.get(pages.formPage);
    assertCanToggle(enabledSelectedCheckbox());
  }
  
  public void testClickingOnASelectedRadioButtonShouldLeaveItSelected() {
    driver.get(pages.formPage);
    
    WebElement button = enabledSelectedRadioButton();
    assertTrue(button.isSelected());
    
    button.click();
    
    assertTrue(button.isSelected());
  }

  @Ignore(SELENESE)
  public void testShouldBeAbleToToggleEnabledMultiSelectOption() {
    driver.get(pages.formPage);
    assertCanToggle(selectedMultipleSelectOption());
  }
  
  public void testShouldBeAbleToToggleSelectableCheckboxByClickingOnIt() {
    driver.get(pages.formPage);
    
    WebElement checkbox = enabledUnselectedCheckbox();
    assertNotSelected(checkbox);
    
    checkbox.click();
    assertSelected(checkbox);
    
    checkbox.click();
    assertNotSelected(checkbox);
  }
  
  public void testShouldBeAbleToSelectSelectableRadioButtonByClickingOnIt() {
    driver.get(pages.formPage);
    
    WebElement radioButton = enabledUnselectedRadioButton();
    assertNotSelected(radioButton);
    
    radioButton.click();
    assertSelected(radioButton);
    
    radioButton.click();
    assertSelected(radioButton);
  }
  

  @Ignore(IE)
  public void testClickingDisabledSelectedCheckboxShouldBeNoop() {
    driver.get(pages.formPage);
    assertClickingPreservesCurrentlySelectedStatus(randomlyDisabledSelectedCheckbox());
  }

  @Ignore(IE)
  public void testClickingDisabledUnselectedCheckboxShouldBeNoop() {
    driver.get(pages.formPage);
    assertClickingPreservesCurrentlySelectedStatus(disabledUnselectedCheckbox());
  }
  
  @Ignore(IE)
  public void testClickingDisabledSelectedRadioButtonShouldBeNoop() {
    driver.get(pages.formPage);
    assertClickingPreservesCurrentlySelectedStatus(disabledSelectedRadioButton());
  }
  
  @Ignore(IE)
  public void testClickingDisabledUnselectedRadioButtonShouldBeNoop() {
    driver.get(pages.formPage);
    assertClickingPreservesCurrentlySelectedStatus(disabledUnselectedRadioButton());
  }

  

  private static void assertNotSelected(WebElement element) {
    assertSelected(element, UNSELECTED);
  }

  private static void assertSelected(WebElement element) {
    assertSelected(element, SELECTED);
  }
  
  private static void assertSelected(WebElement element, boolean isSelected) {
    assertThat(
        String.format("Expected element %s to be %s but was %s", describe(element), selectedToString(isSelected), selectedToString(!isSelected)),
        element.isSelected(), is(isSelected));
  }

  private static void assertCannotSelect(WebElement element) {
    boolean previous = element.isSelected();
    element.click();
    assertEquals(previous, element.isSelected());
  }
  
  private static void assertCanSelect(WebElement element) {
    assertNotSelected(element);
    
    element.click();
    assertSelected(element);
  }
  
  private static void assertClickingPreservesCurrentlySelectedStatus(WebElement element) {
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
  
  private static void assertCanToggle(WebElement element) {
    final boolean originalState = element.isSelected();
    
    assertSelected(element, originalState);
    
    assertTogglingSwapsSelectedStateFrom(element, originalState);
    assertTogglingSwapsSelectedStateFrom(element, !originalState);
  }
  
  private static void assertTogglingSwapsSelectedStateFrom(WebElement element, boolean originalState) {
    element.click();
    boolean isNowSelected = element.isSelected(); 
    assertThat(
        String.format("Expected element %s to have been toggled to %s but was %s",
            describe(element),
            selectedToString(!originalState),
            selectedToString(originalState)),
        isNowSelected, is(!(originalState)));
    assertSelected(element, !originalState);
  }

  //TODO: Test disabled multi-selects
  //TODO: Test selecting options
  
  
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
