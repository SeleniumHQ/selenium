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

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.devtools.idealized.target.model.TargetInfo;
import org.openqa.selenium.remote.Augmenter;
import org.openqa.selenium.testing.Ignore;

import java.util.List;

class WindowSwitchingTest extends DevToolsTestBase {

  @Test
  @Ignore(FIREFOX)
  public void shouldBeAbleToSwitchWindowsAndCloseTheOriginal() {
    WebDriver driver = new Augmenter().augment(this.driver);

    driver.get("https://www.selenium.dev");

    String originalWindow = driver.getWindowHandle();
    driver.switchTo().newWindow(WindowType.TAB);

    String newWindowHandle = driver.getWindowHandle();
    List<TargetInfo> originalTargets = devTools.send(devTools.getDomains().target().getTargets());

    // this .close() kills the dev tools session, no chance to ever retrieve a new one for the other tab
    driver.switchTo().window(originalWindow).close();
    driver.switchTo().window(newWindowHandle);
    driver.get("https://www.selenium.dev/documentation/webdriver/browser_manipulation/");

    List<TargetInfo> updatedTargets = this.devTools.send(this.devTools.getDomains().target().getTargets());

    assertThat(updatedTargets).isNotEqualTo(originalTargets);
  }
}
