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

import static org.openqa.selenium.firefox.FirefoxOptions.FIREFOX_OPTIONS;
import static org.openqa.selenium.remote.CapabilityType.PROXY;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.internal.NewProfileExtensionConnection;
import org.openqa.selenium.internal.Killable;
import org.openqa.selenium.internal.Lock;
import org.openqa.selenium.internal.SocketLock;
import org.openqa.selenium.logging.LocalLogs;
import org.openqa.selenium.logging.NeedsLocalLogs;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.FileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.service.DriverCommandExecutor;

import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

/**
 * An implementation of the {#link WebDriver} interface that drives Firefox.
 * <p>
 * The best way to construct a {@code FirefoxDriver} with various options is to make use of the
 * {@link FirefoxOptions}, like so:
 *
 * <pre>
 *FirefoxOptions options = new FirefoxOptions()
 *    .setProfile(new FirefoxProfile());
 *WebDriver driver = new FirefoxDriver(options);
 * </pre>
 */
public class FirefoxDriver extends RemoteWebDriver implements Killable {

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

  private static final Logger LOG = Logger.getLogger(FirefoxDriver.class.getName());

  public static final String BINARY = "firefox_binary";
  public static final String PROFILE = "firefox_profile";
  public static final String MARIONETTE = "marionette";

  // Accept untrusted SSL certificates.
  @Deprecated
  public static final boolean ACCEPT_UNTRUSTED_CERTIFICATES = true;
  // Assume that the untrusted certificates will come from untrusted issuers
  // or will be self signed.
  @Deprecated
  public static final boolean ASSUME_UNTRUSTED_ISSUER = true;

  protected FirefoxBinary binary;

  public FirefoxDriver() {
    this(new FirefoxOptions());
  }

  public FirefoxDriver(FirefoxOptions options) {
    this(toExecutor(options), options.toDesiredCapabilities(), options.toRequiredCapabilities());
  }

  /**
   * @deprecated Prefer {@link FirefoxOptions#setBinary(FirefoxBinary)}.
   */
  @Deprecated
  public FirefoxDriver(FirefoxBinary binary) {
    this(new FirefoxOptions().setBinary(binary));
    warnAboutDeprecatedConstructor("FirefoxBinary", "setBinary(binary)");
  }

  public FirefoxDriver(FirefoxProfile profile) {
    this(new FirefoxOptions().setProfile(profile));
  }

  /**
   * @deprecated Prefer {@link FirefoxOptions#setBinary(FirefoxBinary)}, and
   *   {@link FirefoxOptions#setProfile(FirefoxProfile)}.
   */
  @Deprecated
  public FirefoxDriver(FirefoxBinary binary, FirefoxProfile profile) {
    this(new FirefoxOptions().setBinary(binary).setProfile(profile));
    warnAboutDeprecatedConstructor(
        "FirefoxBinary and FirefoxProfile",
        "setBinary(binary).setProfile(profile)");
  }

  public FirefoxDriver(Capabilities desiredCapabilities) {
    this(getFirefoxOptions(desiredCapabilities).addDesiredCapabilities(desiredCapabilities));
  }

  public FirefoxDriver(Capabilities desiredCapabilities, Capabilities requiredCapabilities) {
    this(getFirefoxOptions(desiredCapabilities)
             .addDesiredCapabilities(desiredCapabilities)
             .addRequiredCapabilities(requiredCapabilities));
  }

  /**
   * @deprecated Prefer {@link FirefoxOptions#setBinary(FirefoxBinary)},
   *   {@link FirefoxOptions#setProfile(FirefoxProfile)}
   */
  @Deprecated
  public FirefoxDriver(FirefoxBinary binary, FirefoxProfile profile, Capabilities capabilities) {
    this(getFirefoxOptions(capabilities)
             .setBinary(binary)
             .setProfile(profile)
             .addDesiredCapabilities(capabilities));
    warnAboutDeprecatedConstructor(
        "FirefoxBinary, FirefoxProfile, Capabilities",
        "setBinary(binary).setProfile(profile).addDesiredCapabilities(capabilities)");
  }

  /**
   * @deprecated Prefer {@link FirefoxOptions#setBinary(FirefoxBinary)},
   *   {@link FirefoxOptions#setProfile(FirefoxProfile)}
   */
  @Deprecated
  public FirefoxDriver(
      FirefoxBinary binary,
      FirefoxProfile profile,
      Capabilities desiredCapabilities,
      Capabilities requiredCapabilities) {
    this(getFirefoxOptions(desiredCapabilities)
             .setBinary(binary).setProfile(profile)
             .addDesiredCapabilities(desiredCapabilities)
             .addRequiredCapabilities(requiredCapabilities));
    warnAboutDeprecatedConstructor(
        "FirefoxBinary, FirefoxProfile, Capabilities",
        "setBinary(binary).setProfile(profile).addDesiredCapabilities(desired)" +
        ".addRequiredCapabilities(required)");
  }

  /**
   * @deprecated No replacement.
   */
  @Deprecated
  public FirefoxDriver(GeckoDriverService driverService) {
    this(new DriverCommandExecutor(driverService), null, null);
  }

  /**
   * @deprecated No replacement.
   */
  @Deprecated
  public FirefoxDriver(GeckoDriverService driverService, Capabilities desiredCapabilities) {
    this(new DriverCommandExecutor(driverService), desiredCapabilities, null);
  }

  /**
   * @deprecated No replacement.
   */
  @Deprecated
  public FirefoxDriver(
      GeckoDriverService driverService,
      Capabilities desiredCapabilities,
      Capabilities requiredCapabilities) {
    this(new DriverCommandExecutor(driverService), desiredCapabilities, requiredCapabilities);
  }

  private FirefoxDriver(
      CommandExecutor executor,
      Capabilities desiredCapabilities,
      Capabilities requiredCapabilities) {
    super(executor,
          dropCapabilities(desiredCapabilities),
          dropCapabilities(requiredCapabilities));
  }

  private static CommandExecutor toExecutor(FirefoxOptions options) {
    if (options.isLegacy()) {
      return new FirefoxDriver.LazyCommandExecutor(options.getBinary(), options.getProfile());

    } else {
      GeckoDriverService.Builder builder = new GeckoDriverService.Builder().usingPort(0);
      Optional<FirefoxBinary> binary = options.getBinaryOrNull();
      if (binary.isPresent()) {
        builder.usingFirefoxBinary(binary.get());
      }
      return new DriverCommandExecutor(builder.build());
    }
  }

  private static FirefoxOptions getFirefoxOptions(Capabilities capabilities) {
    FirefoxOptions options = new FirefoxOptions();

    if (capabilities == null) {
      return options;
    }

    Object rawOptions = capabilities.getCapability(FIREFOX_OPTIONS);
    if (rawOptions != null) {
      if (rawOptions instanceof Map) {
        try {
          @SuppressWarnings("unchecked")
          Map<String, Object> map = (Map<String, Object>) rawOptions;
          rawOptions = FirefoxOptions.fromJsonMap(map);
        } catch (IOException e) {
          throw new WebDriverException(e);
        }
      }
      if (rawOptions != null && !(rawOptions instanceof FirefoxOptions)) {
        throw new WebDriverException(
            "Firefox option was set, but is not a FirefoxOption: " + rawOptions);
      }
      options = (FirefoxOptions) rawOptions;
    }

    options.setLegacy(!capabilities.is(MARIONETTE));
    return options;
  }

  private void warnAboutDeprecatedConstructor(String arguments, String alternative) {
    LOG.warning(String.format(
        "The FirefoxDriver constructor taking %s has been deprecated. Please use the " +
        "FirefoxDriver(FirefoxOptions) constructor, configuring the FirefoxOptions like this: " +
        "new FirefoxOptions().%s",
        arguments,
        alternative));
  }

  @Override
  public void setFileDetector(FileDetector detector) {
    throw new WebDriverException(
        "Setting the file detector only works on remote webdriver instances obtained " +
        "via RemoteWebDriver");
  }

  /**
   * Attempt to forcibly kill this Killable at the OS level. Useful where the extension has
   * stopped responding, and you don't want to leak resources. Should not ordinarily be called.
   */
  public void kill() {
    if (this.getCommandExecutor() instanceof LazyCommandExecutor) {
      ((LazyCommandExecutor) this.getCommandExecutor()).binary.quit();
    }
  }

  @Override
  public Options manage() {
    return new RemoteWebDriverOptions() {
      @Override
      public Timeouts timeouts() {
        return new RemoteTimeouts() {
          public Timeouts implicitlyWait(long time, TimeUnit unit) {
            execute(DriverCommand.SET_TIMEOUT, ImmutableMap.of(
                "type", "implicit",
                "ms", TimeUnit.MILLISECONDS.convert(time, unit)));
            return this;
          }

          public Timeouts setScriptTimeout(long time, TimeUnit unit) {
            execute(DriverCommand.SET_TIMEOUT, ImmutableMap.of(
                "type", "script",
                "ms", TimeUnit.MILLISECONDS.convert(time, unit)));
            return this;
          }
        };
      }
    };
  }

  private static boolean isLegacy(Capabilities desiredCapabilities) {
    Boolean forceMarionette = forceMarionetteFromSystemProperty();
    if (forceMarionette != null) {
      return !forceMarionette;
    }
    Object marionette = desiredCapabilities.getCapability(MARIONETTE);
    return marionette instanceof Boolean && ! (Boolean) marionette;
  }

  private static Boolean forceMarionetteFromSystemProperty() {
    String useMarionette = System.getProperty(SystemProperty.DRIVER_USE_MARIONETTE);
    if (useMarionette == null) {
      return null;
    }
    return Boolean.valueOf(useMarionette);
  }

  @Override
  protected void startClient(Capabilities desiredCapabilities, Capabilities requiredCapabilities) {
    if (isLegacy(desiredCapabilities)) {
      LazyCommandExecutor exe = (LazyCommandExecutor) getCommandExecutor();

      // TODO(simon): Make this not sinfully ugly
      ExtensionConnection connection = connectTo(exe.binary, exe.profile, "localhost");
      exe.setConnection(connection);

      try {
        connection.start();
      } catch (IOException e) {
        throw new WebDriverException("An error occurred while connecting to Firefox", e);
      }

    }
  }

  protected ExtensionConnection connectTo(FirefoxBinary binary, FirefoxProfile profile,
      String host) {
    Lock lock = obtainLock(profile);
    try {
      FirefoxBinary bin = binary == null ? new FirefoxBinary() : binary;
      return new NewProfileExtensionConnection(lock, bin, profile, host);
    } catch (Exception e) {
      throw new WebDriverException(e);
    }
  }

  protected Lock obtainLock(FirefoxProfile profile) {
    return new SocketLock();
  }

  @Override
  protected void stopClient() {
    if (this.getCommandExecutor() instanceof LazyCommandExecutor) {
      ((LazyCommandExecutor) this.getCommandExecutor()).quit();
    }
  }

  /**
   * Drops capabilities that we shouldn't send over the wire.
   *
   * Used for capabilities which aren't BeanToJson-convertable, and are only used by the local
   * launcher.
   */
  private static Capabilities dropCapabilities(Capabilities capabilities) {
    if (capabilities == null) {
      return new DesiredCapabilities();
    }

    DesiredCapabilities caps;

    if (isLegacy(capabilities)) {
      final Set<String> toRemove = Sets.newHashSet(BINARY, PROFILE);
      caps = new DesiredCapabilities(
          Maps.filterKeys(capabilities.asMap(), key -> !toRemove.contains(key)));
    } else {
      caps = new DesiredCapabilities(capabilities);
    }

    // Ensure that the proxy is in a state fit to be sent to the extension
    Proxy proxy = Proxy.extractFrom(capabilities);
    if (proxy != null) {
      caps.setCapability(PROXY, new BeanToJsonConverter().convert(proxy));
    }

    return caps;
  }

  public <X> X getScreenshotAs(OutputType<X> target) {
    // Get the screenshot as base64.
    String base64 = execute(DriverCommand.SCREENSHOT).getValue().toString();
    // ... and convert it.
    return target.convertFromBase64Png(base64);
  }

  public static class LazyCommandExecutor implements CommandExecutor, NeedsLocalLogs {
    private ExtensionConnection connection;
    private final FirefoxBinary binary;
    private final FirefoxProfile profile;
    private LocalLogs logs = LocalLogs.getNullLogger();

    LazyCommandExecutor(FirefoxBinary binary, FirefoxProfile profile) {
      this.binary = binary;
      this.profile = profile;
    }

    public void setConnection(ExtensionConnection connection) {
      this.connection = connection;
      connection.setLocalLogs(logs);
    }

    public void quit() {
      if (connection != null) {
        connection.quit();
        connection = null;
      }
      if (profile != null) {
        profile.cleanTemporaryModel();
      }
    }

    public Response execute(Command command) throws IOException {
      if (connection == null) {
        if (command.getName().equals(DriverCommand.QUIT)) {
          return new Response();
        }
        throw new NoSuchSessionException(
            "The FirefoxDriver cannot be used after quit() was called.");
      }
      return connection.execute(command);
    }

    public void setLocalLogs(LocalLogs logs) {
      this.logs = logs;
      if (connection != null) {
        connection.setLocalLogs(logs);
      }
    }

    public URI getAddressOfRemoteServer() {
      return connection.getAddressOfRemoteServer();
    }
  }
}
