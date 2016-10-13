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

import static org.openqa.selenium.Platform.WINDOWS;
import static org.openqa.selenium.firefox.FirefoxOptions.FIREFOX_OPTIONS;
import static org.openqa.selenium.firefox.FirefoxOptions.OLD_FIREFOX_OPTIONS;
import static org.openqa.selenium.remote.CapabilityType.ACCEPT_SSL_CERTS;
import static org.openqa.selenium.remote.CapabilityType.HAS_NATIVE_EVENTS;
import static org.openqa.selenium.remote.CapabilityType.LOGGING_PREFS;
import static org.openqa.selenium.remote.CapabilityType.PROXY;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_WEB_STORAGE;

import com.google.common.base.Predicate;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.internal.NewProfileExtensionConnection;
import org.openqa.selenium.firefox.internal.ProfilesIni;
import org.openqa.selenium.internal.Killable;
import org.openqa.selenium.internal.Lock;
import org.openqa.selenium.internal.SocketLock;
import org.openqa.selenium.logging.LocalLogs;
import org.openqa.selenium.logging.LoggingPreferences;
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

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * An implementation of the {#link WebDriver} interface that drives Firefox. This works through a
 * firefox extension, which gets installed automatically if necessary.
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

  public static final String BINARY = "firefox_binary";
  public static final String PROFILE = "firefox_profile";
  public static final String MARIONETTE = "marionette";

  // For now, only enable native events on Windows
  public static final boolean DEFAULT_ENABLE_NATIVE_EVENTS = Platform.getCurrent().is(WINDOWS);

  // Accept untrusted SSL certificates.
  @Deprecated
  public static final boolean ACCEPT_UNTRUSTED_CERTIFICATES = true;
  // Assume that the untrusted certificates will come from untrusted issuers
  // or will be self signed.
  @Deprecated
  public static final boolean ASSUME_UNTRUSTED_ISSUER = true;

  protected FirefoxBinary binary;

  public FirefoxDriver() {
    this(new FirefoxBinary(), null);
  }

  public FirefoxDriver(FirefoxProfile profile) {
    this(new FirefoxBinary(), profile);
  }

  public FirefoxDriver(Capabilities desiredCapabilities) {
    this(getBinary(desiredCapabilities), extractProfile(desiredCapabilities, null),
        desiredCapabilities);
  }

  public FirefoxDriver(Capabilities desiredCapabilities, Capabilities requiredCapabilities) {
    this(getBinary(desiredCapabilities), extractProfile(desiredCapabilities, requiredCapabilities),
        desiredCapabilities, requiredCapabilities);
  }

  private static FirefoxProfile extractProfile(Capabilities desiredCapabilities,
      Capabilities requiredCapabilities) {

    FirefoxProfile profile = null;
    Object raw = null;
    if (desiredCapabilities != null && desiredCapabilities.getCapability(PROFILE) != null) {
      raw = desiredCapabilities.getCapability(PROFILE);
    }
    if (requiredCapabilities != null && requiredCapabilities.getCapability(PROFILE) != null) {
      raw = requiredCapabilities.getCapability(PROFILE);
    }
    if (raw != null) {
      if (raw instanceof FirefoxProfile) {
        profile = (FirefoxProfile) raw;
      } else if (raw instanceof String) {
        try {
          profile = FirefoxProfile.fromJson((String) raw);
        } catch (IOException e) {
          throw new WebDriverException(e);
        }
      }
    }
    profile = getProfile(profile);

    populateProfile(profile, desiredCapabilities);
    populateProfile(profile, requiredCapabilities);

    return profile;
  }

  static Capabilities populateProfile(FirefoxProfile profile, Capabilities capabilities) {
    if (capabilities == null) {
      return capabilities;
    }
    if (capabilities.getCapability(SUPPORTS_WEB_STORAGE) != null) {
      Boolean supportsWebStorage = (Boolean) capabilities.getCapability(SUPPORTS_WEB_STORAGE);
      profile.setPreference("dom.storage.enabled", supportsWebStorage.booleanValue());
    }
    if (capabilities.getCapability(ACCEPT_SSL_CERTS) != null) {
      Boolean acceptCerts = (Boolean) capabilities.getCapability(ACCEPT_SSL_CERTS);
      profile.setAcceptUntrustedCertificates(acceptCerts);
    }
    if (capabilities.getCapability(LOGGING_PREFS) != null) {
      LoggingPreferences logsPrefs =
          (LoggingPreferences) capabilities.getCapability(LOGGING_PREFS);
      for (String logtype : logsPrefs.getEnabledLogTypes()) {
        profile.setPreference("webdriver.log." + logtype,
            logsPrefs.getLevel(logtype).intValue());
      }
    }

    if (capabilities.getCapability(HAS_NATIVE_EVENTS) != null) {
      Boolean nativeEventsEnabled = (Boolean) capabilities.getCapability(HAS_NATIVE_EVENTS);
      profile.setEnableNativeEvents(nativeEventsEnabled);
    }

    Object rawOptions = capabilities.getCapability(FIREFOX_OPTIONS);
    if (rawOptions == null) {
      rawOptions = capabilities.getCapability(OLD_FIREFOX_OPTIONS);
    }
    if (rawOptions != null && !(rawOptions instanceof FirefoxOptions)) {
      throw new WebDriverException("Firefox option was set, but is not a FirefoxOption: " + rawOptions);
    }
    FirefoxOptions options = (FirefoxOptions) rawOptions;
    if (options == null) {
      options = new FirefoxOptions();
    }
    options.setProfileSafely(profile);

    DesiredCapabilities toReturn = capabilities instanceof DesiredCapabilities ?
                                   (DesiredCapabilities) capabilities :
                                   new DesiredCapabilities(capabilities);
    toReturn.setCapability(OLD_FIREFOX_OPTIONS, options);
    toReturn.setCapability(FIREFOX_OPTIONS, options);
    return toReturn;
  }

  private static FirefoxBinary getBinary(Capabilities capabilities) {
    if (capabilities != null && capabilities.getCapability(BINARY) != null) {
      Object raw = capabilities.getCapability(BINARY);
      if (raw instanceof FirefoxBinary) {
        return (FirefoxBinary) raw;
      }
      File file = new File((String) raw);
      try {
        return new FirefoxBinary(file);
      } catch (WebDriverException wde) {
        throw new SessionNotCreatedException(wde.getMessage());
      }
    }
    return new FirefoxBinary();
  }

  public FirefoxDriver(FirefoxBinary binary, FirefoxProfile profile) {
    this(binary, profile, populateProfile(profile, DesiredCapabilities.firefox()));
  }

  public FirefoxDriver(FirefoxBinary binary, FirefoxProfile profile, Capabilities capabilities) {
    this(binary, profile, populateProfile(profile, capabilities), null);
  }

  public FirefoxDriver(FirefoxBinary binary, FirefoxProfile profile,
      Capabilities desiredCapabilities, Capabilities requiredCapabilities) {
    this(createCommandExecutor(populateProfile(profile, desiredCapabilities), binary, profile),
         populateProfile(profile, desiredCapabilities), requiredCapabilities);
    this.binary = binary;
  }

  public FirefoxDriver(GeckoDriverService driverService, Capabilities desiredCapabilities,
      Capabilities requiredCapabilities) {
    this(new DriverCommandExecutor(driverService), desiredCapabilities, requiredCapabilities);
  }

  private FirefoxDriver(CommandExecutor executor, Capabilities desiredCapabilities,
      Capabilities requiredCapabilities) {
    super(executor,
          dropCapabilities(desiredCapabilities),
          dropCapabilities(requiredCapabilities));
  }

  private static final CommandExecutor createCommandExecutor(Capabilities desiredCapabilities,
                                                             FirefoxBinary binary,
                                                             FirefoxProfile profile) {
    if (isLegacy(desiredCapabilities)) {
      return new LazyCommandExecutor(binary, profile);
    }
    GeckoDriverService.Builder builder;
    if (binary == null) {
      builder = new GeckoDriverService.Builder();
    } else {
      builder = new GeckoDriverService.Builder(binary);
    }
    builder.usingPort(0);
    return new DriverCommandExecutor(builder.build());
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
    binary.quit();
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
      FirefoxProfile profileToUse = getProfile(exe.profile);

      // TODO(simon): Make this not sinfully ugly
      ExtensionConnection connection = connectTo(exe.binary, profileToUse, "localhost");
      exe.setConnection(connection);

      try {
        connection.start();
      } catch (IOException e) {
        throw new WebDriverException("An error occurred while connecting to Firefox", e);
      }

    }
  }

  private static FirefoxProfile getProfile(FirefoxProfile profile) {
    FirefoxProfile profileToUse = profile;
    String suggestedProfile = System.getProperty(SystemProperty.BROWSER_PROFILE);
    if (profileToUse == null && suggestedProfile != null) {
      profileToUse = new ProfilesIni().getProfile(suggestedProfile);
      if (profileToUse == null) {
        throw new WebDriverException(String.format(
            "Firefox profile '%s' named in system property '%s' not found",
            suggestedProfile, SystemProperty.BROWSER_PROFILE));
      }
    } else if (profileToUse == null) {
      profileToUse = new FirefoxProfile();
    }
    return profileToUse;
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
      caps = new DesiredCapabilities(Maps.filterKeys(capabilities.asMap(), new Predicate<String>() {
        public boolean apply(String key) {
          return !toRemove.contains(key);
        }
      }));
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

    private LazyCommandExecutor(FirefoxBinary binary, FirefoxProfile profile) {
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
