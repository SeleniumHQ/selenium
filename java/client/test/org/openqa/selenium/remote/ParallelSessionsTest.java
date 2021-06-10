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

package org.openqa.selenium.remote;

import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.openqa.selenium.testing.Safely.safelyCall;

public class ParallelSessionsTest extends JUnit4TestBase {
  private ExecutorService service = Executors.newFixedThreadPool(3);

  @Test
  public void shouldBeAbleToRunMultipleBrowsersAtTheSameTime() throws Exception {
    // Create three browsers at the same time
    List<Future<WebDriver>> all = service.invokeAll(Arrays.asList(
      this::createDriver,
      this::createDriver,
      this::createDriver));

    try {
      // And now use them.
      for (Future<WebDriver> future : all) {
        future.get(30, SECONDS);
      }
    } finally {
      for (Future<WebDriver> future : all) {
        safelyCall(() -> {
          future.cancel(true);
          future.get(1, SECONDS).quit();
        });
      }
    }
  }

  private WebDriver createDriver() {
    WebDriver driver = new WebDriverBuilder().get();
    driver.get(pages.simpleTestPage);
    driver.getTitle();
    return driver;
  }
}
