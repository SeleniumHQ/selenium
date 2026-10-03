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

package org.openqa.selenium.chrome;

import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.chromium.ChromiumDriver;
import org.openqa.selenium.chromium.ChromiumDriverCommandExecutor;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.manager.SeleniumManager;
import org.openqa.selenium.os.ExternalProcess;
import org.openqa.selenium.remote.CommandInfo;
import org.openqa.selenium.remote.HttpCommandExecutor;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.RemoteWebDriverBuilder;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.service.DriverFinder;
import org.openqa.selenium.remote.service.DriverService;

/**
 * A {@link WebDriver} implementation that controls a Chrome browser running on the local machine.
 * It requires a <code>chromedriver</code> executable to be available in PATH.
 *
 * @see <a href="https://sites.google.com/chromium.org/driver/">chromedriver</a>
 */
public class ChromeDriver extends ChromiumDriver {

  /**
   * Creates a new ChromeDriver using the {@link ChromeDriverService#createDefaultService default}
   * server configuration.
   *
   * @see #ChromeDriver(ChromeDriverService, ChromeOptions)
   */
  public ChromeDriver() {
    this(ChromeDriverService.createDefaultService(), new ChromeOptions());
  }

  /**
   * Creates a new ChromeDriver instance. The {@code service} will be started along with the driver,
   * and shutdown upon calling {@link #quit()}.
   *
   * @param service The service to use.
   * @see RemoteWebDriver#RemoteWebDriver(org.openqa.selenium.remote.CommandExecutor, Capabilities)
   */
  public ChromeDriver(ChromeDriverService service) {
    this(service, new ChromeOptions());
  }

  /**
   * Creates a new ChromeDriver instance with the specified options.
   *
   * @param options The options to use.
   * @see #ChromeDriver(ChromeDriverService, ChromeOptions)
   */
  public ChromeDriver(ChromeOptions options) {
    this(options, ClientConfig.defaultConfig());
  }

  public ChromeDriver(ChromeOptions options, ClientConfig clientConfig) {
    this(ChromeDriverService.createDefaultService(), options, clientConfig);
  }

  /**
   * Creates a new ChromeDriver instance with the specified options. The {@code service} will be
   * started along with the driver, and shutdown upon calling {@link #quit()}.
   *
   * @param service The service to use.
   * @param options The options required from ChromeDriver.
   */
  public ChromeDriver(ChromeDriverService service, ChromeOptions options) {
    this(service, options, ClientConfig.defaultConfig());
  }

  public ChromeDriver(
      ChromeDriverService service, ChromeOptions options, ClientConfig clientConfig) {
    super(
        generateExecutor(service, options, clientConfig),
        options,
        ChromeOptions.CAPABILITY,
        clientConfig);
    casting = new AddHasCasting().getImplementation(getCapabilities(), getExecuteMethod());
    cdp = new AddHasCdp().getImplementation(getCapabilities(), getExecuteMethod());
  }

  private static ChromeDriverCommandExecutor generateExecutor(
      ChromeDriverService service, ChromeOptions options, ClientConfig clientConfig) {
    Require.nonNull("Driver service", service);
    Require.nonNull("Driver options", options);
    Require.nonNull("Driver clientConfig", clientConfig);

    String recordPath = options.getRecordPath();
    if (recordPath != null && !recordPath.isEmpty()) {
      return createPipeExecutor(clientConfig, recordPath);
    }

    DriverFinder finder = new DriverFinder(service, options);
    service.setExecutable(finder.getDriverPath());
    if (finder.hasBrowserPath()) {
      options.setBinary(finder.getBrowserPath());
      options.setCapability("browserVersion", (Object) null);
    }
    return new ChromeDriverCommandExecutor(service, clientConfig);
  }

  private static ChromeDriverCommandExecutor createPipeExecutor(
      ClientConfig clientConfig, String recordPath) {
    List<String> args = new ArrayList<>();
    args.add("--pipe");
    args.add("--record");
    args.add(recordPath);
    args.add("--browser");
    args.add("chrome");
    args.add("--output");
    args.add("json");

    String smBinary = System.getenv("SELENIUM_MANAGER_BINARY");
    if (smBinary == null || smBinary.isEmpty()) {
      smBinary = System.getProperty("selenium.manager.binary");
    }
    if (smBinary == null || smBinary.isEmpty()) {
      smBinary = SeleniumManager.getInstance().getBinaryPath().toString();
    }

    ExternalProcess process =
        ExternalProcess.builder()
            .command(smBinary, args)
            .environment("SE_AVOID_STATS", "true")
            .start();

    // Poll stdout for proxy_url (process runs indefinitely in pipe mode)
    String proxyUrl = null;
    long deadline = System.nanoTime() + Duration.ofSeconds(30).toNanos();
    while (System.nanoTime() < deadline && proxyUrl == null) {
      String output = process.getOutput(StandardCharsets.UTF_8);
      if (output != null && !output.isEmpty()) {
        proxyUrl = extractProxyUrl(output);
      }
      if (proxyUrl == null) {
        try {
          Thread.sleep(Duration.ofMillis(200).toMillis());
        } catch (InterruptedException e) {
          Thread.currentThread().interrupt();
          break;
        }
      }
    }

    if (proxyUrl == null) {
      process.shutdown();
      throw new WebDriverException("proxy_url not found in selenium-manager output within timeout");
    }

    try {
      URL parsedUrl = new URL(proxyUrl);
      clientConfig = clientConfig.baseUrl(parsedUrl);

      // Store process for cleanup when driver quits
      ChromeDriverCommandExecutor executor =
          new ChromeDriverCommandExecutor(clientConfig, parsedUrl);
      executor.pipeProcess = process;
      return executor;
    } catch (java.net.MalformedURLException e) {
      process.shutdown();
      throw new WebDriverException("Invalid proxy URL: " + proxyUrl, e);
    }
  }

  private static String extractProxyUrl(String output) {
    // SM prints {"proxy_url":"http://localhost:PORT1","session_port":PORT2} directly to stdout
    for (String line : output.split("\n")) {
      line = line.trim();
      if (line.contains("proxy_url")) {
        try {
          @SuppressWarnings("unchecked")
          Map<String, Object> json = new Json().toType(line, Map.class);
          Object url = json.get("proxy_url");
          if (url instanceof String) {
            return (String) url;
          }
        } catch (Exception ignored) {
          // try next line
        }
      }
    }
    return null;
  }

  @Beta
  public static RemoteWebDriverBuilder builder() {
    return RemoteWebDriver.builder().oneOf(new ChromeOptions());
  }

  private static class ChromeDriverCommandExecutor extends HttpCommandExecutor {
    ExternalProcess pipeProcess;

    public ChromeDriverCommandExecutor(ClientConfig clientConfig, URL remoteUrl) {
      super(getExtraCommands(), remoteUrl, clientConfig);
    }

    public ChromeDriverCommandExecutor(DriverService service, ClientConfig clientConfig) {
      super(getExtraCommands(), service.getUrl(), clientConfig);
    }

    @Override
    public void close() {
      if (pipeProcess != null) {
        pipeProcess.shutdown();
      }
    }

    private static Map<String, CommandInfo> getExtraCommands() {
      return Stream.of(
              new AddHasCasting().getAdditionalCommands(), new AddHasCdp().getAdditionalCommands())
          .flatMap(m -> m.entrySet().stream())
          .collect(Collectors.toUnmodifiableMap(Map.Entry::getKey, Map.Entry::getValue));
    }
  }
}
