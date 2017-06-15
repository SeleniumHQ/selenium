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

package org.openqa.selenium.support.ui;

import static org.hamcrest.CoreMatchers.instanceOf;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.testing.Driver.ALL;
import static org.openqa.selenium.testing.TestUtilities.catchThrowable;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.util.List;

public class SelectElementTest extends JUnit4TestBase {

  @Before
  public void runBeforeEveryTest() {
    driver.get(pages.formPage);
  }

  @Test
  public void shouldThrowAnExceptionIfTheElementIsNotASelectElement() {
    WebElement selectElement = driver.findElement(By.name("checky"));
    Throwable t = catchThrowable(() -> new Select(selectElement));
    assertThat(t, instanceOf(UnexpectedTagNameException.class));
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

  @Test
  public void shouldThrowANoSuchElementExceptionIfNothingIsSelected() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);

    Throwable t = catchThrowable(select::getFirstSelectedOption);
    assertThat(t, instanceOf(NoSuchElementException.class));
  }

  @Test
  public void shouldAllowOptionsToBeSelectedByVisibleText() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);
    select.selectByVisibleText("select_2");
    WebElement firstSelected = select.getFirstSelectedOption();
    assertEquals("select_2",firstSelected.getText());
  }

  @Test
  @Ignore(ALL)
  public void shouldNotAllowInvisibleOptionsToBeSelectedByVisibleText() {
    WebElement selectElement = driver.findElement(By.id("invisi_select"));
    Select select = new Select(selectElement);

    Throwable t = catchThrowable(() -> select.selectByVisibleText("Apples"));
    assertThat(t, instanceOf(NoSuchElementException.class));
  }

  @Test
  public void shouldThrowExceptionOnSelectByVisibleTextIfOptionDoesNotExist() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);

    Throwable t = catchThrowable(() -> select.selectByVisibleText("not there"));
    assertThat(t, instanceOf(NoSuchElementException.class));
  }

  @Test
  public void shouldAllowOptionsToBeSelectedByIndex() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);
    select.selectByIndex(1);
    WebElement firstSelected = select.getFirstSelectedOption();
    assertEquals("select_2",firstSelected.getText());
  }

  @Test
  public void shouldThrowExceptionOnSelectByIndexIfOptionDoesNotExist() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);

    Throwable t = catchThrowable(() -> select.selectByIndex(10));
    assertThat(t, instanceOf(NoSuchElementException.class));
  }

  @Test
  public void shouldAllowOptionsToBeSelectedByReturnedValue() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);
    select.selectByValue("select_2");
    WebElement firstSelected = select.getFirstSelectedOption();
    assertEquals("select_2",firstSelected.getText());
  }

  @Test
  public void shouldThrowExceptionOnSelectByReturnedValueIfOptionDoesNotExist() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);

    Throwable t = catchThrowable(() -> select.selectByValue("not there"));
    assertThat(t, instanceOf(NoSuchElementException.class));
  }

  @Test
  public void shouldAllowUserToDeselectAllWhenSelectSupportsMultipleSelections() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);
    select.deselectAll();
    List<WebElement> returnedOptions = select.getAllSelectedOptions();

    assertEquals(0,returnedOptions.size());
  }

  @Test
  public void shouldNotAllowUserToDeselectAllWhenSelectDoesNotSupportMultipleSelections() {
    WebElement selectElement = driver.findElement(By.name("selectomatic"));
    Select select = new Select(selectElement);

    Throwable t = catchThrowable(select::deselectAll);
    assertThat(t, instanceOf(UnsupportedOperationException.class));
  }

  @Test
  public void shouldAllowUserToDeselectOptionsByVisibleText() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);
    select.deselectByVisibleText("Eggs");
    List<WebElement> returnedOptions = select.getAllSelectedOptions();

    assertEquals(1,returnedOptions.size());
  }

  @Test
  @Ignore(ALL)
  public void shouldNotAllowUserToDeselectOptionsByInvisibleText() {
    WebElement selectElement = driver.findElement(By.id("invisi_select"));
    Select select = new Select(selectElement);

    Throwable t = catchThrowable(() -> select.deselectByVisibleText("Apples"));
    assertThat(t, instanceOf(NoSuchElementException.class));
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
  public void shouldAllowOptionsToBeSelectedFromTheSelectElementThatIsNarrowerThanOptions() {
    driver.get(pages.selectPage);
    WebElement selectElement = driver.findElement(By.id("narrow"));
    Select select = new Select(selectElement);
    select.selectByIndex(1);
    List<WebElement> returnedOptions = select.getAllSelectedOptions();

    assertEquals(1,returnedOptions.size());
  }
  
  @Test
  public void shouldThrowExceptionOnDeselectByReturnedValueIfOptionDoesNotExist() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);

    Throwable t = catchThrowable(() -> select.deselectByValue("not there"));
    assertThat(t, instanceOf(NoSuchElementException.class));
  }
  
  @Test
  public void shouldThrowExceptionOnDeselectByVisibleTextIfOptionDoesNotExist() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);

    Throwable t = catchThrowable(() -> select.deselectByVisibleText("not there"));
    assertThat(t, instanceOf(NoSuchElementException.class));
  }
  
  @Test
  public void shouldThrowExceptionOnDeselectByIndexIfOptionDoesNotExist() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);

    Throwable t = catchThrowable(() -> select.deselectByIndex(10));
    assertThat(t, instanceOf(NoSuchElementException.class));
  }
  
  @Test
  public void shouldNotAllowUserToDeselectByIndexWhenSelectDoesNotSupportMultipleSelections() {
    WebElement selectElement = driver.findElement(By.name("selectomatic"));
    Select select = new Select(selectElement);

    Throwable t = catchThrowable(() -> select.deselectByIndex(10));
    assertThat(t, instanceOf(UnsupportedOperationException.class));
  }
  
  @Test
  public void shouldNotAllowUserToDeselectByValueWhenSelectDoesNotSupportMultipleSelections() {
    WebElement selectElement = driver.findElement(By.name("selectomatic"));
    Select select = new Select(selectElement);

    Throwable t = catchThrowable(() -> select.deselectByValue("two"));
    assertThat(t, instanceOf(UnsupportedOperationException.class));
  }
  
  @Test
  public void shouldNotAllowUserToDeselectByVisibleTextWhenSelectDoesNotSupportMultipleSelections() {
    WebElement selectElement = driver.findElement(By.name("selectomatic"));
    Select select = new Select(selectElement);

    Throwable t = catchThrowable(() -> select.deselectByVisibleText("Four"));
    assertThat(t, instanceOf(UnsupportedOperationException.class));
  }
}
