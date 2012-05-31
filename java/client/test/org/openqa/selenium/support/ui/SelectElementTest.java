/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.selenium.support.ui;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.util.List;

import static org.junit.Assert.*;

public class SelectElementTest extends JUnit4TestBase {

  @Before
  public void runBeforeEveryTest() {
    driver.get(pages.formPage);
  }

  @Test(expected = org.openqa.selenium.support.ui.UnexpectedTagNameException.class)
  public void shouldThrowAnExceptionIfTheElementIsNotASelectElement() {
    WebElement selectElement = driver.findElement(By.name("checky"));
    Select select = new Select(selectElement);
  }

  @Test
  public void shouldIndicateThatASelectCanSupportMultipleOptions() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);
    assertTrue(select.isMultiple());
  }

  @Test
  public void shouldIndicateThatASelectCanSupportMultipleOptionsWithEmptyMultipleAttribute() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);
    assertTrue(select.isMultiple());
  }

  @Test
  public void shouldIndicateThatASelectCanSupportMultipleOptionsWithTrueMultipleAttribute() {
    WebElement selectElement = driver.findElement(By.name("multi_true"));
    Select select = new Select(selectElement);
    assertTrue(select.isMultiple());
  }

  @Test
  public void shouldNotIndicateThatANormalSelectSupportsMulitpleOptions() {
    WebElement selectElement = driver.findElement(By.name("selectomatic"));
    Select select = new Select(selectElement);
    assertFalse(select.isMultiple());
  }

  @Test
  public void shouldIndicateThatASelectCanSupportMultipleOptionsWithFalseMultipleAttribute() {
    WebElement selectElement = driver.findElement(By.name("multi_false"));
    Select select = new Select(selectElement);
    assertTrue(select.isMultiple());
  }

  @Test
  public void shouldReturnAllOptionsWhenAsked() {
    WebElement selectElement = driver.findElement(By.name("selectomatic"));
    Select select = new Select(selectElement);
    List<WebElement> returnedOptions = select.getOptions();

    assertEquals(4,returnedOptions.size());

    String one = returnedOptions.get(0).getText();
    assertEquals("One", one);

    String two = returnedOptions.get(1).getText();
    assertEquals("Two", two);

    String three = returnedOptions.get(2).getText();
    assertEquals("Four", three);

    String four = returnedOptions.get(3).getText();
    assertEquals("Still learning how to count, apparently", four);

  }

  @Test
  public void shouldReturnOptionWhichIsSelected() {
    WebElement selectElement = driver.findElement(By.name("selectomatic"));
    Select select = new Select(selectElement);

    List<WebElement> returnedOptions = select.getAllSelectedOptions();

    assertEquals(1,returnedOptions.size());

    String one = returnedOptions.get(0).getText();
    assertEquals("One", one);
  }

  @Test
  public void shouldReturnOptionsWhichAreSelected() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);

    List<WebElement> returnedOptions = select.getAllSelectedOptions();

    assertEquals(2,returnedOptions.size());

    String one = returnedOptions.get(0).getText();
    assertEquals("Eggs", one);

    String two = returnedOptions.get(1).getText();
    assertEquals("Sausages", two);
  }

  @Test
  public void shouldReturnFirstSelectedOption() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);

    WebElement firstSelected = select.getFirstSelectedOption();

    assertEquals("Eggs",firstSelected.getText());
  }

  @Test(expected = org.openqa.selenium.NoSuchElementException.class)
  public void shouldThrowANoSuchElementExceptionIfNothingIsSelected() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);

    select.getFirstSelectedOption();
  }

  @Test
  public void shouldAllowOptionsToBeSelectedByVisibleText() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);
    select.selectByVisibleText("select_2");
    WebElement firstSelected = select.getFirstSelectedOption();
    assertEquals("select_2",firstSelected.getText());
  }

  @Test(expected = org.openqa.selenium.NoSuchElementException.class)
  public void shouldNotAllowInvisibleOptionsToBeSelectedByVisibleText() {
    WebElement selectElement = driver.findElement(By.name("invisi_select"));
    Select select = new Select(selectElement);
    select.selectByVisibleText("Apples");
  }

  @Test(expected = org.openqa.selenium.NoSuchElementException.class)
  public void shouldThrowExceptionOnSelectByVisibleTextIfOptionDoesNotExist() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);
    select.selectByVisibleText("not there");
  }

  @Test
  public void shouldAllowOptionsToBeSelectedByIndex() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);
    select.selectByIndex(1);
    WebElement firstSelected = select.getFirstSelectedOption();
    assertEquals("select_2",firstSelected.getText());
  }

  @Test(expected = org.openqa.selenium.NoSuchElementException.class)
  public void shouldThrowExceptionOnSelectByIndexIfOptionDoesNotExist() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);
    select.selectByIndex(10);
  }

  @Test
  public void shouldAllowOptionsToBeSelectedByReturnedValue() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);
    select.selectByValue("select_2");
    WebElement firstSelected = select.getFirstSelectedOption();
    assertEquals("select_2",firstSelected.getText());
  }

  @Test(expected = org.openqa.selenium.NoSuchElementException.class)
  public void shouldThrowExceptionOnSelectByReturnedValueIfOptionDoesNotExist() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);
    select.selectByValue("not there");
  }

  @Test
  public void shouldAllowUserToDeselectAllWhenSelectSupportsMultipleSelections() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);
    select.deselectAll();
    List<WebElement> returnedOptions = select.getAllSelectedOptions();

    assertEquals(0,returnedOptions.size());
  }

  @Test(expected = java.lang.UnsupportedOperationException.class)
  public void shouldNotAllowUserToDeselectAllWhenSelectDoesNotSupportMultipleSelections() {
    WebElement selectElement = driver.findElement(By.name("selectomatic"));
    Select select = new Select(selectElement);
    select.deselectAll();
  }

  @Test
  public void shouldAllowUserToDeselectOptionsByVisibleText() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);
    select.deselectByVisibleText("Eggs");
    List<WebElement> returnedOptions = select.getAllSelectedOptions();

    assertEquals(1,returnedOptions.size());
  }

  @Test(expected = org.openqa.selenium.NoSuchElementException.class)
  public void shouldNotAllowUserToDeselectOptionsByInvisibleText() {
    WebElement selectElement = driver.findElement(By.name("invisi_select"));
    Select select = new Select(selectElement);
    select.deselectByVisibleText("Apples");
  }

  @Test
  public void shouldAllowOptionsToBeDeselectedByIndex() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);
    select.deselectByIndex(0);
    List<WebElement> returnedOptions = select.getAllSelectedOptions();

    assertEquals(1,returnedOptions.size());
  }

  @Test
  public void shouldAllowOptionsToBeDeselectedByReturnedValue() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);
    select.deselectByValue("eggs");
    List<WebElement> returnedOptions = select.getAllSelectedOptions();

    assertEquals(1,returnedOptions.size());
  }

  @Test
  public void shouldConvertAnUnquotedStringIntoOneWithQuotes() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);
    String result = select.escapeQuotes("foo");

    assertEquals("\"foo\"", result);
  }

  @Test
  public void shouldConvertAStringWithATickIntoOneWithQuotes() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);
    String result = select.escapeQuotes("f'oo");

    assertEquals("\"f'oo\"", result);
  }

  @Test
  public void shouldConvertAStringWithAQuotIntoOneWithTicks() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);
    String result = select.escapeQuotes("f\"oo");

    assertEquals("'f\"oo'", result);
  }

  @Test
  public void shouldProvideConcatenatedStringsWhenStringToEscapeContainsTicksAndQuotes() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);
    String result = select.escapeQuotes("f\"o'o");

    assertEquals("concat(\"f\", '\"', \"o'o\")", result);
  }

  /**
   * Tests that escapeQuotes returns concatenated strings when the given
   * string contains a tick and and ends with a quote.
   */
  @Test
  public void shouldProvideConcatenatedStringsWhenStringEndsWithQuote() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);
    String result = select.escapeQuotes("'\"");

    assertEquals("concat(\"'\", '\"')", result);
  }

}
