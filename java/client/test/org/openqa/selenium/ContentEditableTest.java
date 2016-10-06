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
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.SAFARI;
import static org.openqa.selenium.testing.TestUtilities.getEffectivePlatform;
import static org.openqa.selenium.testing.TestUtilities.isFirefox;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.NotYetImplemented;

public class ContentEditableTest extends JUnit4TestBase {

  @After
  public void switchToDefaultContent() {
    driver.switchTo().defaultContent();
  }

  @JavascriptEnabled
  @Ignore(value = {SAFARI, MARIONETTE}, reason = "Safari: cannot type on contentEditable with synthetic events")
  @Test
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

  @JavascriptEnabled
  @NotYetImplemented(HTMLUNIT)
  @Test
  @Ignore({HTMLUNIT, MARIONETTE})
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

  @Ignore(value = {SAFARI, HTMLUNIT}, reason = "Untested browsers;" +
      " Safari: cannot type on contentEditable with synthetic events",
      issues = {3127})
  @Test
  public void testShouldBeAbleToTypeIntoEmptyContentEditableElement() {
    driver.get(pages.readOnlyPage);
    WebElement editable = driver.findElement(By.id("content-editable-blank"));

    editable.sendKeys("cheese");

    assertThat(editable.getText(), equalTo("cheese"));
  }

  @Ignore(value = {CHROME, IE, SAFARI, HTMLUNIT, MARIONETTE})
  @Test
  public void testShouldBeAbleToTypeIntoContentEditableElementWithExistingValue() {
    driver.get(pages.readOnlyPage);
    WebElement editable = driver.findElement(By.id("content-editable"));

    String initialText = editable.getText();
    editable.sendKeys(", edited");

    assertThat(editable.getText(), equalTo(initialText + ", edited"));
  }

  @Ignore(value = {IE, SAFARI, HTMLUNIT, MARIONETTE},
          reason = "Untested browsers;" +
                   " Safari: cannot type on contentEditable with synthetic events",
          issues = {3127})
  @Test
  public void testShouldBeAbleToTypeIntoTinyMCE() {
    driver.get(appServer.whereIs("tinymce.html"));
    driver.switchTo().frame("mce_0_ifr");

    WebElement editable = driver.findElement(By.id("tinymce"));

    editable.clear();
    editable.sendKeys("cheese"); // requires focus on OS X

    assertThat(editable.getText(), equalTo("cheese"));
  }

  @Ignore(value = {CHROME, IE, SAFARI, HTMLUNIT, MARIONETTE},
    reason = "Untested browsers;" +
             " Safari: cannot type on contentEditable with synthetic events",
    issues = {3127})
  @Test
  public void testShouldAppendToTinyMCE() {
    driver.get(appServer.whereIs("tinymce.html"));
    driver.switchTo().frame("mce_0_ifr");

    WebElement editable = driver.findElement(By.id("tinymce"));

    editable.sendKeys(" and cheese"); // requires focus on OS X

    assertThat(editable.getText(), equalTo("Initial content and cheese"));
  }

}
