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

import org.junit.Test;
import org.openqa.selenium.environment.webserver.Page;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.drivers.Browser;

public class ElementAccessibleNameTest extends JUnit4TestBase {

  @Test
  @NotYetImplemented(Browser.FIREFOX)
  public void shouldReturnAccessibleName() {
    driver.get(appServer.create(
      new Page().withTitle("Testing Aria Role")
        .withBody("<h1>Level 1 Header</h1>")));
    WebElement header1 = driver.findElement(By.cssSelector("h1"));
    assertThat(header1.getAccessibleName()).isEqualTo("Level 1 Header");
  }
}
