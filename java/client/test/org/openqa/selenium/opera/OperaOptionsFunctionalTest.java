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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;

/**
 * Functional tests for {@link OperaOptions}.
 */
public class OperaOptionsFunctionalTest extends JUnit4TestBase {
  private OperaDriver driver = null;

  @After
  public void tearDown() throws Exception {
    if (driver != null) {
      driver.quit();
    }
  }

  @NeedsLocalEnvironment
  @Test
  public void canStartOperaWithCustomOptions() {
    OperaOptions options = new OperaOptions();
    options.addArguments("user-agent=foo;bar");
    driver = new OperaDriver(options);

    driver.get(pages.clickJacker);
    Object userAgent = driver.executeScript("return window.navigator.userAgent");
    assertEquals("foo;bar", userAgent);
  }

  @NeedsLocalEnvironment
  @Test
  public void optionsStayEqualAfterSerialization() throws Exception {
    OperaOptions options1 = new OperaOptions();
    OperaOptions options2 = new OperaOptions();
    assertTrue("empty opera options should be equal", options1.equals(options2));
    options1.asMap();
    assertTrue("empty opera options after one is .toJson() should be equal",
               options1.equals(options2));
  }
}
