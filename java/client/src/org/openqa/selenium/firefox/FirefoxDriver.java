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

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.PersistentCapabilities;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriverException;
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
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.html5.RemoteWebStorage;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.service.DriverCommandExecutor;
import org.openqa.selenium.remote.service.DriverService;

import java.net.URI;
import java.nio.file.Path;
import java.util.Optional;
import java.util.ServiceLoader;
import java.util.Set;
import java.util.stream.StreamSupport;

import static java.nio.charset.StandardCharsets.UTF_8;
import static java.util.Collections.singletonMap;
import static org.openqa.selenium.remote.CapabilityType.PROXY;

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
  implements WebStorage, HasExtensions, HasDevTools {

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
     * System property that defines the additional library path (Linux only).
     */
    public static final String BROWSER_LIBRARY_PATH = "webdriver.firefox.library.path";

    /**
     * System property that defines the profile that should be used as a template.
     * When the driver starts, it will make a copy of the profile it is using,
     * rather than using that profile directly.
     */
    public static final String BROWSER_PROFILE = "webdriver.firefox.profile";

    /**
     * System property that defines the location of the webdriver.xpi browser extension to install
     * in the browser. If not set, the prebuilt extension bundled with this class will be used.
     */
    public static final String DRIVER_XPI_PROPERTY = "webdriver.firefox.driver";

    /**
     * Boolean system property that instructs FirefoxDriver to use Marionette backend,
     * overrides any capabilities specified by the user
     */
    public static final String DRIVER_USE_MARIONETTE = "webdriver.firefox.marionette";
  }

  /**
   * @deprecated Use {@link Capability#BINARY}
   */
  @Deprecated
  public static final String BINARY = Capability.BINARY;

  /**
   * @deprecated Use {@link Capability#PROFILE}
   */
  @Deprecated
  public static final String PROFILE = Capability.PROFILE;

  /**
   * @deprecated Use {@link Capability#MARIONETTE}
   */
  @Deprecated
  public static final String MARIONETTE = Capability.MARIONETTE;

  public static final class Capability {
    public static final String BINARY = "firefox_binary";
    public static final String PROFILE = "firefox_profile";
    public static final String MARIONETTE = "marionette";
  }

  private static class ExtraCommands {
    static String INSTALL_EXTENSION = "installExtension";
    static String UNINSTALL_EXTENSION = "uninstallExtension";
    static String FULL_PAGE_SCREENSHOT = "fullPageScreenshot";
  }

  private static final ImmutableMap<String, CommandInfo> EXTRA_COMMANDS = ImmutableMap.of(
      ExtraCommands.INSTALL_EXTENSION,
      new CommandInfo("/session/:sessionId/moz/addon/install", HttpMethod.POST),
      ExtraCommands.UNINSTALL_EXTENSION,
      new CommandInfo("/session/:sessionId/moz/addon/uninstall", HttpMethod.POST),
      ExtraCommands.FULL_PAGE_SCREENSHOT,
      new CommandInfo("/session/:sessionId/moz/screenshot/full", HttpMethod.GET)
  );

  private static class FirefoxDriverCommandExecutor extends DriverCommandExecutor {
    public FirefoxDriverCommandExecutor(DriverService service) {
      super(service, EXTRA_COMMANDS);
    }
  }

  private final Capabilities capabilities;
  protected FirefoxBinary binary;
  private final RemoteWebStorage webStorage;
  private final Optional<URI> cdpUri;
  private DevTools devTools;

  public FirefoxDriver() {
    this(new FirefoxOptions());
  }

  /**
   * @deprecated Use {@link #FirefoxDriver(FirefoxOptions)}.
   */
  @Deprecated
  public FirefoxDriver(Capabilities desiredCapabilities) {
    this(new FirefoxOptions(Require.nonNull("Capabilities", desiredCapabilities)));
  }

  /**
   * @deprecated Use {@link #FirefoxDriver(FirefoxDriverService, FirefoxOptions)}.
   */
  @Deprecated
  public FirefoxDriver(FirefoxDriverService service, Capabilities desiredCapabilities) {
    this(
        Require.nonNull("Driver service", service),
        new FirefoxOptions(desiredCapabilities));
  }

  public FirefoxDriver(FirefoxOptions options) {
    this(toExecutor(options), options);
  }

  public FirefoxDriver(FirefoxDriverService service) {
    this(service, new FirefoxOptions());
  }

  public FirefoxDriver(FirefoxDriverService service, FirefoxOptions options) {
    this(new FirefoxDriverCommandExecutor(service), options);
  }

  private FirefoxDriver(FirefoxDriverCommandExecutor executor, FirefoxOptions options) {
    super(executor, dropCapabilities(options));
    webStorage = new RemoteWebStorage(getExecuteMethod());

    Capabilities capabilities = super.getCapabilities();
    HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();
    Optional<URI> cdpUri = CdpEndpointFinder.getReportedUri("moz:debuggerAddress", capabilities)
      .flatMap(reported -> CdpEndpointFinder.getCdpEndPoint(clientFactory, reported));

    this.cdpUri = cdpUri;
    this.capabilities = cdpUri.map(uri ->
        new ImmutableCapabilities(
            new PersistentCapabilities(capabilities)
                .setCapability("se:cdp", uri.toString())
                .setCapability("se:cdpVersion", "85")))
        .orElse(new ImmutableCapabilities(capabilities));
  }

  private static FirefoxDriverCommandExecutor toExecutor(FirefoxOptions options) {
    Require.nonNull("Options to construct executor from", options);

    String sysProperty = System.getProperty(SystemProperty.DRIVER_USE_MARIONETTE);
    boolean isLegacy = (sysProperty != null && ! Boolean.parseBoolean(sysProperty))
                       || options.isLegacy();

    FirefoxDriverService.Builder<?, ?> builder =
        StreamSupport.stream(ServiceLoader.load(DriverService.Builder.class).spliterator(), false)
            .filter(b -> b instanceof FirefoxDriverService.Builder)
            .map(FirefoxDriverService.Builder.class::cast)
            .filter(b -> b.isLegacy() == isLegacy)
            .findFirst().orElseThrow(WebDriverException::new);

    return new FirefoxDriverCommandExecutor(builder.withOptions(options).build());
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

  private static boolean isLegacy(Capabilities desiredCapabilities) {
    Boolean forceMarionette = forceMarionetteFromSystemProperty();
    if (forceMarionette != null) {
      return !forceMarionette;
    }
    Object marionette = desiredCapabilities.getCapability(Capability.MARIONETTE);
    return marionette instanceof Boolean && ! (Boolean) marionette;
  }

  @Override
  public String installExtension(Path path) {
    return (String) execute(ExtraCommands.INSTALL_EXTENSION,
                            ImmutableMap.of("path", path.toAbsolutePath().toString(),
                                            "temporary", false)).getValue();
  }

  @Override
  public void uninstallExtension(String extensionId) {
    execute(ExtraCommands.UNINSTALL_EXTENSION, singletonMap("id", extensionId));
  }

  /**
   * Capture the full page screenshot and store it in the specified location.
   *
   * @param <X> Return type for getFullPageScreenshotAs.
   * @param outputType target type, @see OutputType
   * @return Object in which is stored information about the screenshot.
   * @throws WebDriverException on failure.
   */
  public <X> X getFullPageScreenshotAs(OutputType<X> outputType) throws WebDriverException {
    Response response = execute(ExtraCommands.FULL_PAGE_SCREENSHOT);
    Object result = response.getValue();
    if (result instanceof String) {
      String base64EncodedPng = (String) result;
      return outputType.convertFromBase64Png(base64EncodedPng);
    } else if (result instanceof byte[]) {
      String base64EncodedPng = new String((byte[]) result, UTF_8);
      return outputType.convertFromBase64Png(base64EncodedPng);
    } else {
      throw new RuntimeException(String.format("Unexpected result for %s command: %s",
                                               ExtraCommands.FULL_PAGE_SCREENSHOT,
                                               result == null ? "null" : result.getClass().getName() + " instance"));
    }
  }

  private static Boolean forceMarionetteFromSystemProperty() {
    String useMarionette = System.getProperty(SystemProperty.DRIVER_USE_MARIONETTE);
    if (useMarionette == null) {
      return null;
    }
    return Boolean.valueOf(useMarionette);
  }

  /**
   * Drops capabilities that we shouldn't send over the wire.
   *
   * Used for capabilities which aren't BeanToJson-convertable, and are only used by the local
   * launcher.
   */
  private static Capabilities dropCapabilities(Capabilities capabilities) {
    if (capabilities == null) {
      return new ImmutableCapabilities();
    }

    MutableCapabilities caps;

    if (isLegacy(capabilities)) {
      final Set<String> toRemove = Sets.newHashSet(Capability.BINARY, Capability.PROFILE);
      caps = new MutableCapabilities(
          Maps.filterKeys(capabilities.asMap(), key -> !toRemove.contains(key)));
    } else {
      caps = new MutableCapabilities(capabilities);
    }

    // Ensure that the proxy is in a state fit to be sent to the extension
    Proxy proxy = Proxy.extractFrom(capabilities);
    if (proxy != null) {
      caps.setCapability(PROXY, proxy);
    }

    return caps;
  }

  @Override
  public DevTools getDevTools() {
    if (devTools == null) {
      URI wsUri = cdpUri.orElseThrow(() ->
          new DevToolsException("This version of Firefox or geckodriver does not support CDP"));

      HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();

      ClientConfig wsConfig = ClientConfig.defaultConfig().baseUri(wsUri);
      HttpClient wsClient = clientFactory.createClient(wsConfig);

      Connection connection = new Connection(wsClient, wsUri.toString());
      CdpInfo cdpInfo = new CdpVersionFinder().match("85.0").orElseGet(NoOpCdpInfo::new);
      devTools = new DevTools(cdpInfo::getDomains, connection);
    }
    return devTools;
  }
}
