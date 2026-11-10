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

package org.openqa.selenium.bidi.input;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.support.ui.ExpectedConditions.not;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf;

import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.bidi.module.Input;
import org.openqa.selenium.bidi.script.RemoteReference;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.SwitchToTopAfterTest;

public class SetFilesCommandTest extends JupiterTestBase {
  private static final String LOREM_IPSUM_TEXT = "lorem ipsum dolor sit amet";

  private Input input;

  private String windowHandle;

  @BeforeEach
  public void setUp() {
    windowHandle = driver.getWindowHandle();
    input = new Input(driver);
  }

  @Test
  @NeedsFreshDriver
  void canSetFiles() throws IOException {
    driver.get(pages.formPage);
    WebElement uploadElement = driver.findElement(By.id("upload"));
    assertThat(uploadElement.getAttribute("value")).isEmpty();

    File file = File.createTempFile("test", "txt");
    file.deleteOnExit();

    List<String> paths = new ArrayList<>();
    paths.add(file.getAbsolutePath());

    input.setFiles(
        windowHandle,
        new RemoteReference(
            RemoteReference.Type.SHARED_ID, ((RemoteWebElement) uploadElement).getId()),
        paths);

    assertThat(uploadElement.getAttribute("value")).endsWith(file.getName());
  }

  @Test
  @NeedsFreshDriver
  public void canSetFilesWithElementId() throws IOException {
    driver.get(pages.formPage);
    WebElement uploadElement = driver.findElement(By.id("upload"));
    assertThat(uploadElement.getAttribute("value")).isEmpty();

    File file = File.createTempFile("test", "txt");
    file.deleteOnExit();

    List<String> paths = new ArrayList<>();
    paths.add(file.getAbsolutePath());

    input.setFiles(windowHandle, ((RemoteWebElement) uploadElement).getId(), paths);

    assertThat(uploadElement.getAttribute("value")).endsWith(file.getName());
  }

  @Test
  @NeedsFreshDriver
  void canSetFile() throws IOException {
    driver.get(pages.formPage);
    WebElement uploadElement = driver.findElement(By.id("upload"));
    assertThat(uploadElement.getAttribute("value")).isEmpty();

    File file = File.createTempFile("test", "txt");
    file.deleteOnExit();

    input.setFiles(
        windowHandle,
        new RemoteReference(
            RemoteReference.Type.SHARED_ID, ((RemoteWebElement) uploadElement).getId()),
        file.getAbsolutePath());

    assertThat(uploadElement.getAttribute("value")).endsWith(file.getName());
  }

  @Test
  @NeedsFreshDriver
  void canSetFileWithElementId() throws IOException {
    driver.get(pages.formPage);
    WebElement uploadElement = driver.findElement(By.id("upload"));
    assertThat(uploadElement.getAttribute("value")).isEmpty();

    File file = File.createTempFile("test", "txt");
    file.deleteOnExit();

    input.setFiles(
        windowHandle, ((RemoteWebElement) uploadElement).getId(), file.getAbsolutePath());

    assertThat(uploadElement.getAttribute("value")).endsWith(file.getName());
  }

  @Test
  @NeedsFreshDriver
  @SwitchToTopAfterTest
  void setFilesUploadsTheFileContentsToTheServer() {
    driver.get(pages.uploadPage);
    WebElement uploadElement = driver.findElement(By.id("upload"));

    File file = createTmpFile("<div>" + LOREM_IPSUM_TEXT + "</div>");

    input.setFiles(
        windowHandle,
        new RemoteReference(
            RemoteReference.Type.SHARED_ID, ((RemoteWebElement) uploadElement).getId()),
        file.getAbsolutePath());

    driver.findElement(By.id("go")).click();

    // Uploading files across a network may take a while, even if they're tiny
    WebElement label = driver.findElement(By.id("upload_label"));
    wait.until(not(visibilityOf(label)));

    driver.switchTo().frame("upload_target");

    WebElement body = driver.findElement(By.xpath("//body"));
    wait.until(elementTextToEqual(body, LOREM_IPSUM_TEXT));
  }

  @Test
  @NeedsFreshDriver
  @SwitchToTopAfterTest
  void setFilesUploadsEveryFileItSets() {
    driver.get(pages.uploadPage);
    WebElement uploadElement = driver.findElement(By.id("upload"));

    List<String> contents = List.of("first file", "second file", "third file");
    List<String> paths =
        contents.stream()
            .map(text -> "<div>" + text + "</div>")
            .map(this::createTmpFile)
            .map(File::getAbsolutePath)
            .collect(Collectors.toList());

    input.setFiles(
        windowHandle,
        new RemoteReference(
            RemoteReference.Type.SHARED_ID, ((RemoteWebElement) uploadElement).getId()),
        paths);

    driver.findElement(By.id("go")).click();

    // Uploading files across a network may take a while, even if they're tiny
    WebElement label = driver.findElement(By.id("upload_label"));
    wait.until(not(visibilityOf(label)));

    driver.switchTo().frame("upload_target");

    WebElement body = driver.findElement(By.xpath("//body"));
    wait.until(elementTextToEqual(body, String.join("\n", contents)));
  }

  private File createTmpFile(String content) {
    try {
      File f = File.createTempFile("webdriver", "tmp");
      f.deleteOnExit();
      Files.writeString(f.toPath(), content);
      return f;
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
