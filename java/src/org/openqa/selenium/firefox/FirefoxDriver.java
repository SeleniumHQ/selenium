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

package org.openqa.selenium.firefox;

import static org.openqa.selenium.remote.CapabilityType.PROXY;

import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.manager.SeleniumManager;
import org.openqa.selenium.os.ExternalProcess;
import org.openqa.selenium.remote.CommandInfo;
import org.openqa.selenium.remote.FileDetector;
import org.openqa.selenium.remote.HttpCommandExecutor;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.RemoteWebDriverBuilder;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.service.DriverCommandExecutor;
import org.openqa.selenium.remote.service.DriverFinder;
import org.openqa.selenium.remote.service.DriverService;

/**
 * An implementation of the {#link WebDriver} interface that drives Firefox.
 *
 * <p>The best way to construct a {@code FirefoxDriver} with various options is to make use of the
 * {@link FirefoxOptions}, like so:
 *
 * <pre>
 * FirefoxOptions options = new FirefoxOptions()
 *     .addPreference("browser.startup.page", 1)
 *     .addPreference("browser.startup.homepage", "https://www.google.co.uk")
 *     .setAcceptInsecureCerts(true)
 *     .setHeadless(true);
 * WebDriver driver = new FirefoxDriver(options);
 * </pre>
 */
public class FirefoxDriver extends RemoteWebDriver
    implements HasExtensions, HasFullPageScreenshot, HasContext, HasBiDi {

  private static final Logger LOG = Logger.getLogger(FirefoxDriver.class.getName());
  private final Capabilities capabilities;
  private final HasExtensions extensions;
  private final HasFullPageScreenshot fullPageScreenshot;
  private final HasContext context;

  /**
   * Creates a new FirefoxDriver using the {@link GeckoDriverService#createDefaultService)} server
   * configuration.
   *
   * @see #FirefoxDriver(FirefoxDriverService, FirefoxOptions)
   */
  public FirefoxDriver() {
    this(new FirefoxOptions());
  }

  /**
   * Creates a new FirefoxDriver instance with the specified options.
   *
   * @param options The options to use.
   * @see #FirefoxDriver(FirefoxDriverService, FirefoxOptions)
   */
  public FirefoxDriver(FirefoxOptions options) {
    this(options, ClientConfig.defaultConfig());
  }

  public FirefoxDriver(FirefoxOptions options, ClientConfig clientConfig) {
    this(GeckoDriverService.createDefaultService(), options, clientConfig);
  }

  /**
   * Creates a new FirefoxDriver instance. The {@code service} will be started along with the
   * driver, and shutdown upon calling {@link #quit()}.
   *
   * @param service The service to use.
   * @see RemoteWebDriver#RemoteWebDriver(org.openqa.selenium.remote.CommandExecutor, Capabilities)
   */
  public FirefoxDriver(FirefoxDriverService service) {
    this(service, new FirefoxOptions());
  }

  public FirefoxDriver(FirefoxDriverService service, FirefoxOptions options) {
    this(service, options, ClientConfig.defaultConfig());
  }

  public FirefoxDriver(
      FirefoxDriverService service, FirefoxOptions options, ClientConfig clientConfig) {
    this(generateExecutor(service, options, clientConfig), options, clientConfig);
  }

  private static FirefoxDriverCommandExecutor generateExecutor(
      FirefoxDriverService service, FirefoxOptions options, ClientConfig clientConfig) {
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
    return new FirefoxDriverCommandExecutor(service, clientConfig);
  }

  private static FirefoxDriverCommandExecutor createPipeExecutor(
      ClientConfig clientConfig, String recordPath) {
    List<String> args = new ArrayList<>();
    args.add("--pipe");
    args.add("--record");
    args.add(recordPath);
    args.add("--browser");
    args.add("firefox");
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

      FirefoxDriverCommandExecutor executor =
          new FirefoxDriverCommandExecutor(clientConfig, parsedUrl);
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

  private FirefoxDriver(
      FirefoxDriverCommandExecutor executor, FirefoxOptions options, ClientConfig clientConfig) {
    super(executor, checkCapabilitiesAndProxy(options), clientConfig);
    extensions = new AddHasExtensions().getImplementation(getCapabilities(), getExecuteMethod());
    fullPageScreenshot =
        new AddHasFullPageScreenshot().getImplementation(getCapabilities(), getExecuteMethod());
    context = new AddHasContext().getImplementation(getCapabilities(), getExecuteMethod());

    this.capabilities = new ImmutableCapabilities(super.getCapabilities());
  }

  @Beta
  public static RemoteWebDriverBuilder builder() {
    return RemoteWebDriver.builder().oneOf(new FirefoxOptions());
  }

  /** Check capabilities and proxy if it is set */
  private static Capabilities checkCapabilitiesAndProxy(Capabilities capabilities) {
    // TODO I think we can remove this null check
    //noinspection ConstantValue
    if (capabilities == null) {
      return new ImmutableCapabilities();
    }

    MutableCapabilities caps = new MutableCapabilities(capabilities);

    // Ensure that the proxy is in a state fit to be sent to the extension
    Proxy proxy = Proxy.extractFrom(capabilities);
    if (proxy != null) {
      caps.setCapability(PROXY, proxy);
    }

    return caps;
  }

  @Override
  public Capabilities getCapabilities() {
    return capabilities;
  }

  @Override
  public void setFileDetector(FileDetector detector) {
    throw new WebDriverException(
        "Setting the file detector only works on remote webdriver instances obtained "
            + "via RemoteWebDriver");
  }

  @Override
  public String installExtension(Path path) {
    Require.nonNull("Path", path);
    return extensions.installExtension(path);
  }

  @Override
  public String installExtension(Path path, Boolean temporary) {
    Require.nonNull("Path", path);
    Require.nonNull("Temporary", temporary);
    return extensions.installExtension(path, temporary);
  }

  @Override
  public void uninstallExtension(String extensionId) {
    Require.nonNull("Extension ID", extensionId);
    extensions.uninstallExtension(extensionId);
  }

  /**
   * Capture the full page screenshot and store it in the specified location.
   *
   * @param <X> Return type for getFullPageScreenshotAs.
   * @param outputType target type, @see OutputType
   * @return Object in which is stored information about the screenshot.
   * @throws WebDriverException on failure.
   */
  @Override
  public <X> X getFullPageScreenshotAs(OutputType<X> outputType) throws WebDriverException {
    Require.nonNull("OutputType", outputType);

    return fullPageScreenshot.getFullPageScreenshotAs(outputType);
  }

  @Override
  public FirefoxCommandContext getContext() {
    return context.getContext();
  }

  @Override
  public void setContext(FirefoxCommandContext commandContext) {
    Require.nonNull("Firefox Command Context", commandContext);
    context.setContext(commandContext);
  }

  @Override
  public void quit() {
    super.quit();
  }

  public static final class SystemProperty {

    /** System property that defines the location of the Firefox executable file. */
    public static final String BROWSER_BINARY = "webdriver.firefox.bin";

    /**
     * System property that defines the profile that should be used as a template. When the driver
     * starts, it will make a copy of the profile it is using, rather than using that profile
     * directly.
     */
    public static final String BROWSER_PROFILE = "webdriver.firefox.profile";
  }

  private static class FirefoxDriverCommandExecutor extends HttpCommandExecutor {
    ExternalProcess pipeProcess;

    public FirefoxDriverCommandExecutor(DriverService service, ClientConfig clientConfig) {
      super(getExtraCommands(), service.getUrl(), clientConfig);
    }

    public FirefoxDriverCommandExecutor(ClientConfig clientConfig, URL remoteUrl) {
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
              new AddHasContext().getAdditionalCommands(),
              new AddHasExtensions().getAdditionalCommands(),
              new AddHasFullPageScreenshot().getAdditionalCommands())
          .flatMap(m -> m.entrySet().stream())
          .collect(Collectors.toUnmodifiableMap(Map.Entry::getKey, Map.Entry::getValue));
    }
  }
}
