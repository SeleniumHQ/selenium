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

package org.openqa.selenium.devtools;

import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.testing.JupiterTestBase;

import static org.assertj.core.api.Assumptions.assumeThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.openqa.selenium.testing.TestUtilities.isFirefox;
import static org.openqa.selenium.testing.TestUtilities.isFirefoxVersionOlderThan;

public abstract class DevToolsTestBase extends JupiterTestBase {

  protected DevTools devTools;

  @BeforeEach
  public void setUp() {
    assumeThat(driver).isInstanceOf(HasDevTools.class);
    assumeThat(isFirefoxVersionOlderThan(87, driver)).isFalse();

    devTools = ((HasDevTools) driver).getDevTools();
    devTools.createSessionIfThereIsNotOne(driver.getWindowHandle());

    try {
      devTools.clearListeners();
    } catch (DevToolsException e) {
      if (isFirefox(driver)) {
        assumeTrue(false,
          "Unable to clear listeners on Firefox because Fetch domain is not implemented");
      }
      throw e;
    }
  }
}
