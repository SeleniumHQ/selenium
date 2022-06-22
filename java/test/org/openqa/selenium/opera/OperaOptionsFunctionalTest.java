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

package org.openqa.selenium.opera;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.testing.JupiterTestBase;

/**
 * Functional tests for {@link OperaOptions}.
 */
public class OperaOptionsFunctionalTest extends JupiterTestBase {
  private OperaDriver driver = null;

  @AfterEach
  public void tearDown() {
    if (driver != null) {
      driver.quit();
    }
  }

  @Test
  public void canStartOperaWithCustomOptions() {
    OperaOptions options = new OperaOptions();
    options.addArguments("user-agent=foo;bar");
    driver = new OperaDriver(options);

    driver.get(pages.clickJacker);
    Object userAgent = driver.executeScript("return window.navigator.userAgent");
    assertThat(userAgent).isEqualTo("foo;bar");
  }

  @Test
  public void optionsStayEqualAfterSerialization() {
    OperaOptions options1 = new OperaOptions();
    OperaOptions options2 = new OperaOptions();
    assertThat(options1).isEqualTo(options2);
    options1.asMap();
    assertThat(options1).isEqualTo(options2);
  }
}
