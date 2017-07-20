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

import static org.openqa.selenium.firefox.FirefoxDriver.SystemProperty.DRIVER_USE_MARIONETTE;
import static org.openqa.selenium.remote.CapabilityType.PROXY;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.FileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.service.DriverCommandExecutor;
import org.openqa.selenium.remote.service.DriverService;

import java.util.Set;
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
public class FirefoxDriver extends RemoteWebDriver {

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

  protected FirefoxBinary binary;

  public FirefoxDriver() {
    this(new FirefoxOptions());
  }

  public FirefoxDriver(FirefoxOptions options) {
    this(toExecutor(options), options.toCapabilities(), options.toCapabilities());
  }

  /**
   * @deprecated Prefer {@link FirefoxOptions#setBinary(FirefoxBinary)}.
   */
  @Deprecated
  public FirefoxDriver(FirefoxBinary binary) {
    this(new FirefoxOptions().setBinary(binary));
    warnAboutDeprecatedConstructor("FirefoxBinary", "setBinary(binary)");
  }

  /**
   * @deprecated Prefer {@link FirefoxOptions#setProfile(FirefoxProfile)}.
   */
  @Deprecated
  public FirefoxDriver(FirefoxProfile profile) {
    this(new FirefoxOptions().setProfile(profile));
    warnAboutDeprecatedConstructor("FirefoxProfile", "setProfile(profile)");
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
    this(new FirefoxOptions(desiredCapabilities).addCapabilities(desiredCapabilities));
  }

  /**
   * @deprecated Prefer {@link FirefoxDriver#FirefoxDriver(FirefoxOptions)}
   */
  @Deprecated
  public FirefoxDriver(Capabilities desiredCapabilities, Capabilities requiredCapabilities) {
    this(new FirefoxOptions(desiredCapabilities)
             .addCapabilities(desiredCapabilities)
             .addCapabilities(requiredCapabilities));
    warnAboutDeprecatedConstructor(
        "Capabilities, Capabilities",
        "addCapabilities(capabilities)");
  }

  /**
   * @deprecated Prefer {@link FirefoxOptions#setBinary(FirefoxBinary)},
   *   {@link FirefoxOptions#setProfile(FirefoxProfile)}
   */
  @Deprecated
  public FirefoxDriver(FirefoxBinary binary, FirefoxProfile profile, Capabilities capabilities) {
    this(new FirefoxOptions(capabilities)
             .setBinary(binary)
             .setProfile(profile)
             .addCapabilities(capabilities));
    warnAboutDeprecatedConstructor(
        "FirefoxBinary, FirefoxProfile, Capabilities",
        "setBinary(binary).setProfile(profile).addCapabilities(capabilities)");
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
    this(new FirefoxOptions(desiredCapabilities)
             .setBinary(binary).setProfile(profile)
             .addCapabilities(desiredCapabilities)
             .addCapabilities(requiredCapabilities));
    warnAboutDeprecatedConstructor(
        "FirefoxBinary, FirefoxProfile, Capabilities",
        "setBinary(binary).setProfile(profile).addCapabilities(capabilities)");
  }

  private FirefoxDriver(
      CommandExecutor executor,
      Capabilities desiredCapabilities,
      Capabilities requiredCapabilities) {
    super(executor,
          dropCapabilities(desiredCapabilities).merge(dropCapabilities(requiredCapabilities)));
  }

  private static CommandExecutor toExecutor(FirefoxOptions options) {
    DriverService.Builder<?, ?> builder;

    if (options.isLegacy()) {
      builder = XpiDriverService.builder()
          .withBinary(options.getBinary())
          .withProfile(options.getProfile());
    } else {
      builder = new GeckoDriverService.Builder()
          .usingFirefoxBinary(options.getBinary());
    }

    return new DriverCommandExecutor(builder.build());
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

  private static boolean isLegacy(Capabilities desiredCapabilities) {
    Boolean forceMarionette = forceMarionetteFromSystemProperty();
    if (forceMarionette != null) {
      return !forceMarionette;
    }
    Object marionette = desiredCapabilities.getCapability(MARIONETTE);
    return marionette instanceof Boolean && ! (Boolean) marionette;
  }

  private static Boolean forceMarionetteFromSystemProperty() {
    String useMarionette = System.getProperty(DRIVER_USE_MARIONETTE);
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
      caps.setCapability(PROXY, proxy);
    }

    return caps;
  }
}
