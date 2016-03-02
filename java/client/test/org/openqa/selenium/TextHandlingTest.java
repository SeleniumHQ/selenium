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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotSame;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeFalse;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.startsWith;

import org.junit.Test;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.TestUtilities;

import java.util.regex.Pattern;

public class TextHandlingTest extends JUnit4TestBase {

  private final String newLine = "\n";

  @Test
  public void testShouldReturnTheTextContentOfASingleElementWithNoChildren() {
    driver.get(pages.simpleTestPage);
    String selectText = driver.findElement(By.id("oneline")).getText();
    assertThat(selectText, equalTo("A single line of text"));

    String getText = driver.findElement(By.id("oneline")).getText();
    assertThat(getText, equalTo("A single line of text"));
  }

  @Test
  public void testShouldReturnTheEntireTextContentOfChildElements() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("multiline")).getText();

    assertThat(text.contains("A div containing"), is(true));
    assertThat(text.contains("More than one line of text"), is(true));
    assertThat(text.contains("and block level elements"), is(true));
  }

  @Test
  public void testShouldIgnoreScriptElements() {
    driver.get(pages.javascriptEnhancedForm);
    WebElement labelForUsername = driver.findElement(By.id("labelforusername"));
    String text = labelForUsername.getText();

    assertThat(labelForUsername.findElements(By.tagName("script")).size(), is(1));
    assertThat(text, not(containsString("document.getElementById")));
    assertThat(text, is("Username:"));
  }

  @Test
  public void testShouldRepresentABlockLevelElementAsANewline() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("multiline")).getText();

    assertThat(text, startsWith("A div containing" + newLine));
    assertThat(text, containsString("More than one line of text" + newLine));
    assertThat(text, endsWith("and block level elements"));
  }

  @Test
  public void testShouldCollapseMultipleWhitespaceCharactersIntoASingleSpace() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("lotsofspaces")).getText();

    assertThat(text, equalTo("This line has lots of spaces."));
  }

  @Test
  public void testShouldTrimText() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("multiline")).getText();

    assertThat(text, startsWith("A div containing"));
    assertThat(text, endsWith("block level elements"));
  }

  @Test
  public void testShouldConvertANonBreakingSpaceIntoANormalSpaceCharacter() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("nbsp")).getText();

    assertThat(text, equalTo("This line has a non-breaking space"));
  }

  @Test
  public void testShouldNotCollapseANonBreakingSpaces() {
    driver.get(pages.simpleTestPage);
    WebElement element = driver.findElement(By.id("nbspandspaces"));
    String text = element.getText();

    assertThat(text, equalTo("This line has a   non-breaking space and spaces"));
  }

  @Test
  public void testShouldNotTrimNonBreakingSpacesAtTheEndOfALineInTheMiddleOfText() {
    driver.get(pages.simpleTestPage);
    WebElement element = driver.findElement(By.id("multilinenbsp"));
    String text = element.getText();
    assertThat(text, startsWith("These lines  \n"));
  }

  @Test
  public void testShouldNotTrimNonBreakingSpacesAtTheStartOfALineInTheMiddleOfText() {
    driver.get(pages.simpleTestPage);
    WebElement element = driver.findElement(By.id("multilinenbsp"));
    String text = element.getText();
    assertThat(text, containsString("\n  have"));
  }

  @Test
  public void testShouldNotTrimTrailingNonBreakingSpacesInMultilineText() {
    driver.get(pages.simpleTestPage);
    WebElement element = driver.findElement(By.id("multilinenbsp"));
    String text = element.getText();
    assertThat(text, endsWith("trailing NBSPs  "));
  }

  @Test
  public void testHavingInlineElementsShouldNotAffectHowTextIsReturned() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("inline")).getText();

    assertThat(text,
        equalTo("This line has text within elements that are meant to be displayed inline"));
  }

  @Test
  public void testShouldReturnTheEntireTextOfInlineElements() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("span")).getText();

    assertThat(text, equalTo("An inline element"));
  }

  @Test
  public void testShouldRetainTheFormatingOfTextWithinAPreElement() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("preformatted")).getText();

    assertThat(text, equalTo("   This section has a preformatted\n" +
        "    text block    \n" +
        "  split in four lines\n" +
        "         "));
  }

  @Test
  public void testShouldRetainTheFormatingOfTextWithinAPreElementThatIsWithinARegularBlock() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("div-with-pre")).getText();
    assertThat(text, equalTo("before pre\n" +
        "   This section has a preformatted\n" +
        "    text block    \n" +
        "  split in four lines\n" +
        "         \n" +
        "after pre"));
  }

  @Ignore(value = {IE}, reason = "IE: inserts \r\n instead of \n")
  @Test
  public void testShouldBeAbleToSetMoreThanOneLineOfTextInATextArea() {
    driver.get(pages.formPage);
    WebElement textarea = driver.findElement(By.id("withText"));
    textarea.clear();

    wait.until(WaitingConditions.elementValueToEqual(textarea, ""));

    String expectedText = "i like cheese" + newLine + newLine + "it's really nice";

    textarea.sendKeys(expectedText);

    String seenText = textarea.getAttribute("value");
    assertThat(seenText, equalTo(expectedText));
  }

  @Test
  public void testShouldBeAbleToEnterDatesAfterFillingInOtherValuesFirst() {
    driver.get(pages.formPage);
    WebElement input = driver.findElement(By.id("working"));
    String expectedValue = "10/03/2007 to 30/07/1993";
    input.sendKeys(expectedValue);
    String seenValue = input.getAttribute("value");

    assertThat(seenValue, equalTo(expectedValue));
  }

  @Test
  public void testShouldReturnEmptyStringWhenTextIsOnlySpaces() {
    driver.get(pages.xhtmlTestPage);

    String text = driver.findElement(By.id("spaces")).getText();
    assertThat(text, equalTo(""));
  }

  @Test
  public void testShouldReturnEmptyStringWhenTextIsEmpty() {
    driver.get(pages.xhtmlTestPage);

    String text = driver.findElement(By.id("empty")).getText();
    assertThat(text, equalTo(""));
  }

  @Test
  public void testShouldReturnEmptyStringWhenTagIsSelfClosing() {
    assumeFalse("IE version < 9 doesn't support application/xhtml+xml mime type", TestUtilities.isOldIe(driver));

    driver.get(pages.xhtmlFormPage);

    String text = driver.findElement(By.id("self-closed")).getText();
    assertThat(text, equalTo(""));
  }

  @Test
  public void testShouldNotTrimSpacesWhenLineWraps() {
    driver.get(pages.simpleTestPage);

    String text = driver.findElement(By.xpath("//table/tbody/tr[1]/td[1]")).getText();
    assertThat(text, equalTo("beforeSpace afterSpace"));
  }

  @Test
  public void testShouldHandleSiblingBlockLevelElements() {
    driver.get(pages.simpleTestPage);

    String text = driver.findElement(By.id("twoblocks")).getText();

    assertThat(text, is("Some text" + newLine + "Some more text"));
  }

  @NotYetImplemented(HTMLUNIT)
  @Test
  public void testShouldHandleNestedBlockLevelElements() {
    driver.get(pages.simpleTestPage);

    String text = driver.findElement(By.id("nestedblocks")).getText();

    assertThat(text, is("Cheese" + newLine + "Some text" + newLine + "Some more text" + newLine
        + "and also" + newLine + "Brie"));
  }

  @Test
  public void testShouldHandleWhitespaceInInlineElements() {
    driver.get(pages.simpleTestPage);

    String text = driver.findElement(By.id("inlinespan")).getText();

    assertThat(text, is("line has text"));
  }

  @Test
  public void testReadALargeAmountOfData() {
    driver.get(pages.macbethPage);
    String source = driver.getPageSource().trim().toLowerCase();

    assertThat(source.endsWith("</html>"), is(true));
  }

  @Test
  public void testGetTextWithLineBreakForInlineElement() {
    driver.get(pages.simpleTestPage);

    WebElement label = driver.findElement(By.id("label1"));
    String labelText = label.getText();

    assertThat(labelText, matchesPattern("foo[\\n\\r]+bar"));
  }

  private Matcher<String> matchesPattern(String javaRegex) {
    final Pattern pattern = Pattern.compile(javaRegex);

    return new TypeSafeMatcher<String>() {
      @Override
      public boolean matchesSafely(String s) {
        return pattern.matcher(s).matches();
      }

      public void describeTo(Description description) {
        description.appendText("a string matching the pattern " + pattern);
      }
    };
  }

  @JavascriptEnabled
  @Test
  public void testShouldOnlyIncludeVisibleText() {
    driver.get(pages.javascriptPage);

    String empty = driver.findElement(By.id("suppressedParagraph")).getText();
    String explicit = driver.findElement(By.id("outer")).getText();

    assertEquals("", empty);
    assertEquals("sub-element that is explicitly visible", explicit);
  }

  @Test
  public void testShouldGetTextFromTableCells() {
    driver.get(pages.tables);

    WebElement tr = driver.findElement(By.id("hidden_text"));
    String text = tr.getText();

    assertTrue(text.contains("some text"));
    assertFalse(text.contains("some more text"));
  }

  @Test
  public void testTextOfAnInputFieldShouldBeEmpty() {
    driver.get(pages.formPage);
    WebElement input = driver.findElement(By.id("inputWithText"));
    assertEquals("", input.getText());
  }

  @Test
  public void testTextOfATextAreaShouldBeEqualToItsDefaultText() {
    driver.get(pages.formPage);
    WebElement area = driver.findElement(By.id("withText"));
    assertEquals("Example text", area.getText());
  }

  @Test
  @Ignore(value = {IE})
  @NotYetImplemented(HTMLUNIT)
  public void testTextOfATextAreaShouldBeEqualToItsDefaultTextEvenAfterTyping() {
    driver.get(pages.formPage);
    WebElement area = driver.findElement(By.id("withText"));
    String oldText = area.getText();
    area.sendKeys("New Text");
    assertEquals(oldText, area.getText());
  }

  @Test
  @JavascriptEnabled
  @Ignore(value = {IE})
  @NotYetImplemented(HTMLUNIT)
  public void testTextOfATextAreaShouldBeEqualToItsDefaultTextEvenAfterChangingTheValue() {
    driver.get(pages.formPage);
    WebElement area = driver.findElement(By.id("withText"));
    String oldText = area.getAttribute("value");
    ((JavascriptExecutor) driver).executeScript("arguments[0].value = arguments[1]", area, "New Text");
    assertEquals(oldText, area.getText());
  }

  @Test
  public void testShouldGetTextWhichIsAValidJSONObject() {
    driver.get(pages.simpleTestPage);
    WebElement element = driver.findElement(By.id("simpleJsonText"));
    assertEquals("{a=\"b\", c=1, d=true}", element.getText());
    // assertEquals("{a=\"b\", \"c\"=d, e=true, f=\\123\\\\g\\\\\"\"\"\\\'}", element.getText());
  }

  @Test
  public void testShouldGetTextWhichIsAValidComplexJSONObject() {
    driver.get(pages.simpleTestPage);
    WebElement element = driver.findElement(By.id("complexJsonText"));
    assertEquals("{a=\"\\\\b\\\\\\\"\'\\\'\"}", element.getText());
  }

  @Test
  @Ignore(reason = "Hidden LTR Unicode marks are currently returned by WebDriver but shouldn't.",
    issues = {4473})
  public void testShouldNotReturnLtrMarks() {
    driver.get(pages.unicodeLtrPage);
    WebElement element = driver.findElement(By.id("EH")).findElement(By.tagName("nobr"));
    String text = element.getText();
    String expected = "Some notes";
    assertNotSame("RTL mark should not be present", text.codePointAt(0), 8206);
    // Note: If this assertion fails but the content of the strings *looks* the same
    // it may be because of hidden unicode LTR character being included in the string.
    // That's the reason for the previous assert.
    assertEquals(expected, element.getText());
  }

  @Test
  @Ignore(reason = "Not all unicode whitespace characters are trimmed", issues = {6072})
  public void testShouldTrimTextWithMultiByteWhitespaces() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("trimmedSpace")).getText();

    assertEquals("test", text);
  }

}
