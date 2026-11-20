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

package org.openqa.selenium.remote.service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.manager.SeleniumManager;
import org.openqa.selenium.os.ExternalProcess;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandInfo;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.HttpCommandExecutor;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.http.ClientConfig;

/**
 * Command executor that records the session into a trace archive (Playwright trace format).
 *
 * <p>Selenium Manager runs in pipe mode: it starts the driver behind a local HTTP proxy that
 * records every command, a screenshot after each action, and (through WebDriver BiDi when the
 * driver supports it) console messages and network activity. The trace is written when the session
 * is quit.
 */
@Beta
public class TraceRecordingCommandExecutor extends HttpCommandExecutor {

  private static final Logger LOG = Logger.getLogger(TraceRecordingCommandExecutor.class.getName());
  private static final Duration STARTUP_TIMEOUT = Duration.ofSeconds(60);
  private static final Duration SHUTDOWN_TIMEOUT = Duration.ofSeconds(30);
  private static final Duration POLL_INTERVAL = Duration.ofMillis(100);

  private final ExternalProcess pipe;
  private volatile boolean quitSent;

  private TraceRecordingCommandExecutor(
      Map<String, CommandInfo> additionalCommands,
      URL proxyUrl,
      ClientConfig clientConfig,
      ExternalProcess pipe) {
    super(additionalCommands, proxyUrl, clientConfig);
    this.pipe = pipe;
  }

  /**
   * Starts the driver of the given service through Selenium Manager in pipe mode, recording the
   * session into {@code tracePath}. The service must already have its executable resolved (see
   * {@link DriverFinder}); other service settings (port, arguments, logging) are not used.
   *
   * @param service service whose driver executable will be started
   * @param options browser options of the session
   * @param tracePath path of the trace archive to write when the session is quit
   * @param additionalCommands browser-specific commands supported by the driver
   * @param clientConfig HTTP client configuration used to talk to the driver
   * @return the executor sending commands through the recording proxy
   */
  public static TraceRecordingCommandExecutor start(
      DriverService service,
      Capabilities options,
      Path tracePath,
      Map<String, CommandInfo> additionalCommands,
      ClientConfig clientConfig) {
    Require.nonNull("Driver service", service);
    Require.nonNull("Driver options", options);
    Require.nonNull("Trace path", tracePath);
    String driverPath = Require.nonNull("Driver executable", service.getExecutable());

    return launch(
        List.of(
            "--browser",
            options.getBrowserName(),
            "--driver-path",
            driverPath,
            "--record",
            tracePath.toAbsolutePath().toString()),
        tracePath,
        additionalCommands,
        clientConfig);
  }

  /**
   * Records a session on an existing remote end (e.g. Selenium Grid or a cloud provider) through
   * Selenium Manager in pipe mode, which runs locally in front of it. Selenium Manager does not
   * resolve any driver or browser in this case.
   *
   * @param remoteAddress URL of the remote end
   * @param options browser options of the session
   * @param tracePath path of the trace archive to write when the session is quit
   * @param clientConfig HTTP client configuration used to talk to the remote end
   * @return the executor sending commands through the recording proxy
   */
  public static TraceRecordingCommandExecutor startRemote(
      URL remoteAddress, Capabilities options, Path tracePath, ClientConfig clientConfig) {
    Require.nonNull("Remote address", remoteAddress);
    Require.nonNull("Driver options", options);
    Require.nonNull("Trace path", tracePath);
    return launch(
        List.of(
            "--browser",
            options.getBrowserName(),
            "--upstream",
            remoteAddress.toString(),
            "--record",
            tracePath.toAbsolutePath().toString()),
        tracePath,
        Map.of(),
        clientConfig);
  }

  private static TraceRecordingCommandExecutor launch(
      List<String> arguments,
      Path tracePath,
      Map<String, CommandInfo> additionalCommands,
      ClientConfig clientConfig) {
    ExternalProcess pipe = SeleniumManager.getInstance().startPipe(arguments);
    try {
      URL proxyUrl = awaitProxyUrl(pipe);
      LOG.fine(String.format("Recording session to %s through %s", tracePath, proxyUrl));
      return new TraceRecordingCommandExecutor(additionalCommands, proxyUrl, clientConfig, pipe);
    } catch (RuntimeException e) {
      pipe.shutdown();
      throw e;
    }
  }

  @Override
  public Response execute(Command command) throws IOException {
    if (DriverCommand.QUIT.equals(command.getName())) {
      quitSent = true;
    }
    return super.execute(command);
  }

  /** Waits until Selenium Manager writes the trace and exits; called after the session is quit. */
  @Override
  public void close() {
    try {
      super.close();
    } finally {
      stopPipe();
    }
  }

  private void stopPipe() {
    try {
      // Selenium Manager exits by itself once the session is deleted. Otherwise (e.g. the session
      // could not be created) it is asked to terminate, which also saves what was recorded.
      if (!quitSent) {
        pipe.shutdown(SHUTDOWN_TIMEOUT);
      } else if (!pipe.waitFor(SHUTDOWN_TIMEOUT)) {
        LOG.warning("Selenium Manager did not exit after the session was quit, shutting it down");
        pipe.shutdown();
      }
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      pipe.shutdown();
    }
    String output = pipe.getOutput(StandardCharsets.UTF_8);
    LOG.fine(() -> "Selenium Manager pipe mode output:\n" + output);
    String traceError = findTraceError(output);
    if (traceError != null) {
      LOG.warning("The session trace could not be saved: " + traceError);
    }
  }

  private static URL awaitProxyUrl(ExternalProcess pipe) {
    long deadline = System.nanoTime() + STARTUP_TIMEOUT.toNanos();
    while (System.nanoTime() < deadline) {
      String output = pipe.getOutput(StandardCharsets.UTF_8);
      String proxyUrl = findProxyUrl(output);
      if (proxyUrl != null) {
        try {
          return URI.create(proxyUrl).toURL();
        } catch (IllegalArgumentException | MalformedURLException e) {
          throw new WebDriverException("Invalid proxy URL from Selenium Manager: " + proxyUrl, e);
        }
      }
      if (!pipe.isAlive()) {
        throw new WebDriverException(
            String.format(
                "Selenium Manager exited with code %d before starting the recording proxy:%n%s",
                pipe.exitValue(), output));
      }
      try {
        Thread.sleep(POLL_INTERVAL.toMillis());
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new WebDriverException("Interrupted while waiting for Selenium Manager", e);
      }
    }
    throw new WebDriverException(
        String.format(
            "Selenium Manager did not start the recording proxy within %d seconds:%n%s",
            STARTUP_TIMEOUT.toSeconds(), pipe.getOutput(StandardCharsets.UTF_8)));
  }

  /** The proxy URL is announced as a single JSON line among the regular log lines. */
  static @Nullable String findProxyUrl(String output) {
    return findJsonLineValue(output, "proxy_url");
  }

  /** A failure to write the trace is reported as a JSON line, after the session was quit. */
  static @Nullable String findTraceError(String output) {
    return findJsonLineValue(output, "trace_error");
  }

  private static @Nullable String findJsonLineValue(String output, String key) {
    for (String line : output.split("\\R")) {
      String trimmed = line.trim();
      if (!trimmed.startsWith("{") || !trimmed.contains("\"" + key + "\"")) {
        continue;
      }
      try {
        Map<String, Object> values = new Json().toType(trimmed, Json.MAP_TYPE);
        Object value = values.get(key);
        if (value instanceof String) {
          return (String) value;
        }
      } catch (JsonException e) {
        LOG.log(Level.FINE, "Ignoring unparsable Selenium Manager output: " + trimmed, e);
      }
    }
    return null;
  }
}
