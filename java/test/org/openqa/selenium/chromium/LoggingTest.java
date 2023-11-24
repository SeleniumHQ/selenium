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

package org.openqa.selenium.chromium;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assumptions.assumeThat;
import static org.openqa.selenium.devtools.events.CdpEventTypes.consoleEvent;
import static org.openqa.selenium.devtools.events.CdpEventTypes.domMutation;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.devtools.events.ConsoleEvent;
import org.openqa.selenium.devtools.events.DomMutationEvent;
import org.openqa.selenium.logging.HasLogEvents;
import org.openqa.selenium.testing.JupiterTestBase;

class LoggingTest extends JupiterTestBase {

  @BeforeEach
  public void checkAssumptions() {
    assumeThat(driver).isInstanceOf(HasLogEvents.class);
  }

  @Test
  void demonstrateLoggingWorks() throws InterruptedException {
    HasLogEvents logger = (HasLogEvents) driver;

    AtomicReference<ConsoleEvent> seen = new AtomicReference<>();
    CountDownLatch latch = new CountDownLatch(1);
    logger.onLogEvent(
        consoleEvent(
            entry -> {
              seen.set(entry);
              latch.countDown();
            }));

    driver.get(pages.javascriptPage);
    ((JavascriptExecutor) driver).executeScript("console.log('I like cheese');");

    assertThat(latch.await(10, SECONDS)).isTrue();
    assertThat(seen.get().getMessages()).contains("I like cheese");
  }

  @Test
  void watchDomMutations() throws InterruptedException {
    HasLogEvents logger = (HasLogEvents) driver;

    AtomicReference<DomMutationEvent> seen = new AtomicReference<>();
    CountDownLatch latch = new CountDownLatch(1);
    logger.onLogEvent(
        domMutation(
            mutation -> {
              seen.set(mutation);
              latch.countDown();
            }));

    driver.get(pages.simpleTestPage);
    WebElement span = driver.findElement(By.id("span"));

    ((JavascriptExecutor) driver)
        .executeScript("arguments[0].setAttribute('cheese', 'gouda');", span);

    assertThat(latch.await(10, SECONDS)).isTrue();
    assertThat(seen.get().getAttributeName()).isEqualTo("cheese");
    assertThat(seen.get().getCurrentValue()).isEqualTo("gouda");
  }
}
