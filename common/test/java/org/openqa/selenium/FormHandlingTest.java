/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.CHROME_NON_WINDOWS;
import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

import java.io.File;
import java.io.IOException;

public class FormHandlingTest extends AbstractDriverTestCase {

  @Ignore(SELENESE)
  public void testShouldClickOnSubmitInputElements() {
    driver.get(pages.formPage);
    driver.findElement(By.id("submitButton")).click();
    assertThat(driver.getTitle(), equalTo("We Arrive Here"));
  }

  public void testClickingOnUnclickableElementsDoesNothing() {
    driver.get(pages.formPage);
    try {
      driver.findElement(By.xpath("//body")).click();
    } catch (Exception e) {
      e.printStackTrace();
      fail("Clicking on the unclickable should be a no-op");
    }
  }

  public void testShouldBeAbleToClickImageButtons() {
    driver.get(pages.formPage);
    driver.findElement(By.id("imageButton")).click();
    assertThat(driver.getTitle(), equalTo("We Arrive Here"));
  }

  public void testShouldBeAbleToSubmitForms() {
    driver.get(pages.formPage);
    driver.findElement(By.name("login")).submit();
    assertThat(driver.getTitle(), equalTo("We Arrive Here"));
  }

  public void testShouldSubmitAFormWhenAnyInputElementWithinThatFormIsSubmitted() {
    driver.get(pages.formPage);
    driver.findElement(By.id("checky")).submit();
    assertThat(driver.getTitle(), equalTo("We Arrive Here"));
  }

  public void testShouldSubmitAFormWhenAnyElementWihinThatFormIsSubmitted() {
    driver.get(pages.formPage);
    driver.findElement(By.xpath("//form/p")).submit();
    assertThat(driver.getTitle(), equalTo("We Arrive Here"));
  }

  public void testShouldNotBeAbleToSubmitAFormThatDoesNotExist() {
    driver.get(pages.formPage);

    try {
      driver.findElement(By.name("there is no spoon"))
          .submit();
      fail("Should not have succeeded");
    } catch (NoSuchElementException e) {
      // this is expected
    }
  }

  public void testShouldBeAbleToEnterTextIntoATextAreaBySettingItsValue() {
    driver.get(pages.javascriptPage);
    WebElement textarea = driver.findElement(By
        .id("keyUpArea"));
    String cheesey = "Brie and cheddar";
    textarea.sendKeys(cheesey);
    assertThat(textarea.getValue(), equalTo(cheesey));
  }

  @Ignore({SELENESE, CHROME_NON_WINDOWS, IPHONE})
  public void testShouldSubmitAFormUsingTheNewlineLiteral() {
    driver.get(pages.formPage);
    WebElement nestedForm = driver.findElement(By.id("nested_form"));
    WebElement input = nestedForm.findElement(By.name("x"));
    input.sendKeys("\n");
    assertEquals("We Arrive Here", driver.getTitle());
    assertTrue(driver.getCurrentUrl().endsWith("?x=name"));
  }

  @Ignore({SELENESE, CHROME_NON_WINDOWS, IPHONE})
  public void testShouldSubmitAFormUsingTheEnterKey() {
    driver.get(pages.formPage);
    WebElement nestedForm = driver.findElement(By.id("nested_form"));
    WebElement input = nestedForm.findElement(By.name("x"));
    input.sendKeys(Keys.ENTER);
    assertEquals("We Arrive Here", driver.getTitle());
    assertTrue(driver.getCurrentUrl().endsWith("?x=name"));
  }

  public void testShouldEnterDataIntoFormFields() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By
        .xpath("//form[@name='someForm']/input[@id='username']"));
    String originalValue = element.getValue();
    assertThat(originalValue, equalTo("change"));

    element.clear();
    element.sendKeys("some text");

    element = driver.findElement(By
        .xpath("//form[@name='someForm']/input[@id='username']"));
    String newFormValue = element.getValue();
    assertThat(newFormValue, equalTo("some text"));
  }

  public void testShouldBeAbleToSelectACheckBox() {
    driver.get(pages.formPage);
    WebElement checkbox = driver.findElement(By
        .id("checky"));
    assertThat(checkbox.isSelected(), is(false));
    checkbox.setSelected();
    assertThat(checkbox.isSelected(), is(true));
    checkbox.setSelected();
    assertThat(checkbox.isSelected(), is(true));
  }

  @Ignore(IPHONE)
  public void testShouldToggleTheCheckedStateOfACheckbox() {
    driver.get(pages.formPage);
    WebElement checkbox = driver.findElement(By
        .id("checky"));
    assertThat(checkbox.isSelected(), is(false));
    checkbox.toggle();
    assertThat(checkbox.isSelected(), is(true));
    checkbox.toggle();
    assertThat(checkbox.isSelected(), is(false));
  }

  @Ignore(IPHONE)
  public void testTogglingACheckboxShouldReturnItsCurrentState() {
    driver.get(pages.formPage);
    WebElement checkbox = driver.findElement(By
        .id("checky"));
    assertThat(checkbox.isSelected(), is(false));
    boolean isChecked = checkbox.toggle();
    assertThat(isChecked, is(true));
    isChecked = checkbox.toggle();
    assertThat(isChecked, is(false));
  }

  public void testShouldNotBeAbleToSelectSomethingThatIsDisabled() {
    driver.get(pages.formPage);
    WebElement radioButton = driver.findElement(By.id("nothing"));
    assertThat(radioButton.isEnabled(), is(false));

    try {
      radioButton.setSelected();
      fail("Should not have succeeded");
    } catch (UnsupportedOperationException e) {
      // this is expected
    }
  }

  public void testShouldBeAbleToSelectARadioButton() {
    driver.get(pages.formPage);
    WebElement radioButton = driver.findElement(By.id("peas"));
    assertThat(radioButton.isSelected(), is(false));
    radioButton.setSelected();
    assertThat(radioButton.isSelected(), is(true));
  }

  public void testShouldBeAbleToSelectARadioButtonByClickingOnIt() {
    driver.get(pages.formPage);
    WebElement radioButton = driver.findElement(By.id("peas"));
    assertThat(radioButton.isSelected(), is(false));
    radioButton.click();
    assertThat(radioButton.isSelected(), is(true));
  }

  public void testShouldReturnStateOfRadioButtonsBeforeInteration() {
    driver.get(pages.formPage);
    WebElement radioButton = driver.findElement(By.id("cheese_and_peas"));
    assertThat(radioButton.isSelected(), is(true));

    radioButton = driver.findElement(By.id("cheese"));
    assertThat(radioButton.isSelected(), is(false));
  }

  @Ignore(IPHONE)
  public void testShouldThrowAnExceptionWhenTogglingTheStateOfARadioButton() {
    driver.get(pages.formPage);
    WebElement radioButton = driver.findElement(By.id("cheese"));
    try {
      radioButton.toggle();
      fail("You should not be able to toggle a radio button");
    } catch (UnsupportedOperationException e) {
      assertThat(e.getMessage().contains("toggle"), is(true));
    }
  }

  @Ignore({FIREFOX, IE, SELENESE, IPHONE})
  public void testTogglingAnOptionShouldThrowAnExceptionIfTheOptionIsNotInAMultiSelect() {
    driver.get(pages.formPage);

    WebElement select = driver.findElement(By.name("selectomatic"));
    WebElement option = select.findElements(By.tagName("option")).get(0);

    try {
      option.toggle();
      fail("Should not be able to toggle an element");
    } catch (UnsupportedOperationException e) {
      // this is expected
    }
  }

  @Ignore({FIREFOX, IE, SELENESE, IPHONE})
  public void testTogglingAnOptionShouldToggleOptionsInAMultiSelect() {
    driver.get(pages.formPage);

    WebElement select = driver.findElement(By.name("multi"));
    WebElement option = select.findElements(By.tagName("option")).get(0);

    boolean selected = option.isSelected();
    boolean current = option.toggle();
    assertFalse(selected == current);

    current = option.toggle();
    assertTrue(selected == current);
  }


  @Ignore(value = {CHROME, SELENESE, IPHONE},
      reason = "Does not yet support file uploads")
  public void testShouldBeAbleToAlterTheContentsOfAFileUploadInputElement() throws IOException {
    driver.get(pages.formPage);
    WebElement uploadElement = driver.findElement(By.id("upload"));
    assertThat(uploadElement.getValue(), equalTo(""));

    File file = File.createTempFile("test", "txt");
    file.deleteOnExit();

    uploadElement.sendKeys(file.getAbsolutePath());

    File value = new File(uploadElement.getValue());
    assertThat(value.getCanonicalPath(), equalTo(file.getCanonicalPath()));
  }

  public void testShouldThrowAnExceptionWhenSelectingAnUnselectableElement() {
    driver.get(pages.formPage);

    WebElement element = driver.findElement(By.xpath("//title"));

    try {
      element.setSelected();
      fail("Should not have succeeded");
    } catch (UnsupportedOperationException e) {
      // this is expected
    }
  }

  @Ignore(value = IPHONE, reason = "iPhone: sendKeys implemented incorrectly")
  public void testSendingKeyboardEventsShouldAppendTextInInputs() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.id("working"));
    element.sendKeys("Some");
    String value = element.getValue();
    assertThat(value, is("Some"));

    element.sendKeys(" text");
    value = element.getValue();
    assertThat(value, is("Some text"));
  }

  @Ignore(value = {IE, HTMLUNIT, CHROME, SELENESE, IPHONE},
          reason = "Not implemented going to the end of the line first;\n"
                   + "  iPhone: sendKeys not implemented correctly")
  public void testSendingKeyboardEventsShouldAppendTextinTextAreas() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.id("withText"));

    element.sendKeys(". Some text");
    String value = element.getValue();

    assertThat(value, is("Example text. Some text"));
  }

  public void testShouldBeAbleToClearTextFromInputElements() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.id("working"));
    element.sendKeys("Some text");
    String value = element.getValue();
    assertThat(value.length(), is(greaterThan(0)));

    element.clear();
    value = element.getValue();

    assertThat(value.length(), is(0));
  }

  public void testEmptyTextBoxesShouldReturnAnEmptyStringNotNull() {
    driver.get(pages.formPage);
    WebElement emptyTextBox = driver.findElement(By.id("working"));
    assertEquals(emptyTextBox.getValue(), "");
  }

  public void testShouldBeAbleToClearTextFromTextAreas() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.id("withText"));
    element.sendKeys("Some text");
    String value = element.getValue();
    assertThat(value.length(), is(greaterThan(0)));

    element.clear();
    value = element.getValue();

    assertThat(value.length(), is(0));
  }
}
