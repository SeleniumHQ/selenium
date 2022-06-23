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

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

import java.util.Collections;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

public class BiDiSessionTest {

  private FirefoxDriver driver;

  @Disabled
  @Test
  public void shouldBeAbleToCreateABiDiSession() {
    FirefoxOptions options = new FirefoxOptions();
    // Enable BiDi
    options.setCapability("webSocketUrl", true);

    driver = new FirefoxDriver(options);

    BiDi biDi = driver.getBiDi();

    BiDiSessionStatus status = biDi.send(new Command<>("session.status", Collections.emptyMap(), BiDiSessionStatus.class));
    assertThat(status).isNotNull();
    assertThat(status.getMessage()).isEqualTo("Session already started");
  }

  @AfterEach
  public void quitDriver() {
    if (driver != null) {
      driver.quit();
    }
  }
}
