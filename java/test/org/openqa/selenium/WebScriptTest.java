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

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.fail;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf;

import java.time.Duration;
import java.util.concurrent.*;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.log.ConsoleLogEntry;
import org.openqa.selenium.bidi.log.JavascriptLogEntry;
import org.openqa.selenium.bidi.log.LogLevel;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.remote.DomMutation;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.JupiterTestBase;

class WebScriptTest extends JupiterTestBase {

  String page;
  private AppServer server;

  @BeforeEach
  public void setUp() {
    server = new NettyAppServer();
    server.start();
  }

  @AfterEach
  public void cleanUp() {
    driver.quit();
  }

  @Test
  void canAddConsoleMessageHandler()
      throws ExecutionException, InterruptedException, TimeoutException {
    CompletableFuture<ConsoleLogEntry> future = new CompletableFuture<>();

    long id = ((RemoteWebDriver) driver).script().addConsoleMessageHandler(future::complete);

    page = server.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);
    driver.findElement(By.id("consoleLog")).click();

    ConsoleLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

    assertThat(logEntry.getText()).isEqualTo("Hello, world!");
    assertThat(logEntry.getArgs().size()).isEqualTo(1);
    assertThat(logEntry.getArgs().get(0).getType()).isEqualTo("string");
    assertThat(logEntry.getType()).isEqualTo("console");
    assertThat(logEntry.getLevel()).isEqualTo(LogLevel.INFO);
    assertThat(logEntry.getMethod()).isEqualTo("log");

    ((RemoteWebDriver) driver).script().removeConsoleMessageHandler(id);
  }

  @Test
  void canRemoveConsoleMessageHandler()
      throws ExecutionException, InterruptedException, TimeoutException {
    CompletableFuture<ConsoleLogEntry> future1 = new CompletableFuture<>();
    CompletableFuture<ConsoleLogEntry> future2 = new CompletableFuture<>();

    // Adding two consumers
    Consumer<ConsoleLogEntry> consumer1 = future1::complete;
    Consumer<ConsoleLogEntry> consumer2 = future2::complete;

    long id1 = ((RemoteWebDriver) driver).script().addConsoleMessageHandler(consumer1);
    long id2 = ((RemoteWebDriver) driver).script().addConsoleMessageHandler(consumer2);

    // Removing the second consumer, so it will no longer get the console message.
    ((RemoteWebDriver) driver).script().removeConsoleMessageHandler(id2);

    page = server.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);
    driver.findElement(By.id("consoleLog")).click();

    ConsoleLogEntry logEntry = future1.get(5, TimeUnit.SECONDS);
    assertThat(logEntry.getText()).isEqualTo("Hello, world!");

    try {
      future2.get(5, TimeUnit.SECONDS);
      fail("Should be able to read the console messages");
    } catch (TimeoutException e) {
      assertThat(e).isNotNull();
    }
    ((RemoteWebDriver) driver).script().removeConsoleMessageHandler(id1);
  }

  @Test
  void canAddJsErrorHandler() throws ExecutionException, InterruptedException, TimeoutException {
    CompletableFuture<JavascriptLogEntry> future = new CompletableFuture<>();

    long id = ((RemoteWebDriver) driver).script().addJavaScriptErrorHandler(future::complete);

    page = server.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);
    driver.findElement(By.id("jsException")).click();

    JavascriptLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

    assertThat(logEntry.getText()).isEqualTo("Error: Not working");
    assertThat(logEntry.getType()).isEqualTo("javascript");
    assertThat(logEntry.getLevel()).isEqualTo(LogLevel.ERROR);

    ((RemoteWebDriver) driver).script().removeJavaScriptErrorHandler(id);
  }

  @Test
  void canRemoveJsErrorHandler() throws ExecutionException, InterruptedException, TimeoutException {
    CompletableFuture<JavascriptLogEntry> future1 = new CompletableFuture<>();
    CompletableFuture<JavascriptLogEntry> future2 = new CompletableFuture<>();

    // Adding two consumers
    Consumer<JavascriptLogEntry> consumer1 = future1::complete;
    Consumer<JavascriptLogEntry> consumer2 = future2::complete;

    long id1 = ((RemoteWebDriver) driver).script().addJavaScriptErrorHandler(consumer1);
    long id2 = ((RemoteWebDriver) driver).script().addJavaScriptErrorHandler(consumer2);

    // Removing the second consumer, so it will no longer get the JS error.
    ((RemoteWebDriver) driver).script().removeJavaScriptErrorHandler(id2);

    page = server.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);
    driver.findElement(By.id("jsException")).click();

    JavascriptLogEntry logEntry = future1.get(5, TimeUnit.SECONDS);
    assertThat(logEntry.getText()).isEqualTo("Error: Not working");
    assertThat(logEntry.getType()).isEqualTo("javascript");
    assertThat(logEntry.getLevel()).isEqualTo(LogLevel.ERROR);

    try {
      future2.get(5, TimeUnit.SECONDS);
      fail("Should be able to read the JS errors");
    } catch (TimeoutException e) {
      assertThat(e).isNotNull();
    }

    ((RemoteWebDriver) driver).script().removeConsoleMessageHandler(id1);
  }

  @Test
  void canAddMultipleHandlers() throws ExecutionException, InterruptedException, TimeoutException {
    CompletableFuture<JavascriptLogEntry> future1 = new CompletableFuture<>();
    CompletableFuture<JavascriptLogEntry> future2 = new CompletableFuture<>();

    // Adding two consumers
    Consumer<JavascriptLogEntry> consumer1 = future1::complete;
    Consumer<JavascriptLogEntry> consumer2 = future2::complete;

    long id1 = ((RemoteWebDriver) driver).script().addJavaScriptErrorHandler(consumer1);
    long id2 = ((RemoteWebDriver) driver).script().addJavaScriptErrorHandler(consumer2);

    page = server.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);
    driver.findElement(By.id("jsException")).click();

    JavascriptLogEntry logEntry1 = future1.get(5, TimeUnit.SECONDS);
    assertThat(logEntry1.getText()).isEqualTo("Error: Not working");
    assertThat(logEntry1.getType()).isEqualTo("javascript");
    assertThat(logEntry1.getLevel()).isEqualTo(LogLevel.ERROR);

    JavascriptLogEntry logEntry2 = future2.get(5, TimeUnit.SECONDS);
    assertThat(logEntry2.getText()).isEqualTo("Error: Not working");
    assertThat(logEntry2.getType()).isEqualTo("javascript");
    assertThat(logEntry2.getLevel()).isEqualTo(LogLevel.ERROR);
  }

  @Test
  void canAddDomMutationHandler() throws InterruptedException {
    AtomicReference<DomMutation> seen = new AtomicReference<>();
    CountDownLatch latch = new CountDownLatch(1);

    ((RemoteWebDriver) driver)
        .script()
        .addDomMutationHandler(
            mutation -> {
              seen.set(mutation);
              latch.countDown();
            });

    driver.get(pages.dynamicPage);

    WebElement reveal = driver.findElement(By.id("reveal"));
    reveal.click();
    WebElement revealed = driver.findElement(By.id("revealed"));

    new WebDriverWait(driver, Duration.ofSeconds(10)).until(visibilityOf(revealed));

    Assertions.assertThat(latch.await(10, SECONDS)).isTrue();
    assertThat(seen.get().getAttributeName()).isEqualTo("style");
    assertThat(seen.get().getCurrentValue()).isEmpty();
    assertThat(seen.get().getOldValue()).isEqualTo("display:none;");
  }

  @Test
  void canRemoveDomMutationHandler() throws InterruptedException {
    AtomicReference<DomMutation> seen = new AtomicReference<>();
    CountDownLatch latch = new CountDownLatch(1);

    long id =
        ((RemoteWebDriver) driver)
            .script()
            .addDomMutationHandler(
                mutation -> {
                  seen.set(mutation);
                  latch.countDown();
                });

    driver.get(pages.dynamicPage);

    ((RemoteWebDriver) driver).script().removeDomMutationHandler(id);

    WebElement reveal = driver.findElement(By.id("reveal"));
    reveal.click();
    WebElement revealed = driver.findElement(By.id("revealed"));

    new WebDriverWait(driver, Duration.ofSeconds(10)).until(visibilityOf(revealed));

    Assertions.assertThat(latch.await(10, SECONDS)).isFalse();
  }

  @Test
  void canPinScript() throws ExecutionException, InterruptedException, TimeoutException {
    CompletableFuture<ConsoleLogEntry> future = new CompletableFuture<>();

    ((RemoteWebDriver) driver).script().pin("() => { console.log('Hello!'); }");

    long id = ((RemoteWebDriver) driver).script().addConsoleMessageHandler(future::complete);

    page = server.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);

    ConsoleLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

    assertThat(logEntry.getText()).isEqualTo("Hello!");

    ((RemoteWebDriver) driver).script().removeConsoleMessageHandler(id);
  }

  @Test
  void canUnpinScript() throws ExecutionException, InterruptedException, TimeoutException {
    CountDownLatch latch = new CountDownLatch(2);

    String pinnedScript =
        ((RemoteWebDriver) driver).script().pin("() => { console.log('Hello!'); }");

    long id =
        ((RemoteWebDriver) driver)
            .script()
            .addConsoleMessageHandler(consoleLogEntry -> latch.countDown());

    page = server.whereIs("/bidi/logEntryAdded.html");

    driver.get(page);

    ((RemoteWebDriver) driver).script().unpin(pinnedScript);

    driver.get(page);

    assertThat(latch.getCount()).isEqualTo(1L);

    ((RemoteWebDriver) driver).script().removeConsoleMessageHandler(id);
  }
}
