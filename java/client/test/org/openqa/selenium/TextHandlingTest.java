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

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assume.assumeFalse;
import static org.openqa.selenium.testing.TestUtilities.isFirefox;
import static org.openqa.selenium.testing.drivers.Browser.ALL;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.CHROMIUMEDGE;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.Test;
import org.openqa.selenium.environment.webserver.Page;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.TestUtilities;

public class TextHandlingTest extends JUnit4TestBase {

  private final String newLine = "\n";

  @Test
  public void testShouldReturnTheTextContentOfASingleElementWithNoChildren() {
    driver.get(pages.simpleTestPage);
    String selectText = driver.findElement(By.id("oneline")).getText();
    assertThat(selectText).isEqualTo("A single line of text");

    String getText = driver.findElement(By.id("oneline")).getText();
    assertThat(getText).isEqualTo("A single line of text");
  }

  @Test
  public void testShouldReturnTheEntireTextContentOfChildElements() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("multiline")).getText();

    assertThat(text).contains(
        "A div containing",
        "More than one line of text",
        "and block level elements");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testShouldIgnoreScriptElements() {
    driver.get(pages.javascriptEnhancedForm);
    WebElement labelForUsername = driver.findElement(By.id("labelforusername"));

    assertThat(labelForUsername.findElements(By.tagName("script"))).hasSize(1);
    assertThat(labelForUsername.getText()).isEqualTo("Username:");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testShouldRepresentABlockLevelElementAsANewline() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("multiline")).getText();

    assertThat(text)
        .startsWith("A div containing" + newLine)
        .contains("More than one line of text" + newLine)
        .endsWith("and block level elements");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testShouldCollapseMultipleWhitespaceCharactersIntoASingleSpace() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("lotsofspaces")).getText();

    assertThat(text).isEqualTo("This line has lots of spaces.");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testShouldTrimText() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("multiline")).getText();

    assertThat(text).startsWith("A div containing").endsWith("block level elements");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testShouldConvertANonBreakingSpaceIntoANormalSpaceCharacter() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("nbsp")).getText();

    assertThat(text).isEqualTo("This line has a non-breaking space");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testShouldNotCollapseANonBreakingSpaces() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("nbspandspaces")).getText();

    assertThat(text).isEqualTo("This line has a   non-breaking space and spaces");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testShouldNotTrimNonBreakingSpacesAtTheEndOfALineInTheMiddleOfText() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("multilinenbsp")).getText();

    assertThat(text).startsWith("These lines  \n");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testShouldNotTrimNonBreakingSpacesAtTheStartOfALineInTheMiddleOfText() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("multilinenbsp")).getText();

    assertThat(text).contains("\n  have");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testShouldNotTrimTrailingNonBreakingSpacesInMultilineText() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("multilinenbsp")).getText();

    assertThat(text).endsWith("trailing NBSPs  ");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testHavingInlineElementsShouldNotAffectHowTextIsReturned() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("inline")).getText();

    assertThat(text)
        .isEqualTo("This line has text within elements that are meant to be displayed inline");
  }

  @Test
  public void testShouldReturnTheEntireTextOfInlineElements() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("span")).getText();

    assertThat(text).isEqualTo("An inline element");
  }

  @Test
  public void testShouldRetainTheFormattingOfTextWithinAPreElement() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("preformatted")).getText();

    assertThat(text).isEqualTo("   This section has a preformatted\n" +
                               "    text block    \n" +
                               "  split in four lines\n" +
                               "         ");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testShouldRetainTheFormatingOfTextWithinAPreElementThatIsWithinARegularBlock() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("div-with-pre")).getText();

    assertThat(text).isEqualTo("before pre\n" +
                               "   This section has a preformatted\n" +
                               "    text block    \n" +
                               "  split in four lines\n" +
                               "         \n" +
                               "after pre");
  }

  @Test
  @Ignore(value = IE, reason = "IE: inserts \r\n instead of \n")
  public void testShouldBeAbleToSetMoreThanOneLineOfTextInATextArea() {
    driver.get(pages.formPage);
    WebElement textarea = driver.findElement(By.id("withText"));
    textarea.clear();

    wait.until(WaitingConditions.elementValueToEqual(textarea, ""));

    String expectedText = "i like cheese" + newLine + newLine + "it's really nice";

    textarea.sendKeys(expectedText);

    String seenText = textarea.getAttribute("value");
    assertThat(seenText).isEqualTo(expectedText);
  }

  @Test
  public void testShouldBeAbleToEnterDatesAfterFillingInOtherValuesFirst() {
    driver.get(pages.formPage);
    WebElement input = driver.findElement(By.id("working"));
    String expectedValue = "10/03/2007 to 30/07/1993";
    input.sendKeys(expectedValue);
    String seenValue = input.getAttribute("value");

    assertThat(seenValue).isEqualTo(expectedValue);
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testShouldReturnEmptyStringWhenTextIsOnlySpaces() {
    driver.get(pages.xhtmlTestPage);
    String text = driver.findElement(By.id("spaces")).getText();

    assertThat(text).isEqualTo("");
  }

  @Test
  public void testShouldReturnEmptyStringWhenTextIsEmpty() {
    driver.get(pages.xhtmlTestPage);
    String text = driver.findElement(By.id("empty")).getText();

    assertThat(text).isEqualTo("");
  }

  @Test
  public void testShouldReturnEmptyStringWhenTagIsSelfClosing() {
    assumeFalse("IE version < 9 doesn't support application/xhtml+xml mime type", TestUtilities.isOldIe(driver));

    driver.get(pages.xhtmlFormPage);
    String text = driver.findElement(By.id("self-closed")).getText();

    assertThat(text).isEqualTo("");
  }

  @Test
  public void testShouldNotTrimSpacesWhenLineWraps() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.xpath("//table/tbody/tr[1]/td[1]")).getText();

    assertThat(text).isEqualTo("beforeSpace afterSpace");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testShouldHandleSiblingBlockLevelElements() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("twoblocks")).getText();

    assertThat(text).isEqualTo("Some text" + newLine + "Some more text");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testShouldHandleNestedBlockLevelElements() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("nestedblocks")).getText();

    assertThat(text)
        .isEqualTo("Cheese" + newLine + "Some text" + newLine + "Some more text" + newLine
                   + "and also" + newLine + "Brie");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testShouldHandleWhitespaceInInlineElements() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("inlinespan")).getText();

    assertThat(text).isEqualTo("line has text");
  }

  @Test
  public void testReadALargeAmountOfData() {
    driver.get(pages.macbethPage);
    String source = driver.getPageSource().trim().toLowerCase();

    assertThat(source).endsWith("</html>");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testGetTextWithLineBreakForInlineElement() {
    driver.get(pages.simpleTestPage);

    WebElement label = driver.findElement(By.id("label1"));
    String labelText = label.getText();

    assertThat(labelText).matches("foo[\\n\\r]+bar");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testShouldOnlyIncludeVisibleText() {
    driver.get(pages.javascriptPage);

    String empty = driver.findElement(By.id("suppressedParagraph")).getText();
    String explicit = driver.findElement(By.id("outer")).getText();

    assertThat(empty).isEqualTo("");
    assertThat(explicit).isEqualTo("sub-element that is explicitly visible");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testShouldGetTextFromTableCells() {
    driver.get(pages.tables);

    WebElement tr = driver.findElement(By.id("hidden_text"));
    String text = tr.getText();

    assertThat(text).contains("some text").doesNotContain("some more text");
  }

  @Test
  public void testTextOfAnInputFieldShouldBeEmpty() {
    driver.get(pages.formPage);
    String text = driver.findElement(By.id("inputWithText")).getText();

    assertThat(text).isEqualTo("");
  }

  @Test
  public void testTextOfATextAreaShouldBeEqualToItsDefaultText() {
    driver.get(pages.formPage);
    String text = driver.findElement(By.id("withText")).getText();

    assertThat(text).isEqualTo("Example text");
  }

  @Test
  @Ignore(IE)
  @NotYetImplemented(EDGE)
  public void testTextOfATextAreaShouldBeEqualToItsDefaultTextEvenAfterTyping() {
    driver.get(pages.formPage);
    WebElement area = driver.findElement(By.id("withText"));
    String oldText = area.getText();
    area.sendKeys("New Text");

    assertThat(area.getText()).isEqualTo(oldText);
  }

  @Test
  @Ignore(IE)
  @NotYetImplemented(EDGE)
  public void testTextOfATextAreaShouldBeEqualToItsDefaultTextEvenAfterChangingTheValue() {
    driver.get(pages.formPage);
    WebElement area = driver.findElement(By.id("withText"));
    String oldText = area.getAttribute("value");
    ((JavascriptExecutor) driver).executeScript("arguments[0].value = arguments[1]", area, "New Text");
    assertThat(area.getText()).isEqualTo(oldText);
  }

  @Test
  public void testShouldGetTextWhichIsAValidJSONObject() {
    driver.get(pages.simpleTestPage);
    WebElement element = driver.findElement(By.id("simpleJsonText"));
    assertThat(element.getText()).isEqualTo("{a=\"b\", c=1, d=true}");
  }

  @Test
  public void testShouldGetTextWhichIsAValidComplexJSONObject() {
    driver.get(pages.simpleTestPage);
    WebElement element = driver.findElement(By.id("complexJsonText"));
    assertThat(element.getText()).isEqualTo("{a=\"\\\\b\\\\\\\"\'\\\'\"}");
  }

  @Test
  @NotYetImplemented(HTMLUNIT)
  @NotYetImplemented(SAFARI)
  public void testShouldNotReturnLtrMarks() {
    driver.get(pages.unicodeLtrPage);
    WebElement element = driver.findElement(By.id("EH")).findElement(By.tagName("nobr"));
    String text = element.getText();
    String expected = "Some notes";
    assertThat(text.codePointAt(0)).describedAs("RTL mark should not be present").isNotEqualTo(8206);
    // Note: If this assertion fails but the content of the strings *looks* the same
    // it may be because of hidden unicode LTR character being included in the string.
    // That's the reason for the previous assert.
    assertThat(element.getText()).isEqualTo(expected);
  }

  @Test
  @Ignore(value = ALL, reason = "Not all unicode whitespace characters are trimmed, issue 6072")
  public void testShouldTrimTextWithMultiByteWhitespaces() {
    driver.get(pages.simpleTestPage);
    String text = driver.findElement(By.id("trimmedSpace")).getText();

    assertThat(text).isEqualTo("test");
  }

  @Test
  public void canHandleTextThatLooksLikeANumber() {
    driver.get(appServer.create(new Page()
        .withBody("<div id='point'>12.345</div>",
                  "<div id='comma'>12,345</div>",
                  "<div id='space'>12 345</div>")));

    assertThat(driver.findElement(By.id("point")).getText()).isEqualTo("12.345");
    assertThat(driver.findElement(By.id("comma")).getText()).isEqualTo("12,345");
    assertThat(driver.findElement(By.id("space")).getText()).isEqualTo("12 345");
  }

  @Test
  @NotYetImplemented(value = CHROME, reason = "https://bugs.chromium.org/p/chromedriver/issues/detail?id=2155")
  @NotYetImplemented(value = CHROMIUMEDGE, reason = "https://bugs.chromium.org/p/chromedriver/issues/detail?id=2155")
  @NotYetImplemented(HTMLUNIT)
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  @NotYetImplemented(EDGE)
  public void canHandleTextTransformProperty() {
    driver.get(pages.simpleTestPage);
    assertThat(driver.findElement(By.id("capitalized")).getText())
        .isEqualTo(isFirefox(driver) ? "Hello, World! Bla-bla-BLA" : "Hello, World! Bla-Bla-BLA");
    assertThat(driver.findElement(By.id("lowercased")).getText())
        .isEqualTo("hello, world! bla-bla-bla");
    assertThat(driver.findElement(By.id("uppercased")).getText())
        .isEqualTo("HELLO, WORLD! BLA-BLA-BLA");
  }

}
