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

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.bidi.module.Input;
import org.openqa.selenium.bidi.script.RemoteReference;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.testing.JupiterTestBase;

public class SetFilesCommandTest extends JupiterTestBase {
  private Input input;

  private String windowHandle;

  private AppServer server;

  @BeforeEach
  public void setUp() {
    windowHandle = driver.getWindowHandle();
    input = new Input(driver);
    server = new NettyAppServer();
    server.start();
  }

  @Test
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
}
