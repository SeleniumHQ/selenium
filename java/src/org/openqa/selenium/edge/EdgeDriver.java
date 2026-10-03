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
package org.openqa.selenium.edge;

import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.openqa.selenium.Beta;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.chromium.ChromiumDriver;
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
 * A {@link WebDriver} implementation that controls an Edge browser running on the local machine. It
 * requires an <code>edgedriver</code> executable to be available in PATH.
 *
 * @see <a href="https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/">Microsoft
 *     WebDriver</a>
 */
public class EdgeDriver extends ChromiumDriver {

  public EdgeDriver() {
    this(new EdgeOptions());
  }

  public EdgeDriver(EdgeOptions options) {
    this(options, ClientConfig.defaultConfig());
  }

  public EdgeDriver(EdgeOptions options, ClientConfig clientConfig) {
    this(new EdgeDriverService.Builder().build(), options, clientConfig);
  }

  public EdgeDriver(EdgeDriverService service) {
    this(service, new EdgeOptions());
  }

  public EdgeDriver(EdgeDriverService service, EdgeOptions options) {
    this(service, options, ClientConfig.defaultConfig());
  }

  public EdgeDriver(EdgeDriverService service, EdgeOptions options, ClientConfig clientConfig) {
    super(
        generateExecutor(service, options, clientConfig),
        options,
        EdgeOptions.CAPABILITY,
        clientConfig);
    casting = new AddHasCasting().getImplementation(getCapabilities(), getExecuteMethod());
    cdp = new AddHasCdp().getImplementation(getCapabilities(), getExecuteMethod());
  }

  private static EdgeDriverCommandExecutor generateExecutor(
      EdgeDriverService service, EdgeOptions options, ClientConfig clientConfig) {
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
    return new EdgeDriverCommandExecutor(service, clientConfig);
  }

  @Beta
  public static RemoteWebDriverBuilder builder() {
    return RemoteWebDriver.builder().oneOf(new EdgeOptions());
  }

  private static EdgeDriverCommandExecutor createPipeExecutor(
      ClientConfig clientConfig, String recordPath) {
    List<String> args = new ArrayList<>();
    args.add("--pipe");
    args.add("--record");
    args.add(recordPath);
    args.add("--browser");
    args.add("edge");
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

      EdgeDriverCommandExecutor executor =
          new EdgeDriverCommandExecutor(clientConfig, parsedUrl);
      executor.pipeProcess = process;
      return executor;
    } catch (java.net.MalformedURLException e) {
      process.shutdown();
      throw new WebDriverException("Invalid proxy URL: " + proxyUrl, e);
    }
  }

  private static String extractProxyUrl(String output) {
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
        }
      }
    }
    return null;
  }

  private static class EdgeDriverCommandExecutor extends HttpCommandExecutor {
    ExternalProcess pipeProcess;

    public EdgeDriverCommandExecutor(DriverService service, ClientConfig clientConfig) {
      super(getExtraCommands(), service.getUrl(), clientConfig);
    }

    public EdgeDriverCommandExecutor(ClientConfig clientConfig, URL remoteUrl) {
      super(getExtraCommands(), remoteUrl, clientConfig);
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
