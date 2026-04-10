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

import static java.time.Instant.ofEpochMilli;
import static java.time.ZoneId.systemDefault;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf;

import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.function.Consumer;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.log.ConsoleLogEntry;
import org.openqa.selenium.bidi.log.JavascriptLogEntry;
import org.openqa.selenium.bidi.log.LogLevel;
import org.openqa.selenium.remote.DomMutation;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.Script;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;

class WebScriptTest extends JupiterTestBase {

  private String page;

  @Test
  @NeedsFreshDriver
  void canAddConsoleMessageHandler()
      throws ExecutionException, InterruptedException, TimeoutException {
    CompletableFuture<ConsoleLogEntry> future = new CompletableFuture<>();

    long id = ((RemoteWebDriver) driver).script().addConsoleMessageHandler(future::complete);

    page = appServer.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);
    driver.findElement(By.id("consoleLog")).click();

    ConsoleLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

    assertThat(logEntry.getText()).isEqualTo("Hello, world!");
    assertThat(logEntry.getArgs()).hasSize(1);
    assertThat(logEntry.getArgs().get(0).getType()).isEqualTo("string");
    assertThat(logEntry.getType()).isEqualTo("console");
    assertThat(logEntry.getLevel()).isEqualTo(LogLevel.INFO);
    assertThat(logEntry.getMethod()).isEqualTo("log");

    ((RemoteWebDriver) driver).script().removeConsoleMessageHandler(id);
  }

  @Test
  @NeedsFreshDriver
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

    page = appServer.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);
    driver.findElement(By.id("consoleLog")).click();

    ConsoleLogEntry logEntry = future1.get(5, TimeUnit.SECONDS);
    assertThat(logEntry.getText()).isEqualTo("Hello, world!");

    assertThatThrownBy(() -> future2.get(5, TimeUnit.SECONDS))
        .as("Should be able to read the console messages")
        .isInstanceOf(TimeoutException.class);

    ((RemoteWebDriver) driver).script().removeConsoleMessageHandler(id1);
  }

  @Test
  @NeedsFreshDriver
  void canAddJsErrorHandler() throws ExecutionException, InterruptedException, TimeoutException {
    CompletableFuture<JavascriptLogEntry> future = new CompletableFuture<>();

    long id = ((RemoteWebDriver) driver).script().addJavaScriptErrorHandler(future::complete);

    page = appServer.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);
    driver.findElement(By.id("jsException")).click();

    JavascriptLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

    assertThat(logEntry.getText()).isEqualTo("Error: Not working");
    assertThat(logEntry.getType()).isEqualTo("javascript");
    assertThat(logEntry.getLevel()).isEqualTo(LogLevel.ERROR);

    ((RemoteWebDriver) driver).script().removeJavaScriptErrorHandler(id);
  }

  @Test
  @NeedsFreshDriver
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

    page = appServer.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);
    driver.findElement(By.id("jsException")).click();

    JavascriptLogEntry logEntry = future1.get(5, TimeUnit.SECONDS);
    assertThat(logEntry.getText()).isEqualTo("Error: Not working");
    assertThat(logEntry.getType()).isEqualTo("javascript");
    assertThat(logEntry.getLevel()).isEqualTo(LogLevel.ERROR);

    assertThatThrownBy(() -> future2.get(5, TimeUnit.SECONDS))
        .as("Should be able to read the JS errors")
        .isInstanceOf(TimeoutException.class);

    ((RemoteWebDriver) driver).script().removeConsoleMessageHandler(id1);
  }

  @Test
  @NeedsFreshDriver
  void canAddMultipleHandlers() throws ExecutionException, InterruptedException, TimeoutException {
    CompletableFuture<JavascriptLogEntry> future1 = new CompletableFuture<>();
    CompletableFuture<JavascriptLogEntry> future2 = new CompletableFuture<>();

    // Adding two consumers
    Consumer<JavascriptLogEntry> consumer1 = future1::complete;
    Consumer<JavascriptLogEntry> consumer2 = future2::complete;

    long id1 = ((RemoteWebDriver) driver).script().addJavaScriptErrorHandler(consumer1);
    long id2 = ((RemoteWebDriver) driver).script().addJavaScriptErrorHandler(consumer2);

    page = appServer.whereIs("/bidi/logEntryAdded.html");
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
  @NeedsFreshDriver
  void canAddDomMutationHandler() {
    List<String> mutations = new CopyOnWriteArrayList<>();

    Script script = ((RemoteWebDriver) driver).script();
    script.addDomMutationHandler(mutationHandler(mutations));

    driver.get(pages.dynamicPage);
    triggerDomMutation();

    assertThat(mutations).isNotEmpty();
    assertThat(lastOf(mutations)).isEqualTo("style: 'display:none;' -> ''");
  }

  @Test
  @NeedsFreshDriver
  void canRemoveDomMutationHandler() {
    List<String> mutations = new CopyOnWriteArrayList<>();
    Script script = ((RemoteWebDriver) driver).script();
    long id = script.addDomMutationHandler(mutationHandler(mutations));

    driver.get(pages.dynamicPage);
    triggerDomMutation();
    assertThat(mutations).isNotEmpty();

    script.removeDomMutationHandler(id);

    mutations.clear();
    driver.get(pages.dynamicPage);
    triggerDomMutation();
    assertThat(mutations).isEmpty();
  }

  private void triggerDomMutation() {
    WebElement reveal = driver.findElement(By.id("reveal"));
    reveal.click();
    WebElement revealed = driver.findElement(By.id("revealed"));
    new WebDriverWait(driver, Duration.ofSeconds(10)).until(visibilityOf(revealed));
  }

  private static Consumer<DomMutation> mutationHandler(List<String> mutations) {
    return mutation -> {
      mutations.add(
          String.format(
              "%s: '%s' -> '%s'",
              mutation.getAttributeName(), mutation.getOldValue(), mutation.getCurrentValue()));
    };
  }

  @Test
  @NeedsFreshDriver
  void canPinScript() throws ExecutionException, InterruptedException, TimeoutException {
    CompletableFuture<ConsoleLogEntry> future = new CompletableFuture<>();

    ((RemoteWebDriver) driver).script().pin("() => { console.log('Hello!'); }");

    long id = ((RemoteWebDriver) driver).script().addConsoleMessageHandler(future::complete);

    page = appServer.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);

    ConsoleLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

    assertThat(logEntry.getText()).isEqualTo("Hello!");

    ((RemoteWebDriver) driver).script().removeConsoleMessageHandler(id);
  }

  @Test
  @NeedsFreshDriver
  void canUnpinScript() throws InterruptedException {
    List<String> logs = new CopyOnWriteArrayList<>();
    CountDownLatch latch = new CountDownLatch(1);

    Script script = ((RemoteWebDriver) driver).script();
    String pinnedScript = script.pin("() => { console.log('Hello!'); }");

    DateTimeFormatter formatter =
        DateTimeFormatter.ofPattern("HH:mm:ss:SSS").withZone(systemDefault());

    long id =
        script.addConsoleMessageHandler(
            log -> {
              String time = formatter.format(ofEpochMilli(log.getTimestamp()));
              String message = String.format("%s %s", log.getText(), time);
              logs.add(message);
              latch.countDown();
            });

    try {
      page = appServer.whereIs("/bidi/logEntryAdded.html");
      assertThat(logs).hasSize(0);

      driver.get(page);
      assertThat(latch.await(10, SECONDS)).isTrue();

      assertThat(logs).as("Chrome logs once, FireFox logs twice").isNotEmpty();
      assertThat(logs.get(0)).startsWith("Hello!");

      script.unpin(pinnedScript);

      logs.clear();
      driver.get(page);
      assertThat(logs).as("Script has been unpinned, no logs anymore.").isEmpty();
    } finally {
      script.removeConsoleMessageHandler(id);
    }
  }

  private static <T> T lastOf(List<T> list) {
    return list.get(list.size() - 1);
  }
}
