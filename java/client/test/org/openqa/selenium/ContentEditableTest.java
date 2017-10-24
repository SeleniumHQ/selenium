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

import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assume.assumeFalse;
import static org.openqa.selenium.testing.Driver.CHROME;
import static org.openqa.selenium.testing.Driver.EDGE;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.SAFARI;
import static org.openqa.selenium.testing.TestUtilities.getEffectivePlatform;
import static org.openqa.selenium.testing.TestUtilities.isFirefox;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NotYetImplemented;

public class ContentEditableTest extends JUnit4TestBase {

  @After
  public void switchToDefaultContent() {
    driver.switchTo().defaultContent();
  }

  @Test
  @Ignore(value = SAFARI, reason = "cannot type on contentEditable with synthetic events")
  @NotYetImplemented(value = MARIONETTE)
  public void testTypingIntoAnIFrameWithContentEditableOrDesignModeSet() {
    driver.get(pages.richTextPage);

    driver.switchTo().frame("editFrame");
    WebElement element = driver.switchTo().activeElement();
    element.sendKeys("Fishy");

    driver.switchTo().defaultContent();
    WebElement trusted = driver.findElement(By.id("istrusted"));
    WebElement id = driver.findElement(By.id("tagId"));

    assertThat(trusted.getText(), anyOf(
        equalTo("[true]"),
        // Chrome does not set a trusted flag.
        equalTo("[n/a]"),
        equalTo("[]")));
    assertThat(id.getText(), anyOf(equalTo("[frameHtml]"), equalTo("[theBody]")));
  }

  @Test
  @NotYetImplemented(value = MARIONETTE)
  public void testNonPrintableCharactersShouldWorkWithContentEditableOrDesignModeSet() {
    assumeFalse("FIXME: Fails in Firefox on Linux with synthesized events",
                isFirefox(driver) &&
                (getEffectivePlatform().is(Platform.LINUX) || getEffectivePlatform().is(Platform.MAC)));

    driver.get(pages.richTextPage);

    driver.switchTo().frame("editFrame");
    WebElement element = driver.switchTo().activeElement();
    element.sendKeys("Dishy", Keys.BACK_SPACE, Keys.LEFT, Keys.LEFT);
    element.sendKeys(Keys.LEFT, Keys.LEFT, "F", Keys.DELETE, Keys.END, "ee!");

    assertEquals("Fishee!", element.getText());
  }

  @Test
  @Ignore(value = SAFARI, reason = "cannot type on contentEditable with synthetic events, issue 3127")
  public void testShouldBeAbleToTypeIntoEmptyContentEditableElement() {
    driver.get(pages.readOnlyPage);
    WebElement editable = driver.findElement(By.id("content-editable-blank"));

    editable.sendKeys("cheese");

    assertThat(editable.getText(), equalTo("cheese"));
  }

  @Test
  @Ignore(CHROME)
  @Ignore(IE)
  @Ignore(SAFARI)
  @NotYetImplemented(value = MARIONETTE, reason = "https://github.com/mozilla/geckodriver/issues/667")
  public void testShouldBeAbleToTypeIntoContentEditableElementWithExistingValue() {
    driver.get(pages.readOnlyPage);
    WebElement editable = driver.findElement(By.id("content-editable"));

    String initialText = editable.getText();
    editable.sendKeys(", edited");

    assertThat(editable.getText(), equalTo(initialText + ", edited"));
  }

  @Test
  @Ignore(IE)
  @Ignore(value = SAFARI, reason = "cannot type on contentEditable with synthetic events, issue 3127")
  public void testShouldBeAbleToTypeIntoTinyMCE() {
    driver.get(appServer.whereIs("tinymce.html"));
    driver.switchTo().frame("mce_0_ifr");

    WebElement editable = driver.findElement(By.id("tinymce"));

    editable.clear();
    editable.sendKeys("cheese"); // requires focus on OS X

    assertThat(editable.getText(), equalTo("cheese"));
  }

  @Test
  @Ignore(CHROME)
  @Ignore(IE)
  @Ignore(value = SAFARI, reason = "cannot type on contentEditable with synthetic events, issue 3127")
  @NotYetImplemented(value = MARIONETTE, reason = "https://github.com/mozilla/geckodriver/issues/667")
  public void testShouldAppendToTinyMCE() {
    driver.get(appServer.whereIs("tinymce.html"));
    driver.switchTo().frame("mce_0_ifr");

    WebElement editable = driver.findElement(By.id("tinymce"));

    editable.sendKeys(" and cheese"); // requires focus on OS X

    assertThat(editable.getText(), equalTo("Initial content and cheese"));
  }

  @Test
  @NotYetImplemented(value = CHROME, reason = "Prepends text")
  @NotYetImplemented(value = EDGE)
  @NotYetImplemented(IE)
  @NotYetImplemented(value = MARIONETTE, reason = "Doesn't write anything")
  @NotYetImplemented(value = SAFARI, reason = "Prepends text")
  public void appendsTextToEndOfContentEditableWithMultipleTextNodes() {
    driver.get(appServer.whereIs("content-editable.html"));
    WebElement input = driver.findElement(By.id("editable"));
    input.sendKeys(", world!");
    System.out.println("input.getText() = " + input.getText());
    assertEquals("Why hello, world!", input.getText());
  }

}
