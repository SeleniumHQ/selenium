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

import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.Augmenter;

class DevToolsReuseTest extends DevToolsTestBase {

  @Test
  public void shouldBeAbleToCloseDevToolsAndCreateNewInstance() {
    WebDriver driver = new Augmenter().augment(this.driver);

    DevTools devTools = ((HasDevTools) driver).getDevTools();
    devTools.createSession();
    addConsoleLogListener(devTools);

    devTools.close();

    devTools = ((HasDevTools) driver).getDevTools();
    devTools.createSession();
    addConsoleLogListener(devTools);

    devTools.close();
  }

  private static void addConsoleLogListener(DevTools devTools) {
    devTools
        .getDomains()
        .events()
        .addConsoleListener(
            consoleEvent -> assertThat(consoleEvent.getMessages()).contains("Hello, world!"));
  }
}
