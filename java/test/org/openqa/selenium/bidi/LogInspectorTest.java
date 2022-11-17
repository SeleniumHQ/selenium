package org.openqa.selenium.bidi;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.bidi.log.*;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.openqa.selenium.testing.Safely.safelyCall;

public class LogInspectorTest {
  String page;
  private AppServer server;
  private FirefoxDriver driver;

  @BeforeEach
  public void setUp() {
    FirefoxOptions options = new FirefoxOptions();
    options.setCapability("webSocketUrl", true);

    driver = new FirefoxDriver(options);

    server = new NettyAppServer();
    server.start();
  }

  @Test
  void canListenToConsoleLog() throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<ConsoleLogEntry> future = new CompletableFuture<>();
      logInspector.onConsoleLog(future::complete);

      page = server.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("consoleLog")).click();

      ConsoleLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getText()).isEqualTo("Hello, world!");
      assertThat(logEntry.getRealm()).isNull();
      assertThat(logEntry.getArgs().size()).isEqualTo(1);
      assertThat(logEntry.getType()).isEqualTo("console");
      assertThat(logEntry.getLevel()).isEqualTo(BaseLogEntry.LogLevel.INFO);
      assertThat(logEntry.getMethod()).isEqualTo("log");
      assertThat(logEntry.getStackTrace()).isNull();
    }
  }

  @Test
  void canListenToJavascriptLog() throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<JavascriptLogEntry> future = new CompletableFuture<>();
      logInspector.onJavaScriptLog(future::complete);

      page = server.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("jsException")).click();

      JavascriptLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getText()).isEqualTo("Error: Not working");
      assertThat(logEntry.getType()).isEqualTo("javascript");
      assertThat(logEntry.getLevel()).isEqualTo(BaseLogEntry.LogLevel.ERROR);
    }
  }

  @Test
  void canListenToJavascriptErrorLog() throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<JavascriptLogEntry> future = new CompletableFuture<>();
      logInspector.onJavaScriptException(future::complete);

      page = server.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("jsException")).click();

      JavascriptLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getText()).isEqualTo("Error: Not working");
      assertThat(logEntry.getType()).isEqualTo("javascript");
      assertThat(logEntry.getLevel()).isEqualTo(BaseLogEntry.LogLevel.ERROR);
    }
  }

  @Test
  void canRetrieveStacktraceForALog() throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<JavascriptLogEntry> future = new CompletableFuture<>();
      logInspector.onJavaScriptException(future::complete);

      page = server.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("logWithStacktrace")).click();

      JavascriptLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      StackTrace stackTrace = logEntry.getStackTrace();
      assertThat(stackTrace).isNotNull();
      assertThat(stackTrace.getCallFrames().size()).isEqualTo(4);
    }
  }

  @AfterEach
  public void quitDriver() {
    if (driver != null) {
      driver.quit();
    }
    safelyCall(server::stop);
  }
}
