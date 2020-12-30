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

package org.openqa.selenium.chrome;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.printoptions.PrintOptions;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;

public class PrintCommandTest extends JUnit4TestBase {

  private ChromeDriver driver = null;

  @After
  public void tearDown() {
    if (driver != null) {
      driver.quit();
    }
  }

  @NeedsLocalEnvironment
  @Test
  public void canPrintPage() {
    PrintOptions printOptions = new PrintOptions();
    ChromeOptions options = new ChromeOptions();
    options.setHeadless(true);

    driver = new ChromeDriver(options);
    driver.get(pages.printPage);

    driver.printPage(printOptions);
  }
}
