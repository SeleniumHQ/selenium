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

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.devtools.idealized.Network;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.drivers.Browser;

import java.util.Map;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

public class ChangeUserAgentTest extends DevToolsTestBase {

  @Test
  @NotYetImplemented(value = Browser.FIREFOX, reason = "Network interception not yet supported")
  public void canChangeUserAgent() {
    devTools.getDomains().network().setUserAgent(
      new Network.UserAgent("Camembert 1.0")
        .platform("FreeBSD").acceptLanguage("da, en-gb, *"));
    driver.get(appServer.whereIs("/echo"));

    Map<String, String> headers = driver.findElements(By.cssSelector("#headers tr")).stream()
      .map(row -> row.findElements(By.tagName("td")))
      .collect(Collectors.toMap(cells -> cells.get(0).getText(), cells -> cells.get(1).getText()));
    assertThat(headers)
      .containsEntry("User-Agent", "Camembert 1.0")
      .containsEntry("Accept-Language", "da, en-gb;q=0.9, *;q=0.8");

    Object platform = ((JavascriptExecutor) driver).executeScript("return window.navigator.platform");
    assertThat(platform).isEqualTo("FreeBSD");
  }

}
