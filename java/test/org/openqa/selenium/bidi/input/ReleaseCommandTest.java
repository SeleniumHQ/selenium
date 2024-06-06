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

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.bidi.module.Input;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.testing.JupiterTestBase;

public class ReleaseCommandTest extends JupiterTestBase {
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
  public void testReleaseInBrowsingContext() {
    driver.get(server.whereIs("/bidi/release_action.html"));

    WebElement inputTextBox = driver.findElement(By.id("keys"));

    Actions sendLowercase =
        new Actions(driver).keyDown(inputTextBox, "a").keyDown(inputTextBox, "b");

    input.perform(windowHandle, sendLowercase.getSequences());
    ((JavascriptExecutor) driver).executeScript("resetEvents()");

    input.release(windowHandle);

    List<Map<String, Object>> events =
        (List<Map<String, Object>>)
            ((JavascriptExecutor) driver).executeScript("return allEvents.events");
    assertThat(events.get(0).get("code")).isEqualTo("KeyB");
    assertThat(events.get(1).get("code")).isEqualTo("KeyA");
  }
}
