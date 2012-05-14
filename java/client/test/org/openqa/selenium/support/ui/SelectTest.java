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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.openqa.selenium.By;
import org.openqa.selenium.testing.MockTestBase;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;

import org.jmock.Expectations;
import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class SelectTest extends MockTestBase {
  @Test
  public void shouldThrowAnExceptionIfTheElementIsNotASelectElement() {
    final WebElement element = mock(WebElement.class);

    checking(new Expectations() {{
      exactly(1).of(element).getTagName();
      will(returnValue("a"));
    }});

    try {
      new Select(element);
      fail("Should not have passed");
    } catch (UnexpectedTagNameException e) {
      // This is expected
    }
  }

  private Select selectElementWithMultipleEqualTo(final String value) {
    final WebElement element = mock(WebElement.class);

    checking(new Expectations() {{
      allowing(element).getTagName();
      will(returnValue("select"));
      exactly(1).of(element).getAttribute("multiple");
      will(returnValue(value));
    }});

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

    checking(new Expectations() {{
      allowing(element).getTagName();
      will(returnValue("select"));
      allowing(element).getAttribute("multiple");
      will(returnValue("multiple"));
      exactly(1).of(element).findElements(By.tagName("option"));
      will(returnValue(options));
    }});

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

    checking(new Expectations() {{
      allowing(element).getTagName();
      will(returnValue("select"));
      allowing(element).getAttribute("multiple");
      will(returnValue("multiple"));
      exactly(1).of(element).findElements(By.tagName("option"));
      will(returnValue(options));
      exactly(1).of(optionBad).isSelected();
      will(returnValue(false));
      exactly(1).of(optionGood).isSelected();
      will(returnValue(true));
    }});

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

    checking(new Expectations() {{
      allowing(element).getTagName();
      will(returnValue("select"));
      allowing(element).getAttribute("multiple");
      will(returnValue("multiple"));
      exactly(1).of(element).findElements(By.tagName("option"));
      will(returnValue(options));
      exactly(1).of(firstOption).isSelected();
      will(returnValue(true));
      never(secondOption).isSelected();
      will(returnValue(true));
    }});

    Select select = new Select(element);
    WebElement firstSelected = select.getFirstSelectedOption();

    assertSame(firstOption, firstSelected);
  }

  @Test
  public void shouldThrowANoSuchElementExceptionIfNothingIsSelected() {
    final WebElement element = mock(WebElement.class);
    final WebElement firstOption = mock(WebElement.class, "first");
    final List<WebElement> options = Arrays.asList(firstOption);

    checking(new Expectations() {{
      allowing(element).getTagName();
      will(returnValue("select"));
      allowing(element).getAttribute("multiple");
      will(returnValue("multiple"));
      exactly(1).of(element).findElements(By.tagName("option"));
      will(returnValue(options));
      exactly(1).of(firstOption).isSelected();
      will(returnValue(false));
    }});

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

    checking(new Expectations() {{
      allowing(element).getTagName();
      will(returnValue("select"));
      allowing(element).getAttribute("multiple");
      will(returnValue("multiple"));
      exactly(1).of(element).findElements(By.xpath(".//option[normalize-space(.) = \"fish\"]"));
      will(returnValue(options));
      exactly(1).of(firstOption).isSelected();
      will(returnValue(false));
      exactly(1).of(firstOption).click();
    }});

    Select select = new Select(element);
    select.selectByVisibleText("fish");
  }

  @Test
  public void shouldAllowOptionsToBeSelectedByIndex() {
    final WebElement element = mock(WebElement.class);
    final WebElement firstOption = mock(WebElement.class, "first");
    final WebElement secondOption = mock(WebElement.class, "second");
    final List<WebElement> options = Arrays.asList(firstOption, secondOption);

    checking(new Expectations() {{
      allowing(element).getTagName();
      will(returnValue("select"));
      allowing(element).getAttribute("multiple");
      will(returnValue("multiple"));
      exactly(1).of(element).findElements(By.tagName("option"));
      will(returnValue(options));
      exactly(1).of(firstOption).getAttribute("index");
      will(returnValue("0"));
      allowing(firstOption).isSelected();
      will(returnValue(true));
      never(firstOption).click();
      exactly(1).of(secondOption).getAttribute("index");
      will(returnValue("1"));
      allowing(secondOption).isSelected();
      will(returnValue(false));
      exactly(1).of(secondOption).click();
    }});

    Select select = new Select(element);
    select.selectByIndex(1);
  }

  @Test
  public void shouldAllowOptionsToBeSelectedByReturnedValue() {
    final WebElement element = mock(WebElement.class);
    final WebElement firstOption = mock(WebElement.class, "first");
    final List<WebElement> options = Arrays.asList(firstOption);

    checking(new Expectations() {{
      allowing(element).getTagName();
      will(returnValue("select"));
      allowing(element).getAttribute("multiple");
      will(returnValue("multiple"));
      exactly(1).of(element).findElements(By.xpath(".//option[@value = \"b\"]"));
      will(returnValue(options));
      exactly(1).of(firstOption).isSelected();
      will(returnValue(false));
      exactly(1).of(firstOption).click();
    }});

    Select select = new Select(element);
    select.selectByValue("b");
  }

  @Test
  public void shouldAllowUserToDeselectAllWhenSelectSupportsMultipleSelections() {
    final WebElement element = mock(WebElement.class);
    final WebElement firstOption = mock(WebElement.class, "first");
    final WebElement secondOption = mock(WebElement.class, "second");
    final List<WebElement> options = Arrays.asList(firstOption, secondOption);

    checking(new Expectations() {{
      allowing(element).getTagName();
      will(returnValue("select"));
      allowing(element).getAttribute("multiple");
      will(returnValue("multiple"));
      allowing(element).getAttribute("multiple");
      will(returnValue("multiple"));
      exactly(1).of(element).findElements(By.tagName("option"));
      will(returnValue(options));
      exactly(1).of(firstOption).isSelected();
      will(returnValue(true));
      exactly(1).of(firstOption).click();
      exactly(1).of(secondOption).isSelected();
      will(returnValue(false));
      never(secondOption).click();
    }});

    Select select = new Select(element);
    select.deselectAll();
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

    checking(new Expectations() {{
      allowing(element).getTagName();
      will(returnValue("select"));
      allowing(element).getAttribute("multiple");
      will(returnValue("multiple"));
      exactly(1).of(element).findElements(By.xpath(".//option[normalize-space(.) = \"b\"]"));
      will(returnValue(options));
      exactly(1).of(firstOption).isSelected();
      will(returnValue(true));
      exactly(1).of(firstOption).click();
      exactly(1).of(secondOption).isSelected();
      will(returnValue(false));
      never(secondOption).click();
    }});

    Select select = new Select(element);
    select.deselectByVisibleText("b");
  }

  @Test
  public void shouldAllowOptionsToBeDeselectedByIndex() {
    final WebElement element = mock(WebElement.class);
    final WebElement firstOption = mock(WebElement.class, "first");
    final WebElement secondOption = mock(WebElement.class, "second");
    final List<WebElement> options = Arrays.asList(firstOption, secondOption);

    checking(new Expectations() {{
      allowing(element).getTagName();
      will(returnValue("select"));
      allowing(element).getAttribute("multiple");
      will(returnValue("multiple"));
      exactly(1).of(element).findElements(By.tagName("option"));
      will(returnValue(options));
      exactly(1).of(firstOption).getAttribute("index");
      will(returnValue("2"));
      exactly(1).of(firstOption).isSelected();
      will(returnValue(true));
      exactly(1).of(firstOption).click();
      exactly(1).of(secondOption).getAttribute("index");
      will(returnValue("1"));
      never(secondOption).click();
    }});

    Select select = new Select(element);
    select.deselectByIndex(2);
  }

  @Test
  public void shouldAllowOptionsToBeDeselectedByReturnedValue() {
    final WebElement element = mock(WebElement.class);
    final WebElement firstOption = mock(WebElement.class, "first");
    final WebElement secondOption = mock(WebElement.class, "third");
    final List<WebElement> options = Arrays.asList(firstOption, secondOption);

    checking(new Expectations() {{
      allowing(element).getTagName();
      will(returnValue("select"));
      allowing(element).getAttribute("multiple");
      will(returnValue("multiple"));
      exactly(1).of(element).findElements(By.xpath(".//option[@value = \"b\"]"));
      will(returnValue(options));
      exactly(1).of(firstOption).isSelected();
      will(returnValue(true));
      exactly(1).of(firstOption).click();
      exactly(1).of(secondOption).isSelected();
      will(returnValue(false));
      never(secondOption).click();
    }});

    Select select = new Select(element);
    select.deselectByValue("b");
  }

  @Test
  public void shouldConvertAnUnquotedStringIntoOneWithQuotes() {
    final WebElement element = mock(WebElement.class);

    checking(new Expectations() {{
      allowing(element).getTagName();
      will(returnValue("select"));
      allowing(element).getAttribute("multiple");
      will(returnValue("multiple"));
    }});

    Select select = new Select(element);
    String result = select.escapeQuotes("foo");

    assertEquals("\"foo\"", result);
  }

  @Test
  public void shouldConvertAStringWithATickIntoOneWithQuotes() {
    final WebElement element = mock(WebElement.class);

    checking(new Expectations() {{
      allowing(element).getTagName();
      will(returnValue("select"));
      allowing(element).getAttribute("multiple");
      will(returnValue("multiple"));
    }});

    Select select = new Select(element);
    String result = select.escapeQuotes("f'oo");

    assertEquals("\"f'oo\"", result);
  }

  @Test
  public void shouldConvertAStringWithAQuotIntoOneWithTicks() {
    final WebElement element = mock(WebElement.class);

    checking(new Expectations() {{
      allowing(element).getTagName();
      will(returnValue("select"));
      allowing(element).getAttribute("multiple");
      will(returnValue("multiple"));
    }});

    Select select = new Select(element);
    String result = select.escapeQuotes("f\"oo");

    assertEquals("'f\"oo'", result);
  }

  @Test
  public void shouldProvideConcatenatedStringsWhenStringToEscapeContainsTicksAndQuotes() {
    final WebElement element = mock(WebElement.class);

    checking(new Expectations() {{
      allowing(element).getTagName();
      will(returnValue("select"));
      allowing(element).getAttribute("multiple");
      will(returnValue("multiple"));
    }});

    Select select = new Select(element);
    String result = select.escapeQuotes("f\"o'o");

    assertEquals("concat(\"f\", '\"', \"o'o\")", result);
  }

  /**
   * Tests that escapeQuotes returns concatenated strings when the given
   * string contains a tick and and ends with a quote.
   */
  @Test
  public void shouldProvideConcatenatedStringsWhenStringEndsWithQuote() {
    final WebElement element = mock(WebElement.class);

    checking(new Expectations() {{
      allowing(element).getTagName();
      will(returnValue("select"));
      allowing(element).getAttribute("multiple");
      will(returnValue("multiple"));
    }});

    Select select = new Select(element);
    String result = select.escapeQuotes("'\"");

    assertEquals("concat(\"'\", '\"')", result);
  }

  @Test
  public void shouldFallBackToSlowLooksUpsWhenGetByVisibleTextFailsAndThereIsASpace() {
    final WebElement element = mock(WebElement.class);
    final WebElement firstOption = mock(WebElement.class, "first");
    final By xpath1 = By.xpath(".//option[normalize-space(.) = \"foo bar\"]");
    final By xpath2 = By.xpath(".//option[contains(., \"foo\")]");

    checking(new Expectations() {{
      allowing(element).getTagName();
      will(returnValue("select"));
      allowing(element).getAttribute("multiple");
      will(returnValue("false"));
      one(element).findElements(xpath1);
      will(returnValue(Collections.EMPTY_LIST));
      one(element).findElements(xpath2);
      will(returnValue(Collections.singletonList(firstOption)));
      one(firstOption).getText();
      will(returnValue("foo bar"));
      one(firstOption).isSelected();
      will(returnValue(false));
      one(firstOption).click();
    }});

    Select select = new Select(element);
    select.selectByVisibleText("foo bar");
  }

  @Test
  public void shouldIndicateWhetherASelectIsMultipleCorrectly() {
    final WebElement element1 = mock(WebElement.class, "false1");
    final WebElement element2 = mock(WebElement.class, "false2");
    final WebElement element3 = mock(WebElement.class, "true1");
    final WebElement element4 = mock(WebElement.class, "true2");

    checking(new Expectations() {{
      allowing(element1).getTagName();
      will(returnValue("select"));
      allowing(element1).getAttribute("multiple");
      will(returnValue("false"));

      allowing(element2).getTagName();
      will(returnValue("select"));
      allowing(element2).getAttribute("multiple");
      will(returnValue(null));

      allowing(element3).getTagName();
      will(returnValue("select"));
      allowing(element3).getAttribute("multiple");
      will(returnValue("true"));

      allowing(element4).getTagName();
      will(returnValue("select"));
      allowing(element4).getAttribute("multiple");
      will(returnValue("multiple"));
    }});

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

    checking(new Expectations() {{
      allowing(element).getTagName();
      will(returnValue("select"));
      allowing(element).getAttribute("multiple");
      will(returnValue("false"));
      allowing(element).findElements(with(Expectations.<By>anything()));
      will(returnValue(Collections.<Object>emptyList()));
    }});

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
}
