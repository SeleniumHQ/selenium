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

import static java.util.Collections.emptyList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import org.mockito.ArgumentMatchers;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Tag("UnitTests")
public class SelectTest {

  @Test
  public void shouldThrowAnExceptionIfTheElementIsNotASelectElement() {
    final WebElement element = mock(WebElement.class);
    when(element.getTagName()).thenReturn("a");

    assertThatExceptionOfType(UnexpectedTagNameException.class)
        .isThrownBy(() -> new Select(element));
  }

  private Select selectElementWithMultipleEqualTo(final String multipleAttribute) {
    return new Select(mockSelectWebElement(multipleAttribute));
  }

  @Test
  public void shouldIndicateThatASelectCanSupportMultipleOptions() {
    Select select = selectElementWithMultipleEqualTo("multiple");
    assertThat(select.isMultiple()).isTrue();
  }

  @Test
  public void shouldIndicateThatASelectCanSupportMultipleOptionsWithEmptyMultipleAttribute() {
    Select select = selectElementWithMultipleEqualTo("");
    assertThat(select.isMultiple()).isTrue();
  }

  @Test
  public void shouldNotIndicateThatANormalSelectSupportsMultipleOptions() {
    Select select = selectElementWithMultipleEqualTo(null);
    assertThat(select.isMultiple()).isFalse();
  }

  private WebElement mockSelectWebElement(String multiple) {
    final WebElement element = mock(WebElement.class);
    when(element.getTagName()).thenReturn("select");
    when(element.getDomAttribute("multiple")).thenReturn(multiple);
    return element;
  }

  private Select selectWithOptions(List<WebElement> options) {
    final WebElement element = mockSelectWebElement("multiple");
    when(element.findElements(By.tagName("option"))).thenReturn(options);
    return new Select(element);
  }

  @Test
  public void shouldReturnAllOptionsWhenAsked() {
    final List<WebElement> expectedOptions = emptyList();
    Select select = selectWithOptions(expectedOptions);

    assertThat(select.getOptions()).isSameAs(expectedOptions);
  }

  private WebElement mockOption(String name, boolean isSelected) {
    final WebElement optionBad = mock(WebElement.class, name);
    when(optionBad.isSelected()).thenReturn(isSelected);
    return optionBad;
  }

  private WebElement mockOption(String name, boolean isSelected, int index) {
    WebElement option = mockOption(name, isSelected);
    when(option.getAttribute("index")).thenReturn(String.valueOf(index));
    return option;
  }

  @Test
  public void shouldReturnOptionsWhichAreSelected() {
    final WebElement optionGood = mockOption("good", true);
    final WebElement optionBad = mockOption("bad", false);
    final List<WebElement> options = Arrays.asList(optionBad, optionGood);

    Select select = selectWithOptions(options);
    List<WebElement> returnedOptions = select.getAllSelectedOptions();

    assertThat(returnedOptions).hasSize(1);
    assertThat(returnedOptions.get(0)).isSameAs(optionGood);
  }

  @Test
  public void shouldReturnFirstSelectedOptions() {
    final WebElement firstOption = mockOption("first", true);
    final WebElement secondOption = mockOption("second", true);
    final List<WebElement> options = Arrays.asList(firstOption, secondOption);

    Select select = selectWithOptions(options);
    WebElement firstSelected = select.getFirstSelectedOption();

    assertThat(firstSelected).isSameAs(firstOption);
  }

  @Test
  public void shouldThrowANoSuchElementExceptionIfNothingIsSelected() {
    final WebElement firstOption = mockOption("first", false);
    Select select = selectWithOptions(Collections.singletonList(firstOption));

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(select::getFirstSelectedOption);
  }

  @Test
  public void shouldAllowOptionsToBeSelectedByVisibleText() {
    final WebElement firstOption = mockOption("first", false);

    final WebElement element = mockSelectWebElement("multiple");
    when(element.findElements(By.xpath(".//option[normalize-space(.) = \"fish\"]")))
        .thenReturn(Collections.singletonList(firstOption));

    Select select = new Select(element);
    select.selectByVisibleText("fish");

    verify(firstOption).click();
  }

  @Test
  public void shouldAllowOptionsToBeSelectedByIndex() {
    final WebElement firstOption = mockOption("first", true, 0);
    final WebElement secondOption = mockOption("second", false, 1);

    Select select = selectWithOptions(Arrays.asList(firstOption, secondOption));
    select.selectByIndex(1);

    verify(firstOption, never()).click();
    verify(secondOption).click();
  }

  @Test
  public void shouldAllowOptionsToBeSelectedByReturnedValue() {
    final WebElement firstOption = mockOption("first", false);

    final WebElement element = mockSelectWebElement("multiple");
    when(element.findElements(By.xpath(".//option[@value = \"b\"]"))).thenReturn(
        Collections.singletonList(firstOption));

    Select select = new Select(element);
    select.selectByValue("b");

    verify(firstOption).click();
  }

  @Test
  public void shouldAllowUserToDeselectAllWhenSelectSupportsMultipleSelections() {
    final WebElement firstOption = mockOption("first", true);
    final WebElement secondOption = mockOption("second", false);

    Select select = selectWithOptions(Arrays.asList(firstOption, secondOption));
    select.deselectAll();

    verify(firstOption).click();
    verify(secondOption, never()).click();
  }

  @Test
  public void shouldNotAllowUserToDeselectAllWhenSelectDoesNotSupportMultipleSelections() {
    Select select = selectElementWithMultipleEqualTo(null);
    assertThatExceptionOfType(UnsupportedOperationException.class)
        .isThrownBy(select::deselectAll);
  }

  @Test
  public void shouldAllowUserToDeselectOptionsByVisibleText() {
    final WebElement firstOption = mockOption("first", true);
    final WebElement secondOption = mockOption("second", false);

    final WebElement element = mockSelectWebElement("multiple");
    when(element.findElements(By.xpath(".//option[normalize-space(.) = \"b\"]")))
        .thenReturn(Arrays.asList(firstOption, secondOption));

    Select select = new Select(element);
    select.deselectByVisibleText("b");

    verify(firstOption).click();
    verify(secondOption, never()).click();
  }

  @Test
  public void shouldAllowOptionsToBeDeselectedByIndex() {
    final WebElement firstOption = mockOption("first", true, 2);
    final WebElement secondOption = mockOption("second", false, 1);

    Select select = selectWithOptions(Arrays.asList(firstOption, secondOption));
    select.deselectByIndex(2);

    verify(firstOption).click();
    verify(secondOption, never()).click();
  }

  @Test
  public void shouldAllowOptionsToBeDeselectedByReturnedValue() {
    final WebElement firstOption = mockOption("first", true);
    final WebElement secondOption = mockOption("third", false);

    final WebElement element = mockSelectWebElement("multiple");
    when(element.findElements(By.xpath(".//option[@value = \"b\"]")))
        .thenReturn(Arrays.asList(firstOption, secondOption));

    Select select = new Select(element);
    select.deselectByValue("b");

    verify(firstOption).click();
    verify(secondOption, never()).click();
  }

  @Test
  public void shouldFallBackToSlowLooksUpsWhenGetByVisibleTextFailsAndThereIsASpace() {
    final WebElement firstOption = mock(WebElement.class, "first");
    final By xpath1 = By.xpath(".//option[normalize-space(.) = \"foo bar\"]");
    final By xpath2 = By.xpath(".//option[contains(., \"foo\")]");

    final WebElement element = mockSelectWebElement("multiple");
    when(element.getTagName()).thenReturn("select");
    when(element.getDomAttribute("multiple")).thenReturn("false");
    when(element.findElements(xpath1)).thenReturn(emptyList());
    when(element.findElements(xpath2)).thenReturn(Collections.singletonList(firstOption));
    when(firstOption.getText()).thenReturn("foo bar");

    Select select = new Select(element);
    select.selectByVisibleText("foo bar");

    verify(firstOption).click();
  }

  @Test
  public void shouldIndicateWhetherASelectIsMultipleCorrectly() {
    assertThat(selectElementWithMultipleEqualTo("false").isMultiple()).isFalse();
    assertThat(selectElementWithMultipleEqualTo(null).isMultiple()).isFalse();
    assertThat(selectElementWithMultipleEqualTo("true").isMultiple()).isTrue();
    assertThat(selectElementWithMultipleEqualTo("multiple").isMultiple()).isTrue();
  }

  @Test
  public void shouldThrowAnExceptionIfThereAreNoElementsToSelect() {
    final WebElement element = mockSelectWebElement("false");
    when(element.findElements(ArgumentMatchers.any())).thenReturn(emptyList());

    Select select = new Select(element);

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> select.selectByIndex(12));

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> select.selectByValue("not there"));

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> select.selectByVisibleText("also not there"));
  }
}
