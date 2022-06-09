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

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.PersistentCapabilities;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.BiDiException;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.devtools.CdpEndpointFinder;
import org.openqa.selenium.devtools.CdpInfo;
import org.openqa.selenium.devtools.CdpVersionFinder;
import org.openqa.selenium.devtools.Connection;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.devtools.HasDevTools;
import org.openqa.selenium.devtools.noop.NoOpCdpInfo;
import org.openqa.selenium.html5.LocalStorage;
import org.openqa.selenium.html5.SessionStorage;
import org.openqa.selenium.html5.WebStorage;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.CommandInfo;
import org.openqa.selenium.remote.FileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.RemoteWebDriverBuilder;
import org.openqa.selenium.remote.html5.RemoteWebStorage;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.service.DriverCommandExecutor;
import org.openqa.selenium.remote.service.DriverService;

import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

/**
 * An implementation of the {#link WebDriver} interface that drives Firefox.
 * <p>
 * The best way to construct a {@code FirefoxDriver} with various options is to make use of the
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
  implements WebStorage, HasExtensions, HasFullPageScreenshot, HasContext, HasDevTools, HasBiDi {

  private static final Logger LOG = Logger.getLogger(FirefoxDriver.class.getName());
  private final Capabilities capabilities;
  private final RemoteWebStorage webStorage;
  private final HasExtensions extensions;
  private final HasFullPageScreenshot fullPageScreenshot;
  private final HasContext context;
  private final Optional<URI> cdpUri;
  private final Optional<URI> biDiUri;
  protected FirefoxBinary binary;
  private DevTools devTools;
  private BiDi biDi;
  public FirefoxDriver() {
    this(new FirefoxOptions());
  }

  public FirefoxDriver(FirefoxOptions options) {
    this(new FirefoxDriverCommandExecutor(GeckoDriverService.createDefaultService()), options);
  }

  public FirefoxDriver(FirefoxDriverService service) {
    this(service, new FirefoxOptions());
  }

  public FirefoxDriver(FirefoxDriverService service, FirefoxOptions options) {
    this(new FirefoxDriverCommandExecutor(service), options);
  }

  private FirefoxDriver(FirefoxDriverCommandExecutor executor, FirefoxOptions options) {
    super(executor, checkCapabilitiesAndProxy(options));
    webStorage = new RemoteWebStorage(getExecuteMethod());
    extensions = new AddHasExtensions().getImplementation(getCapabilities(), getExecuteMethod());
    fullPageScreenshot = new AddHasFullPageScreenshot().getImplementation(getCapabilities(), getExecuteMethod());
    context = new AddHasContext().getImplementation(getCapabilities(), getExecuteMethod());

    Capabilities capabilities = super.getCapabilities();
    HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();
    Optional<URI> cdpUri = CdpEndpointFinder.getReportedUri("moz:debuggerAddress", capabilities)
      .flatMap(reported -> CdpEndpointFinder.getCdpEndPoint(clientFactory, reported));

    Optional<String> webSocketUrl = Optional.ofNullable((String) capabilities.getCapability("webSocketUrl"));

    this.biDiUri = webSocketUrl.map(uri -> {
      try {
        return new URI(uri);
      } catch (URISyntaxException e) {
        LOG.warning(e.getMessage());
      }
      return null;
    });

    this.cdpUri = cdpUri;
    this.capabilities = cdpUri.map(uri ->
                                     new ImmutableCapabilities(
                                       new PersistentCapabilities(capabilities)
                                         .setCapability("se:cdp", uri.toString())
                                         .setCapability("se:cdpVersion", "85.0")))
      .orElse(new ImmutableCapabilities(capabilities));
  }

  @Beta
  public static RemoteWebDriverBuilder builder() {
    return RemoteWebDriver.builder().oneOf(new FirefoxOptions());
  }

  /**
   * Check capabilities and proxy if it is set
   */
  private static Capabilities checkCapabilitiesAndProxy(Capabilities capabilities) {
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
      "Setting the file detector only works on remote webdriver instances obtained " +
      "via RemoteWebDriver");
  }

  @Override
  public LocalStorage getLocalStorage() {
    return webStorage.getLocalStorage();
  }

  @Override
  public SessionStorage getSessionStorage() {
    return webStorage.getSessionStorage();
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
  public Optional<DevTools> maybeGetDevTools() {
    if (devTools != null) {
      return Optional.of(devTools);
    }

    if (!cdpUri.isPresent()) {
      return Optional.empty();
    }

    URI wsUri = cdpUri.orElseThrow(() ->
      new DevToolsException("This version of Firefox or geckodriver does not support CDP"));
    HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();

    ClientConfig wsConfig = ClientConfig.defaultConfig().baseUri(wsUri);
    HttpClient wsClient = clientFactory.createClient(wsConfig);

    Connection connection = new Connection(wsClient, wsUri.toString());
    CdpInfo cdpInfo = new CdpVersionFinder().match("85.0").orElseGet(NoOpCdpInfo::new);
    devTools = new DevTools(cdpInfo::getDomains, connection);

    return Optional.of(devTools);
  }

  @Override
  public DevTools getDevTools() {
    if (!cdpUri.isPresent()) {
      throw new DevToolsException("This version of Firefox or geckodriver does not support CDP");
    }

    return maybeGetDevTools()
      .orElseThrow(() -> new DevToolsException("Unable to initialize CDP connection"));
  }

  @Override
  public Optional<BiDi> maybeGetBiDi() {
    if (biDi != null) {
      return Optional.of(biDi);
    }

    if (!biDiUri.isPresent()) {
      return Optional.empty();
    }

    URI wsUri = biDiUri.orElseThrow(
      () -> new BiDiException("This version of Firefox or geckodriver does not support BiDi"));

    HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();
    ClientConfig wsConfig = ClientConfig.defaultConfig().baseUri(wsUri);
    HttpClient wsClient = clientFactory.createClient(wsConfig);

    org.openqa.selenium.bidi.Connection connection =
      new org.openqa.selenium.bidi.Connection(wsClient, wsUri.toString());

    biDi = new BiDi(connection);

    return Optional.of(biDi);
  }

  @Override
  public BiDi getBiDi() {
    if (!biDiUri.isPresent()) {
      throw new BiDiException("This version of Firefox or geckodriver does not support Bidi");
    }

    return maybeGetBiDi()
      .orElseThrow(() -> new DevToolsException("Unable to initialize Bidi connection"));
  }

  public static final class SystemProperty {

    /**
     * System property that defines the location of the Firefox executable file.
     */
    public static final String BROWSER_BINARY = "webdriver.firefox.bin";

    /**
     * System property that defines the location of the file where Firefox log should be stored.
     */
    public static final String BROWSER_LOGFILE = "webdriver.firefox.logfile";

    /**
     * System property that defines the profile that should be used as a template.
     * When the driver starts, it will make a copy of the profile it is using,
     * rather than using that profile directly.
     */
    public static final String BROWSER_PROFILE = "webdriver.firefox.profile";
  }

  public static final class Capability {

    public static final String BINARY = "firefox_binary";
    public static final String PROFILE = "firefox_profile";
    public static final String MARIONETTE = "marionette";
  }

  private static class FirefoxDriverCommandExecutor extends DriverCommandExecutor {

    public FirefoxDriverCommandExecutor(DriverService service) {
      super(service, getExtraCommands());
    }

    private static Map<String, CommandInfo> getExtraCommands() {
      return ImmutableMap.<String, CommandInfo>builder()
        .putAll(new AddHasContext().getAdditionalCommands())
        .putAll(new AddHasExtensions().getAdditionalCommands())
        .putAll(new AddHasFullPageScreenshot().getAdditionalCommands())
        .build();
    }
  }
}
