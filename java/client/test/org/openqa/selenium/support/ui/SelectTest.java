/*
Copyright 2007-2009 Selenium committers

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

import org.junit.Test;
import org.mockito.Mockito;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class SelectTest{

  @Test
  public void shouldThrowAnExceptionIfTheElementIsNotASelectElement() {
    final WebElement element = mock(WebElement.class);
    when(element.getTagName()).thenReturn("a");

    try {
      new Select(element);
      fail("Should not have passed");
    } catch (UnexpectedTagNameException e) {
      // This is expected
    }
  }

  private Select selectElementWithMultipleEqualTo(final String value) {
    final WebElement element = mock(WebElement.class);
    when(element.getTagName()).thenReturn("select");
    when(element.getAttribute("multiple")).thenReturn(value);

    return new Select(element);
  }

  @Test
  public void shouldIndicateThatASelectCanSupportMultipleOptions() {
    Select select = selectElementWithMultipleEqualTo("multiple");
    assertTrue(select.isMultiple());
  }

  @Test
  public void shouldIndicateThatASelectCanSupportMultipleOptionsWithEmptyMultipleAttribute() {
    Select select = selectElementWithMultipleEqualTo("");
    assertTrue(select.isMultiple());
  }

  @Test
  public void shouldNotIndicateThatANormalSelectSupportsMulitpleOptions() {
    Select select = selectElementWithMultipleEqualTo(null);

    assertFalse(select.isMultiple());
  }

  @Test
  public void shouldReturnAllOptionsWhenAsked() {
    final WebElement element = mock(WebElement.class);
    final List<WebElement> options = Collections.emptyList();

    when(element.getTagName()).thenReturn("select");
    when(element.getAttribute("multiple")).thenReturn("multiple");
    when(element.findElements(By.tagName("option"))).thenReturn(options);

    Select select = new Select(element);
    List<WebElement> returnedOptions = select.getOptions();

    assertSame(options, returnedOptions);
  }

  @Test
  public void shouldReturnOptionsWhichAreSelected() {
    final WebElement element = mock(WebElement.class);
    final WebElement optionGood = mock(WebElement.class, "good");
    final WebElement optionBad = mock(WebElement.class, "bad");
    final List<WebElement> options = Arrays.asList(optionBad, optionGood);

    when(element.getTagName()).thenReturn("select");
    when(element.getAttribute("multiple")).thenReturn("multiple");
    when(element.findElements(By.tagName("option"))).thenReturn(options);
    when(optionBad.isSelected()).thenReturn(false);
    when(optionGood.isSelected()).thenReturn(true);

    Select select = new Select(element);
    List<WebElement> returnedOptions = select.getAllSelectedOptions();

    assertEquals(1, returnedOptions.size());
    assertSame(optionGood, returnedOptions.get(0));
  }

  @Test
  public void shouldReturnFirstSelectedOptions() {
    final WebElement element = mock(WebElement.class);
    final WebElement firstOption = mock(WebElement.class, "first");
    final WebElement secondOption = mock(WebElement.class, "second");
    final List<WebElement> options = Arrays.asList(firstOption, secondOption);

    when(element.getTagName()).thenReturn("select");
    when(element.getAttribute("multiple")).thenReturn("multiple");
    when(element.findElements(By.tagName("option"))).thenReturn(options);
    when(firstOption.isSelected()).thenReturn(true);
    when(secondOption.isSelected()).thenReturn(true);

    Select select = new Select(element);
    WebElement firstSelected = select.getFirstSelectedOption();

    assertSame(firstOption, firstSelected);
  }

  @Test
  public void shouldThrowANoSuchElementExceptionIfNothingIsSelected() {
    final WebElement element = mock(WebElement.class);
    final WebElement firstOption = mock(WebElement.class, "first");
    final List<WebElement> options = Arrays.asList(firstOption);

    when(element.getTagName()).thenReturn("select");
    when(element.getAttribute("multiple")).thenReturn("multiple");
    when(element.findElements(By.tagName("option"))).thenReturn(options);

    Select select = new Select(element);

    try {
      select.getFirstSelectedOption();
      fail();
    } catch (NoSuchElementException e) {
      // this is expected
    }
  }

  @Test
  public void shouldAllowOptionsToBeSelectedByVisibleText() {
    final WebElement element = mock(WebElement.class);
    final WebElement firstOption = mock(WebElement.class, "first");
    final List<WebElement> options = Arrays.asList(firstOption);

    when(element.getTagName()).thenReturn("select");
    when(element.getAttribute("multiple")).thenReturn("multiple");
    when(element.findElements(By.xpath(".//option[normalize-space(.) = \"fish\"]")))
        .thenReturn(options);
    when(firstOption.isSelected()).thenReturn(false);

    Select select = new Select(element);
    select.selectByVisibleText("fish");

    verify(firstOption).click();
  }

  @Test
  public void shouldAllowOptionsToBeSelectedByIndex() {
    final WebElement element = mock(WebElement.class);
    final WebElement firstOption = mock(WebElement.class, "first");
    final WebElement secondOption = mock(WebElement.class, "second");
    final List<WebElement> options = Arrays.asList(firstOption, secondOption);

    when(element.getTagName()).thenReturn("select");
    when(element.getAttribute("multiple")).thenReturn("multiple");
    when(element.findElements(By.tagName("option"))).thenReturn(options);
    when(firstOption.getAttribute("index")).thenReturn("0");
    when(firstOption.isSelected()).thenReturn(true);
    when(secondOption.getAttribute("index")).thenReturn("1");
    when(secondOption.isSelected()).thenReturn(false);

    Select select = new Select(element);
    select.selectByIndex(1);

    verify(firstOption, never()).click();
    verify(secondOption).click();
  }

  @Test
  public void shouldAllowOptionsToBeSelectedByReturnedValue() {
    final WebElement element = mock(WebElement.class);
    final WebElement firstOption = mock(WebElement.class, "first");
    final List<WebElement> options = Arrays.asList(firstOption);

    when(element.getTagName()).thenReturn("select");
    when(element.getAttribute("multiple")).thenReturn("multiple");
    when(element.findElements(By.xpath(".//option[@value = \"b\"]"))).thenReturn(options);
    when(firstOption.isSelected()).thenReturn(false);

    Select select = new Select(element);
    select.selectByValue("b");

    verify(firstOption).click();
  }

  @Test
  public void shouldAllowUserToDeselectAllWhenSelectSupportsMultipleSelections() {
    final WebElement element = mock(WebElement.class);
    final WebElement firstOption = mock(WebElement.class, "first");
    final WebElement secondOption = mock(WebElement.class, "second");
    final List<WebElement> options = Arrays.asList(firstOption, secondOption);

    when(element.getTagName()).thenReturn("select");
    when(element.getAttribute("multiple")).thenReturn("multiple");
    when(element.findElements(By.tagName("option"))).thenReturn(options);
    when(firstOption.isSelected()).thenReturn(true);
    when(secondOption.isSelected()).thenReturn(false);

    Select select = new Select(element);
    select.deselectAll();

    verify(firstOption).click();
    verify(secondOption, never()).click();
  }

  @Test
  public void shouldNotAllowUserToDeselectAllWhenSelectDoesNotSupportMultipleSelections() {
    Select select = selectElementWithMultipleEqualTo(null);
    try {
      select.deselectAll();
      fail();
    } catch (UnsupportedOperationException e) {
      // expected
    }
  }

  @Test
  public void shouldAllowUserToDeselectOptionsByVisibleText() {
    final WebElement element = mock(WebElement.class);
    final WebElement firstOption = mock(WebElement.class, "first");
    final WebElement secondOption = mock(WebElement.class, "second");
    final List<WebElement> options = Arrays.asList(firstOption, secondOption);

    when(element.getTagName()).thenReturn("select");
    when(element.getAttribute("multiple")).thenReturn("multiple");
    when(element.findElements(By.xpath(".//option[normalize-space(.) = \"b\"]")))
        .thenReturn(options);
    when(firstOption.isSelected()).thenReturn(true);
    when(secondOption.isSelected()).thenReturn(false);

    Select select = new Select(element);
    select.deselectByVisibleText("b");

    verify(firstOption).click();
    verify(secondOption, never()).click();
  }

  @Test
  public void shouldAllowOptionsToBeDeselectedByIndex() {
    final WebElement element = mock(WebElement.class);
    final WebElement firstOption = mock(WebElement.class, "first");
    final WebElement secondOption = mock(WebElement.class, "second");
    final List<WebElement> options = Arrays.asList(firstOption, secondOption);

    when(element.getTagName()).thenReturn("select");
    when(element.getAttribute("multiple")).thenReturn("multiple");
    when(element.findElements(By.tagName("option"))).thenReturn(options);
    when(firstOption.getAttribute("index")).thenReturn("2");
    when(firstOption.isSelected()).thenReturn(true);
    when(secondOption.getAttribute("index")).thenReturn("1");

    Select select = new Select(element);
    select.deselectByIndex(2);

    verify(firstOption).click();
    verify(secondOption, never()).click();
  }

  @Test
  public void shouldAllowOptionsToBeDeselectedByReturnedValue() {
    final WebElement element = mock(WebElement.class);
    final WebElement firstOption = mock(WebElement.class, "first");
    final WebElement secondOption = mock(WebElement.class, "third");
    final List<WebElement> options = Arrays.asList(firstOption, secondOption);

    when(element.getTagName()).thenReturn("select");
    when(element.getAttribute("multiple")).thenReturn("multiple");
    when(element.findElements(By.xpath(".//option[@value = \"b\"]")))
        .thenReturn(options);
    when(firstOption.isSelected()).thenReturn(true);
    when(secondOption.isSelected()).thenReturn(false);

    Select select = new Select(element);
    select.deselectByValue("b");

    verify(firstOption).click();
    verify(secondOption, never()).click();
  }

  @Test
  public void shouldConvertAnUnquotedStringIntoOneWithQuotes() {
    assertEquals("\"foo\"", escapeQuotes("foo"));
  }

  @Test
  public void shouldConvertAStringWithATickIntoOneWithQuotes() {
    assertEquals("\"f'oo\"", escapeQuotes("f'oo"));
  }

  @Test
  public void shouldConvertAStringWithAQuotIntoOneWithTicks() {
    assertEquals("'f\"oo'", escapeQuotes("f\"oo"));
  }

  @Test
  public void shouldProvideConcatenatedStringsWhenStringToEscapeContainsTicksAndQuotes() {
    assertEquals("concat(\"f\", '\"', \"o'o\")", escapeQuotes("f\"o'o"));
  }

  /**
   * Tests that escapeQuotes returns concatenated strings when the given
   * string contains a tick and and ends with a quote.
   */
  @Test
  public void shouldProvideConcatenatedStringsWhenStringEndsWithQuote() {
    assertEquals("concat(\"Bar \", '\"', \"Rock'n'Roll\", '\"')", escapeQuotes("Bar \"Rock'n'Roll\""));
  }

  @Test
  public void shouldFallBackToSlowLooksUpsWhenGetByVisibleTextFailsAndThereIsASpace() {
    final WebElement element = mock(WebElement.class);
    final WebElement firstOption = mock(WebElement.class, "first");
    final By xpath1 = By.xpath(".//option[normalize-space(.) = \"foo bar\"]");
    final By xpath2 = By.xpath(".//option[contains(., \"foo\")]");

    when(element.getTagName()).thenReturn("select");
    when(element.getAttribute("multiple")).thenReturn("false");
    when(element.findElements(xpath1)).thenReturn(Collections.<WebElement>emptyList());
    when(element.findElements(xpath2)).thenReturn(Collections.singletonList(firstOption));
    when(firstOption.getText()).thenReturn("foo bar");

    Select select = new Select(element);
    select.selectByVisibleText("foo bar");

    verify(firstOption).click();
  }

  @Test
  public void shouldIndicateWhetherASelectIsMultipleCorrectly() {
    final WebElement element1 = mock(WebElement.class, "false1");
    final WebElement element2 = mock(WebElement.class, "false2");
    final WebElement element3 = mock(WebElement.class, "true1");
    final WebElement element4 = mock(WebElement.class, "true2");

    when(element1.getTagName()).thenReturn("select");
    when(element1.getAttribute("multiple")).thenReturn("false");

    when(element2.getTagName()).thenReturn("select");
    when(element2.getAttribute("multiple")).thenReturn(null);

    when(element3.getTagName()).thenReturn("select");
    when(element3.getAttribute("multiple")).thenReturn("true");

    when(element4.getTagName()).thenReturn("select");
    when(element4.getAttribute("multiple")).thenReturn("multiple");

    Select select1 = new Select(element1);
    assertFalse(select1.isMultiple());

    Select select2 = new Select(element2);
    assertFalse(select2.isMultiple());

    Select select3 = new Select(element3);
    assertTrue(select3.isMultiple());

    Select select4 = new Select(element4);
    assertTrue(select4.isMultiple());
  }

  @Test
  public void shouldThrowAnExceptionIfThereAreNoElementsToSelect() {
    final WebElement element = mock(WebElement.class);

    when(element.getTagName()).thenReturn("select");
    when(element.getAttribute("multiple")).thenReturn("false");
    when(element.findElements(Mockito.<By>any())).thenReturn(Collections.<WebElement>emptyList());

    Select select = new Select(element);

    try {
      select.selectByIndex(12);
      fail("Was not meant to pass");
    } catch (NoSuchElementException ignored) {
    }

    try {
      select.selectByValue("not there");
      fail("Was not meant to pass");
    } catch (NoSuchElementException ignored) {
    }

    try {
      select.selectByVisibleText("also not there");
      fail("Was not meant to pass");
    } catch (NoSuchElementException ignored) {
    }
  }

  private String escapeQuotes(String text) {
    final WebElement element = mock(WebElement.class);

    when(element.getTagName()).thenReturn("select");
    when(element.getAttribute("multiple")).thenReturn("multiple");

    return new Select(element).escapeQuotes(text);
  }
}
