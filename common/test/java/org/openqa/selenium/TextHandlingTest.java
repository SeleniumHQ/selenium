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

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.startsWith;
import org.hamcrest.TypeSafeMatcher;

import static org.junit.Assert.assertEquals;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;
import org.openqa.selenium.environment.GlobalTestEnvironment;

import java.util.regex.Pattern;

public class TextHandlingTest extends AbstractDriverTestCase {

  private String newLine;

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    newLine = "\n";
  }

  public void testShouldReturnTheTextContentOfASingleElementWithNoChildren() {
    driver.get(pages.simpleTestPage);
    String selectText = driver.findElement(By.id("oneline")).getText();
    assertThat(selectText, equalTo("A single line of text"));

    String getText = driver.findElement(By.id("oneline")).getText();
    assertThat(getText, equalTo("A single line of text"));
  }

  public void testShouldReturnTheEntireTextContentOfChildElements() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("multiline")).getText();

    assertThat(text.contains("A div containing"), is(true));
    assertThat(text.contains("More than one line of text"), is(true));
    assertThat(text.contains("and block level elements"), is(true));
  }

  @Ignore(SELENESE)
  public void testShouldIgnoreScriptElements() {
    driver.get(pages.javascriptEnhancedForm);
    WebElement labelForUsername = driver.findElement(By.id("labelforusername"));
    String text = labelForUsername.getText();

    assertThat(labelForUsername.findElements(By.tagName("script")).size(), is(1));
    assertThat(text, not(containsString("document.getElementById")));
    assertThat(text, is("Username:"));
  }

  public void testShouldRepresentABlockLevelElementAsANewline() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("multiline")).getText();

    assertThat(text, startsWith("A div containing" + newLine));
    assertThat(text, containsString("More than one line of text" + newLine));
    assertThat(text, endsWith("and block level elements"));
  }

  public void testShouldCollapseMultipleWhitespaceCharactersIntoASingleSpace() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("lotsofspaces")).getText();

    assertThat(text, equalTo("This line has lots of spaces."));
  }

  public void testShouldTrimText() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("multiline")).getText();

    assertThat(text, startsWith("A div containing"));
    assertThat(text, endsWith("block level elements"));
  }

  public void testShouldConvertANonBreakingSpaceIntoANormalSpaceCharacter() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("nbsp")).getText();

    assertThat(text, equalTo("This line has a non-breaking space"));
  }

  @Ignore({IPHONE, SELENESE})
  public void testShouldTreatANonBreakingSpaceAsAnyOtherWhitespaceCharacterWhenCollapsingWhitespace() {
    driver.get(pages.simpleTestPage);
    WebElement element = driver.findElement(By.id("nbspandspaces"));
    String text = element.getText();

    assertThat(text, equalTo("This line has a non-breaking space and spaces"));
  }

  @Ignore(IPHONE)
  public void testHavingInlineElementsShouldNotAffectHowTextIsReturned() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("inline")).getText();

    assertThat(text,
               equalTo("This line has text within elements that are meant to be displayed inline"));
  }

  public void testShouldReturnTheEntireTextOfInlineElements() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("span")).getText();

    assertThat(text, equalTo("An inline element"));
  }

//    public void testShouldRetainTheFormatingOfTextWithinAPreElement() {
//        driver.get(simpleTestPage);
//        String text = driver.findElement(By.id("preformatted")).getText();
//
//        assertThat(text, equalTo("This section has a\npreformatted\n   text block\n" +
//                "  within in\n" +
//                "        "));
//    }

  @Ignore(value = {SELENESE, IPHONE}, reason = "iPhone: sendKeys is broken")
  public void testShouldBeAbleToSetMoreThanOneLineOfTextInATextArea() {
    driver.get(pages.formPage);
    WebElement textarea = driver.findElement(By.id("withText"));
    textarea.clear();
    String expectedText = "I like cheese" + newLine + newLine + "It's really nice";
    textarea.sendKeys(expectedText);

    String seenText = textarea.getValue();
    assertThat(seenText, equalTo(expectedText));
  }

  @Ignore(SELENESE)
  public void testShouldBeAbleToEnterDatesAfterFillingInOtherValuesFirst() {
    driver.get(pages.formPage);
    WebElement input = driver.findElement(By.id("working"));
    String expectedValue = "10/03/2007 to 30/07/1993";
    input.sendKeys(expectedValue);
    String seenValue = input.getValue();

    assertThat(seenValue, equalTo(expectedValue));
  }

  public void testShouldReturnEmptyStringWhenTextIsOnlySpaces() {
    driver.get(pages.xhtmlTestPage);

    String text = driver.findElement(By.id("spaces")).getText();
    assertThat(text, equalTo(""));
  }

  public void testShouldReturnEmptyStringWhenTextIsEmpty() {
    driver.get(pages.xhtmlTestPage);

    String text = driver.findElement(By.id("empty")).getText();
    assertThat(text, equalTo(""));
  }

  public void testShouldReturnEmptyStringWhenTagIsSelfClosing() {
    driver.get(pages.xhtmlTestPage);

    String text = driver.findElement(By.id("self-closed")).getText();
    assertThat(text, equalTo(""));
  }

  public void testShouldHandleSiblingBlockLevelElements() {
    driver.get(pages.simpleTestPage);

    String text = driver.findElement(By.id("twoblocks")).getText();

    assertThat(text, is("Some text" + newLine + "Some more text"));
  }

  @Ignore({FIREFOX, HTMLUNIT, IE, CHROME, SELENESE})
  public void testShouldHandleNestedBlockLevelElements() {
    driver.get(pages.simpleTestPage);

    String text = driver.findElement(By.id("nestedblocks")).getText();

    assertThat(text, is("Cheese" + newLine + "Some text" + newLine + "Some more text" + newLine
                        + "and also" + newLine + "Brie"));
  }

  public void testShouldHandleWhitespaceInInlineElements() {
    driver.get(pages.simpleTestPage);

    String text = driver.findElement(By.id("inlinespan")).getText();

    assertThat(text, is("line has text"));
  }

  @Ignore(value = {SELENESE, IPHONE})
  public void testReadALargeAmountOfData() {
    driver.get(GlobalTestEnvironment.get().getAppServer().whereIs("macbeth.html"));
    String source = driver.getPageSource().trim().toLowerCase();

    assertThat(source.endsWith("</html>"), is(true));
  }

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
  @Ignore({SELENESE, IPHONE})
  public void testShouldOnlyIncludeVisibleText() {
    driver.get(pages.javascriptPage);

    String empty = driver.findElement(By.id("suppressedParagraph")).getText();
    String explicit = driver.findElement(By.id("outer")).getText();

    assertEquals("", empty);
    assertEquals("sub-element that is explicitly visible", explicit);
  }
}
