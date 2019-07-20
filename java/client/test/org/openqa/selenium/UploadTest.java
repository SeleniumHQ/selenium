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
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.junit.Assume.assumeFalse;
import static org.openqa.selenium.Platform.ANDROID;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.support.ui.ExpectedConditions.not;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.CHROMIUMEDGE;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SwitchToTopAfterTest;
import org.openqa.selenium.testing.TestUtilities;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;


/**
 * Demonstrates how to use WebDriver with a file input element.
 */
public class UploadTest extends JUnit4TestBase {

  private static final String LOREM_IPSUM_TEXT = "lorem ipsum dolor sit amet";
  private static final String FILE_HTML = "<div>" + LOREM_IPSUM_TEXT + "</div>";

  private File testFile;

  @Before
  public void setUp() throws Exception {
    testFile = createTmpFile(FILE_HTML);
  }

  @SwitchToTopAfterTest
  @Test
  @NotYetImplemented(value = SAFARI, reason = "Returns wrong text of the frame body")
  public void testFileUploading() {
    assumeFalse(
        "This test as written assumes a file on local disk is accessible to the browser. "
        + "That is not true for browsers on mobile platforms.",
        TestUtilities.getEffectivePlatform(driver).is(ANDROID));
    driver.get(pages.uploadPage);
    driver.findElement(By.id("upload")).sendKeys(testFile.getAbsolutePath());
    driver.findElement(By.id("go")).click();

    // Uploading files across a network may take a while, even if they're really small
    WebElement label = driver.findElement(By.id("upload_label"));
    wait.until(not(visibilityOf(label)));

    driver.switchTo().frame("upload_target");

    WebElement body = driver.findElement(By.xpath("//body"));
    wait.until(elementTextToEqual(body, LOREM_IPSUM_TEXT));
  }

  @Test
  public void testCleanFileInput() {
    driver.get(pages.uploadPage);
    WebElement element = driver.findElement(By.id("upload"));
    element.sendKeys(testFile.getAbsolutePath());
    element.clear();
    assertThat(element.getAttribute("value")).isEqualTo("");
  }

  @Test
  @Ignore(CHROME)
  @Ignore(CHROMIUMEDGE)
  @Ignore(HTMLUNIT)
  public void testClickFileInput() {
    driver.get(pages.uploadPage);
    WebElement element = driver.findElement(By.id("upload"));
    assertThatExceptionOfType(InvalidArgumentException.class).isThrownBy(element::click);
  }

  @Test
  @Ignore(value = SAFARI, reason = "Hangs forever in sendKeys")
  public void testUploadingWithHiddenFileInput() {
    driver.get(appServer.whereIs("upload_hidden.html"));
    driver.findElement(By.id("upload")).sendKeys(testFile.getAbsolutePath());
    driver.findElement(By.id("go")).click();

    // Uploading files across a network may take a while, even if they're really small
    WebElement label = driver.findElement(By.id("upload_label"));
    wait.until(not(visibilityOf(label)));

    driver.switchTo().frame("upload_target");

    WebElement body = driver.findElement(By.xpath("//body"));
    wait.until(elementTextToEqual(body, LOREM_IPSUM_TEXT));
  }

  @Test
  @Ignore(value = SAFARI, reason = "Hangs forever in sendKeys")
  @Ignore(HTMLUNIT)
  @NotYetImplemented(EDGE)
  @NeedsFreshDriver
  public void testUploadingWithInvisibleFileInput() {
    driver.get(appServer.whereIs("upload_invisible.html"));
    driver.findElement(By.id("upload")).sendKeys(testFile.getAbsolutePath());
    driver.findElement(By.id("go")).click();

    // Uploading files across a network may take a while, even if they're really small
    WebElement label = driver.findElement(By.id("upload_label"));
    wait.until(not(visibilityOf(label)));

    driver.switchTo().frame("upload_target");

    WebElement body = driver.findElement(By.xpath("//body"));
    wait.until(elementTextToEqual(body, LOREM_IPSUM_TEXT));
  }

  @Test
  @Ignore(FIREFOX)
  @Ignore(HTMLUNIT)
  @NotYetImplemented(EDGE)
  @NoDriverBeforeTest
  @NoDriverAfterTest
  public void testUploadingWithInvisibleFileInputWhenStrictFileInteractabilityIsOn() {
    createNewDriver(new ImmutableCapabilities(CapabilityType.STRICT_FILE_INTERACTABILITY, true));

    driver.get(appServer.whereIs("upload_invisible.html"));
    WebElement input = driver.findElement(By.id("upload"));
    System.out.println(input.isDisplayed());

    assertThatExceptionOfType(ElementNotInteractableException.class).isThrownBy(
        () -> input.sendKeys(testFile.getAbsolutePath()));
  }

  private File createTmpFile(String content) throws IOException {
    File f = File.createTempFile("webdriver", "tmp");
    f.deleteOnExit();
    Files.write(f.toPath(), content.getBytes(StandardCharsets.UTF_8));
    return f;
  }
}
