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

package org.openqa.selenium.bidi;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatExceptionOfType;

import java.util.Collections;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.testing.drivers.Browser;

class BiDiSessionCleanUpTest {

  private FirefoxDriver driver;

  @Test
  void shouldNotCloseBiDiSessionIfOneWindowIsClosed() {
    FirefoxOptions options = (FirefoxOptions) Browser.FIREFOX.getCapabilities();
    // Enable BiDi
    options.setCapability("webSocketUrl", true);

    driver = new FirefoxDriver(options);

    BiDi biDi = driver.getBiDi();

    BiDiSessionStatus status =
        biDi.send(new Command<>("session.status", Collections.emptyMap(), BiDiSessionStatus.class));
    assertThat(status).isNotNull();
    assertThat(status.getMessage()).isEqualTo("Session already started");

    driver.switchTo().newWindow(WindowType.WINDOW);
    driver.switchTo().newWindow(WindowType.TAB);
    driver.switchTo().newWindow(WindowType.TAB);

    driver.close();

    BiDiSessionStatus statusAfterClosing =
        biDi.send(new Command<>("session.status", Collections.emptyMap(), BiDiSessionStatus.class));
    assertThat(statusAfterClosing).isNotNull();
    assertThat(status.getMessage()).isEqualTo("Session already started");
    driver.quit();
  }

  @Test
  void shouldCloseBiDiSessionIfLastWindowIsClosed() {
    FirefoxOptions options = (FirefoxOptions) Browser.FIREFOX.getCapabilities();
    // Enable BiDi
    options.setCapability("webSocketUrl", true);

    driver = new FirefoxDriver(options);

    BiDi biDi = driver.getBiDi();

    BiDiSessionStatus status =
        biDi.send(new Command<>("session.status", Collections.emptyMap(), BiDiSessionStatus.class));
    assertThat(status).isNotNull();
    assertThat(status.getMessage()).isEqualTo("Session already started");

    driver.close();

    // Closing the last top-level browsing context, closes the WebDriver and BiDi session
    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(
            () ->
                biDi.send(
                    new Command<>(
                        "session.status", Collections.emptyMap(), BiDiSessionStatus.class)));
  }
}
