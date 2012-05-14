/*
Copyright 2007-2009 WebDriver committers

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

import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.TestUtilities;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeTrue;
import static org.junit.Assert.fail;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.pageTitleToBe;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.is;

import java.io.File;
import java.io.IOException;

public class FormHandlingTest extends JUnit4TestBase {
  @Test
  public void testShouldClickOnSubmitInputElements() {
    driver.get(pages.formPage);
    driver.findElement(By.id("submitButton")).click();
    waitFor(pageTitleToBe(driver, "We Arrive Here"));
    assertThat(driver.getTitle(), equalTo("We Arrive Here"));
  }

  @Test
  public void testClickingOnUnclickableElementsDoesNothing() {
    driver.get(pages.formPage);
    try {
      driver.findElement(By.xpath("//body")).click();
    } catch (Exception e) {
      e.printStackTrace();
      fail("Clicking on the unclickable should be a no-op");
    }
  }

  @Ignore(value = ANDROID, reason = "The page is zoomed in because of the previous state"
      + "which causes the click to fail.")
  @Test
  public void testShouldBeAbleToClickImageButtons() {
    driver.get(pages.formPage);
    driver.findElement(By.id("imageButton")).click();
    waitFor(pageTitleToBe(driver, "We Arrive Here"));
    assertThat(driver.getTitle(), equalTo("We Arrive Here"));
  }

  @Test
  public void testShouldBeAbleToSubmitForms() {
    driver.get(pages.formPage);
    driver.findElement(By.name("login")).submit();
    waitFor(pageTitleToBe(driver, "We Arrive Here"));
  }

  @Test
  public void testShouldSubmitAFormWhenAnyInputElementWithinThatFormIsSubmitted() {
    driver.get(pages.formPage);
    driver.findElement(By.id("checky")).submit();
    waitFor(pageTitleToBe(driver, "We Arrive Here"));
  }

  @Test
  public void testShouldSubmitAFormWhenAnyElementWihinThatFormIsSubmitted() {
    driver.get(pages.formPage);
    driver.findElement(By.xpath("//form/p")).submit();
    waitFor(pageTitleToBe(driver, "We Arrive Here"));
  }

  @Test
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

  @Test
  public void testShouldBeAbleToEnterTextIntoATextAreaBySettingItsValue() {
    driver.get(pages.javascriptPage);
    WebElement textarea = driver.findElement(By
        .id("keyUpArea"));
    String cheesey = "brie and cheddar";
    textarea.sendKeys(cheesey);
    assertThat(textarea.getAttribute("value"), equalTo(cheesey));
  }

  @Ignore(value = {ANDROID}, reason = "Android: capitalizatin bug in ICS keeps"
      + "caps on after a capital letter is sent.")
  @Test
  public void testSendKeysKeepsCapitalization() {
    driver.get(pages.javascriptPage);
    WebElement textarea = driver.findElement(By
        .id("keyUpArea"));
    String cheesey = "BrIe And CheDdar";
    textarea.sendKeys(cheesey);
    assertThat(textarea.getAttribute("value"), equalTo(cheesey));
  }

  @Ignore(value = {SELENESE, IPHONE, ANDROID})
  @Test
  public void testShouldSubmitAFormUsingTheNewlineLiteral() {
    driver.get(pages.formPage);
    WebElement nestedForm = driver.findElement(By.id("nested_form"));
    WebElement input = nestedForm.findElement(By.name("x"));
    input.sendKeys("\n");
    waitFor(pageTitleToBe(driver, "We Arrive Here"));
    assertTrue(driver.getCurrentUrl().endsWith("?x=name"));
  }

  @Ignore({SELENESE, IPHONE, ANDROID})
  @Test
  public void testShouldSubmitAFormUsingTheEnterKey() {
    driver.get(pages.formPage);
    WebElement nestedForm = driver.findElement(By.id("nested_form"));
    WebElement input = nestedForm.findElement(By.name("x"));
    input.sendKeys(Keys.ENTER);
    waitFor(pageTitleToBe(driver, "We Arrive Here"));
    assertTrue(driver.getCurrentUrl().endsWith("?x=name"));
  }

  @Test
  public void testShouldEnterDataIntoFormFields() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By
        .xpath("//form[@name='someForm']/input[@id='username']"));
    String originalValue = element.getAttribute("value");
    assertThat(originalValue, equalTo("change"));

    element.clear();
    element.sendKeys("some text");

    element = driver.findElement(By
        .xpath("//form[@name='someForm']/input[@id='username']"));
    String newFormValue = element.getAttribute("value");
    assertThat(newFormValue, equalTo("some text"));
  }

  @Ignore(value = {CHROME, SELENESE, IPHONE, ANDROID, OPERA},
      reason = "Does not yet support file uploads")
  @Test
  public void testShouldBeAbleToAlterTheContentsOfAFileUploadInputElement() throws IOException {
    driver.get(pages.formPage);
    WebElement uploadElement = driver.findElement(By.id("upload"));
    assertThat(uploadElement.getAttribute("value"), equalTo(""));

    File file = File.createTempFile("test", "txt");
    file.deleteOnExit();

    uploadElement.sendKeys(file.getAbsolutePath());

    String uploadPath = uploadElement.getAttribute("value");
    assertTrue(uploadPath.endsWith(file.getName()));
  }

  @Ignore(value = {ANDROID, CHROME, IPHONE, OPERA, SELENESE},
          reason = "Does not yet support file uploads")
  @Test
  public void testShouldBeAbleToSendKeysToAFileUploadInputElementInAnXhtmlDocument() throws IOException {
    // IE before 9 doesn't handle pages served with an XHTML content type, and just prompts for to
    // download it
    assumeTrue(!TestUtilities.isInternetExplorer(driver) || !TestUtilities.isOldIe(driver));

    driver.get(pages.xhtmlFormPage);
    WebElement uploadElement = driver.findElement(By.id("file"));
    assertThat(uploadElement.getAttribute("value"), equalTo(""));

    File file = File.createTempFile("test", "txt");
    file.deleteOnExit();

    uploadElement.sendKeys(file.getAbsolutePath());

    String uploadPath = uploadElement.getAttribute("value");
    assertTrue(uploadPath.endsWith(file.getName()));
  }

  @Ignore(value = {CHROME, SELENESE, IPHONE, ANDROID, OPERA},
          reason = "Does not yet support file uploads")
  @Test
  public void testShouldBeAbleToUploadTheSameFileTwice() throws IOException {
    File file = File.createTempFile("test", "txt");
    file.deleteOnExit();

    driver.get(pages.formPage);
    WebElement uploadElement = driver.findElement(By.id("upload"));
    assertThat(uploadElement.getAttribute("value"), equalTo(""));

    uploadElement.sendKeys(file.getAbsolutePath());
    uploadElement.submit();

    driver.get(pages.formPage);
    uploadElement = driver.findElement(By.id("upload"));
    assertThat(uploadElement.getAttribute("value"), equalTo(""));

    uploadElement.sendKeys(file.getAbsolutePath());
    uploadElement.submit();

    // If we get this far, then we're all good.
  }

  @Ignore(value = {IPHONE, OPERA}, reason = "iPhone: sendKeys implemented incorrectly.")
  @Test
  public void testSendingKeyboardEventsShouldAppendTextInInputs() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.id("working"));
    element.sendKeys("some");
    String value = element.getAttribute("value");
    assertThat(value, is("some"));

    element.sendKeys(" text");
    value = element.getAttribute("value");
    assertThat(value, is("some text"));
  }

  @Ignore(value = {ANDROID, IPHONE, OPERA, SELENESE},
      reason = "iPhone: sendKeys implemented incorrectly. Selenium: just because")
  @Test
  public void testSendingKeyboardEventsShouldAppendTextInInputsWithExistingValue() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.id("inputWithText"));
    element.sendKeys(". Some text");
    String value = element.getAttribute("value");

    assertThat(value, is("Example text. Some text"));
  }

  @Ignore(value = {HTMLUNIT, SELENESE, IPHONE, ANDROID},
      reason = "Not implemented going to the end of the line first;\n"
          + "  iPhone: sendKeys not implemented correctly")
  @Test
  public void testSendingKeyboardEventsShouldAppendTextinTextAreas() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.id("withText"));

    element.sendKeys(". Some text");
    String value = element.getAttribute("value");

    assertThat(value, is("Example text. Some text"));
  }

  @Test
  public void testShouldBeAbleToClearTextFromInputElements() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.id("working"));
    element.sendKeys("Some text");
    String value = element.getAttribute("value");
    assertThat(value.length(), is(greaterThan(0)));

    element.clear();
    value = element.getAttribute("value");

    assertThat(value.length(), is(0));
  }

  @Test
  public void testEmptyTextBoxesShouldReturnAnEmptyStringNotNull() {
    driver.get(pages.formPage);
    WebElement emptyTextBox = driver.findElement(By.id("working"));
    assertEquals(emptyTextBox.getAttribute("value"), "");
  }

  @Test
  public void testShouldBeAbleToClearTextFromTextAreas() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.id("withText"));
    element.sendKeys("Some text");
    String value = element.getAttribute("value");
    assertThat(value.length(), is(greaterThan(0)));

    element.clear();
    value = element.getAttribute("value");

    assertThat(value.length(), is(0));
  }
}
