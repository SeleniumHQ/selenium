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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.testing.drivers.Browser.ALL;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;

public class SelectElementTest extends JupiterTestBase {

  @BeforeEach
  public void runBeforeEveryTest() {
    driver.get(pages.formPage);
  }

  @Test
  public void shouldThrowAnExceptionIfTheElementIsNotASelectElement() {
    WebElement selectElement = driver.findElement(By.name("checky"));
    assertThatExceptionOfType(UnexpectedTagNameException.class)
        .isThrownBy(() -> new Select(selectElement));
  }

  @Test
  public void shouldIndicateThatASelectCanSupportMultipleOptions() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);
    assertThat(select.isMultiple()).isTrue();
  }

  @Test
  public void shouldIndicateThatASelectCanSupportMultipleOptionsWithEmptyMultipleAttribute() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);
    assertThat(select.isMultiple()).isTrue();
  }

  @Test
  public void shouldIndicateThatASelectCanSupportMultipleOptionsWithTrueMultipleAttribute() {
    WebElement selectElement = driver.findElement(By.name("multi_true"));
    Select select = new Select(selectElement);
    assertThat(select.isMultiple()).isTrue();
  }

  @Test
  public void shouldNotIndicateThatANormalSelectSupportsMultipleOptions() {
    WebElement selectElement = driver.findElement(By.name("selectomatic"));
    Select select = new Select(selectElement);
    assertThat(select.isMultiple()).isFalse();
  }

  @Test
  public void shouldIndicateThatASelectCanSupportMultipleOptionsWithFalseMultipleAttribute() {
    WebElement selectElement = driver.findElement(By.name("multi_false"));
    Select select = new Select(selectElement);
    assertThat(select.isMultiple()).isTrue();
  }

  @Test
  public void shouldReturnAllOptionsWhenAsked() {
    WebElement selectElement = driver.findElement(By.name("selectomatic"));
    Select select = new Select(selectElement);

    assertThat(select.getOptions()).extracting(WebElement::getText)
        .containsExactly("One", "Two", "Four", "Still learning how to count, apparently");

  }

  @Test
  public void shouldReturnOptionWhichIsSelected() {
    WebElement selectElement = driver.findElement(By.name("selectomatic"));
    Select select = new Select(selectElement);

    assertThat(select.getAllSelectedOptions()).extracting(WebElement::getText)
        .containsExactly("One");
  }

  @Test
  public void shouldReturnOptionsWhichAreSelected() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);

    assertThat(select.getAllSelectedOptions()).extracting(WebElement::getText)
        .containsExactly("Eggs", "Sausages");
  }

  @Test
  public void shouldReturnFirstSelectedOption() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);

    WebElement firstSelected = select.getFirstSelectedOption();
    assertThat(firstSelected.getText()).isEqualTo("Eggs");
  }

  @Test
  public void shouldThrowANoSuchElementExceptionIfNothingIsSelected() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(select::getFirstSelectedOption);
  }

  @Test
  public void shouldAllowOptionsToBeSelectedByVisibleText() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);
    select.selectByVisibleText("select_2");
    WebElement firstSelected = select.getFirstSelectedOption();
    assertThat(firstSelected.getText()).isEqualTo("select_2");
  }

  @Test
  @Ignore(ALL)
  public void shouldNotAllowInvisibleOptionsToBeSelectedByVisibleText() {
    WebElement selectElement = driver.findElement(By.id("invisi_select"));
    Select select = new Select(selectElement);

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> select.selectByVisibleText("Apples"));
  }

  @Test
  public void shouldThrowExceptionOnSelectByVisibleTextIfOptionDoesNotExist() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> select.selectByVisibleText("not there"));
  }

  @Test
  public void shouldAllowOptionsToBeSelectedByIndex() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);
    select.selectByIndex(1);
    WebElement firstSelected = select.getFirstSelectedOption();
    assertThat(firstSelected.getText()).isEqualTo("select_2");
  }

  @Test
  public void shouldThrowExceptionOnSelectByIndexIfOptionDoesNotExist() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> select.selectByIndex(10));
  }

  @Test
  public void shouldAllowOptionsToBeSelectedByReturnedValue() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);
    select.selectByValue("select_2");
    WebElement firstSelected = select.getFirstSelectedOption();
    assertThat(firstSelected.getText()).isEqualTo("select_2");
  }

  @Test
  public void shouldThrowExceptionOnSelectByReturnedValueIfOptionDoesNotExist() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> select.selectByValue("not there"));
  }

  @Test
  public void shouldAllowUserToDeselectAllWhenSelectSupportsMultipleSelections() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);
    select.deselectAll();

    assertThat(select.getAllSelectedOptions()).isEmpty();
  }

  @Test
  public void shouldNotAllowUserToDeselectAllWhenSelectDoesNotSupportMultipleSelections() {
    WebElement selectElement = driver.findElement(By.name("selectomatic"));
    Select select = new Select(selectElement);

    assertThatExceptionOfType(UnsupportedOperationException.class).isThrownBy(select::deselectAll);
  }

  @Test
  public void shouldAllowUserToDeselectOptionsByVisibleText() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);
    select.deselectByVisibleText("Eggs");

    assertThat(select.getAllSelectedOptions()).hasSize(1);
  }

  @Test
  @Ignore(ALL)
  public void shouldNotAllowUserToDeselectOptionsByInvisibleText() {
    WebElement selectElement = driver.findElement(By.id("invisi_select"));
    Select select = new Select(selectElement);

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> select.deselectByVisibleText("Apples"));
  }

  @Test
  public void shouldAllowOptionsToBeDeselectedByIndex() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);
    select.deselectByIndex(0);

    assertThat(select.getAllSelectedOptions()).hasSize(1);
  }

  @Test
  public void shouldAllowOptionsToBeDeselectedByReturnedValue() {
    WebElement selectElement = driver.findElement(By.name("multi"));
    Select select = new Select(selectElement);
    select.deselectByValue("eggs");

    assertThat(select.getAllSelectedOptions()).hasSize(1);
  }

  @Test
  public void shouldAllowOptionsToBeSelectedFromTheSelectElementThatIsNarrowerThanOptions() {
    driver.get(pages.selectPage);
    WebElement selectElement = driver.findElement(By.id("narrow"));
    Select select = new Select(selectElement);
    select.selectByIndex(1);

    assertThat(select.getAllSelectedOptions()).hasSize(1);
  }

  @Test
  public void shouldThrowExceptionOnDeselectByReturnedValueIfOptionDoesNotExist() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> select.deselectByValue("not there"));
  }

  @Test
  public void shouldThrowExceptionOnDeselectByVisibleTextIfOptionDoesNotExist() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> select.deselectByVisibleText("not there"));
  }

  @Test
  public void shouldThrowExceptionOnDeselectByIndexIfOptionDoesNotExist() {
    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));
    Select select = new Select(selectElement);

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> select.deselectByIndex(10));
  }

  @Test
  public void shouldNotAllowUserToDeselectByIndexWhenSelectDoesNotSupportMultipleSelections() {
    WebElement selectElement = driver.findElement(By.name("selectomatic"));
    Select select = new Select(selectElement);

    assertThatExceptionOfType(UnsupportedOperationException.class)
        .isThrownBy(() -> select.deselectByIndex(10));
  }

  @Test
  public void shouldNotAllowUserToDeselectByValueWhenSelectDoesNotSupportMultipleSelections() {
    WebElement selectElement = driver.findElement(By.name("selectomatic"));
    Select select = new Select(selectElement);

    assertThatExceptionOfType(UnsupportedOperationException.class)
        .isThrownBy(() -> select.deselectByValue("two"));
  }

  @Test
  public void shouldNotAllowUserToDeselectByVisibleTextWhenSelectDoesNotSupportMultipleSelections() {
    WebElement selectElement = driver.findElement(By.name("selectomatic"));
    Select select = new Select(selectElement);

    assertThatExceptionOfType(UnsupportedOperationException.class)
        .isThrownBy(() -> select.deselectByVisibleText("Four"));
  }
}
