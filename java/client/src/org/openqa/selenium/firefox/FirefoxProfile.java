/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.firefox;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;
import org.apache.commons.io.FileUtils;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.Proxy.ProxyType;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.internal.ClasspathExtension;
import org.openqa.selenium.firefox.internal.Extension;
import org.openqa.selenium.firefox.internal.FileExtension;
import org.openqa.selenium.io.Cleanly;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.io.Zip;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Map;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;
import static org.openqa.selenium.firefox.FirefoxDriver.ACCEPT_UNTRUSTED_CERTIFICATES;
import static org.openqa.selenium.firefox.FirefoxDriver.ASSUME_UNTRUSTED_ISSUER;
import static org.openqa.selenium.firefox.FirefoxDriver.DEFAULT_ENABLE_NATIVE_EVENTS;

public class FirefoxProfile {
  public static final String PORT_PREFERENCE = "webdriver_firefox_port";

  /**
   * Profile preferences that are essential to the FirefoxDriver operating
   * correctly. Users are not permitted to override these values.
   */
  private static final ImmutableMap<String, Object> FROZEN_PREFERENCES =
      ImmutableMap.<String, Object>builder()
          .put("app.update.auto", false)
          .put("app.update.enabled", false)
          .put("browser.download.manager.showWhenStarting", false)
          .put("browser.EULA.override", true)
          .put("browser.EULA.3.accepted", true)
          .put("browser.link.open_external", 2)
          .put("browser.link.open_newwindow", 2)
          .put("browser.offline", false)
          .put("browser.safebrowsing.enabled", false)
          .put("browser.search.update", false)
          .put("browser.sessionstore.resume_from_crash", false)
          .put("browser.shell.checkDefaultBrowser", false)
          .put("browser.tabs.warnOnClose", false)
          .put("browser.tabs.warnOnOpen", false)
          .put("devtools.errorconsole.enabled", true)
          .put("dom.disable_open_during_load", false)
          .put("extensions.logging.enabled", true)
          .put("extensions.update.enabled", false)
          .put("extensions.update.notifyUser", false)
          .put("network.manage-offline-status", false)
          .put("network.http.max-connections-per-server", 10)
          .put("prompts.tab_modal.enabled", false)
          .put("security.fileuri.origin_policy", 3)
          .put("security.fileuri.strict_origin_policy", false)
          .put("security.warn_entering_secure", false)
          .put("security.warn_entering_secure.show_once", false)
          .put("security.warn_entering_weak", false)
          .put("security.warn_entering_weak.show_once", false)
          .put("security.warn_leaving_secure", false)
          .put("security.warn_leaving_secure.show_once", false)
          .put("security.warn_submit_insecure", false)
          .put("security.warn_viewing_mixed", false)
          .put("security.warn_viewing_mixed.show_once", false)
          .put("signon.rememberSignons", false)
          .put("toolkit.networkmanager.disable", true)
          .build();

  /**
   * The maximum amount of time scripts should be permitted to run. The user
   * may increase this timeout, but may not set it below the default value.
   */
  private static final String MAX_SCRIPT_RUN_TIME_KEY = "dom.max_script_run_time";
  private static final int DEFAULT_MAX_SCRIPT_RUN_TIME = 30;

  private Preferences additionalPrefs = new Preferences() {{
    setPreference(MAX_SCRIPT_RUN_TIME_KEY, DEFAULT_MAX_SCRIPT_RUN_TIME);
  }};

  private Map<String, Extension> extensions = Maps.newHashMap();
  private boolean enableNativeEvents;
  private boolean loadNoFocusLib;
  private boolean acceptUntrustedCerts;
  private boolean untrustedCertIssuer;
  private File model;
  private static final String ENABLE_NATIVE_EVENTS_PREF = "webdriver_enable_native_events";
  private static final String ACCEPT_UNTRUSTED_CERTS_PREF = "webdriver_accept_untrusted_certs";
  private static final String ASSUME_UNTRUSTED_ISSUER_PREF = "webdriver_assume_untrusted_issuer";

  public FirefoxProfile() {
    this(null);
  }

  /**
   * Constructs a firefox profile from an existing profile directory.
   * <p/>
   * <p>Users who need this functionality should consider using a named
   * profile.
   *
   * @param profileDir The profile directory to use as a model.
   */
  public FirefoxProfile(File profileDir) {
    model = profileDir;
    verifyModel(model);

    File prefsInModel = new File(model, "user.js");
    if (prefsInModel.exists()) {
      Preferences existingPrefs = new Preferences(prefsInModel);
      enableNativeEvents = getBooleanPreference(existingPrefs, ENABLE_NATIVE_EVENTS_PREF,
          DEFAULT_ENABLE_NATIVE_EVENTS);
      acceptUntrustedCerts = getBooleanPreference(existingPrefs, ACCEPT_UNTRUSTED_CERTS_PREF,
          ACCEPT_UNTRUSTED_CERTIFICATES);
      untrustedCertIssuer = getBooleanPreference(existingPrefs, ASSUME_UNTRUSTED_ISSUER_PREF,
          ASSUME_UNTRUSTED_ISSUER);
    } else {
      enableNativeEvents = DEFAULT_ENABLE_NATIVE_EVENTS;
      acceptUntrustedCerts = ACCEPT_UNTRUSTED_CERTIFICATES;
      untrustedCertIssuer = ASSUME_UNTRUSTED_ISSUER;
    }

    // This is not entirely correct but this is not stored in the profile
    // so for now will always be set to false.
    loadNoFocusLib = false;
  }

  private boolean getBooleanPreference(Preferences prefs, String key, boolean defaultValue) {
    Object value = prefs.getPreference(key);
    if (value == null) {
      return defaultValue;
    }

    if (value instanceof Boolean) {
      return (Boolean) value;
    }

    throw new WebDriverException("Expected boolean value is not a boolean. It is: " + value);
  }

  private void verifyModel(File model) {
    if (model == null) {
      return;
    }

    if (!model.exists()) {
      throw new UnableToCreateProfileException(
          "Given model profile directory does not exist: " + model.getPath());
    }

    if (!model.isDirectory()) {
      throw new UnableToCreateProfileException(
          "Given model profile directory is not a directory: " + model.getAbsolutePath());
    }
  }

  protected void addWebDriverExtensionIfNeeded() {
    if (extensions.containsKey("webdriver")) {
      return;
    }

    ClasspathExtension extension = new ClasspathExtension(FirefoxProfile.class,
        "/" + FirefoxProfile.class.getPackage().getName().replace(".", "/") + "/webdriver.xpi");
    addExtension("webdriver", extension);
  }

  public void addExtension(Class<?> loadResourcesUsing, String loadFrom) throws IOException {
    // Is loadFrom a file?
    File file = new File(loadFrom);
    if (file.exists()) {
      addExtension(file);
      return;
    }

    addExtension(loadFrom, new ClasspathExtension(loadResourcesUsing, loadFrom));
  }

  /**
   * Attempt to add an extension to install into this instance.
   *
   * @param extensionToInstall
   * @throws IOException
   */
  public void addExtension(File extensionToInstall) throws IOException {
    addExtension(extensionToInstall.getName(), new FileExtension(extensionToInstall));
  }

  protected void addExtension(String key, Extension extension) {
    String name = deriveExtensionName(key);
    extensions.put(name, extension);
  }

  private String deriveExtensionName(String originalName) {
    String[] pieces = originalName.replace('\\', '/').split("/");

    String name = pieces[pieces.length - 1];
    name = name.replaceAll("\\..*?$", "");
    return name;
  }

  /**
   * Set a preference for this particular profile. The value will be properly quoted
   * before use. Note that if a value looks as if it is a quoted string (that is, starts
   * with a quote character and ends with one too) an IllegalArgumentException is thrown:
   * Firefox fails to start properly when some values are set to this.
   *
   * @param key   The key
   * @param value The new value.
   */
  public void setPreference(String key, String value) {
    checkPreference(key, value);
    additionalPrefs.setPreference(key, value);
  }

  /**
   * Set a preference for this particular profile.
   *
   * @param key   The key
   * @param value The new value.
   */
  public void setPreference(String key, boolean value) {
    checkPreference(key, value);
    additionalPrefs.setPreference(key, value);
  }

  /**
   * Set a preference for this particular profile.
   *
   * @param key   The key
   * @param value The new value.
   */
  public void setPreference(String key, int value) {
    checkPreference(key, value);
    additionalPrefs.setPreference(key, value);
  }

  private static void checkPreference(String key, Object value) {
    checkNotNull(value);
    checkArgument(!FROZEN_PREFERENCES.containsKey(key),
        "Preference %s may not be overridden: frozen value=%s, requested value=%s",
        key, FROZEN_PREFERENCES.get(key), value);
    if (MAX_SCRIPT_RUN_TIME_KEY.equals(key)) {
      int n;
      if (value instanceof String) {
        n = Integer.parseInt((String) value);
      } else if (value instanceof Integer) {
        n = (Integer) value;
      } else {
        throw new IllegalArgumentException(String.format(
          "%s value must be a number: %s", MAX_SCRIPT_RUN_TIME_KEY, value.getClass().getName()));
      }
      checkArgument(n == 0 || n >= DEFAULT_MAX_SCRIPT_RUN_TIME,
          "%s must be == 0 || >= %s", MAX_SCRIPT_RUN_TIME_KEY, DEFAULT_MAX_SCRIPT_RUN_TIME);
    }
  }

  /**
   * Set proxy preferences for this profile.
   *
   * @param proxy The proxy preferences.
   * @return The profile, for further settings.
   */
  public FirefoxProfile setProxyPreferences(Proxy proxy) {
    if (proxy.getProxyType() == ProxyType.UNSPECIFIED) {
      return this;
    }
    setPreference("network.proxy.type", proxy.getProxyType().ordinal());

    switch (proxy.getProxyType()) {
      case MANUAL:// By default, assume we're proxying the lot
        setPreference("network.proxy.no_proxies_on", "");

        setManualProxyPreference("ftp", proxy.getFtpProxy());
        setManualProxyPreference("http", proxy.getHttpProxy());
        setManualProxyPreference("ssl", proxy.getSslProxy());
        if (proxy.getNoProxy() != null) {
          setPreference("network.proxy.no_proxies_on", proxy.getNoProxy());
        }

        break;
      case PAC:
        setPreference("network.proxy.autoconfig_url", proxy.getProxyAutoconfigUrl());
        break;
    }
    return this;
  }

  private void setManualProxyPreference(String key, String settingString) {
    if (settingString == null) {
      return;
    }
    String[] hostPort = settingString.split(":");
    setPreference("network.proxy." + key, hostPort[0]);
    if (hostPort.length > 1) {
      setPreference("network.proxy." + key + "_port", Integer.parseInt(hostPort[1]));
    }
  }


  protected Preferences getAdditionalPreferences() {
    return additionalPrefs;
  }

  public void updateUserPrefs(File userPrefs) {
    Preferences prefs = new Preferences();

    // Allow users to override these settings
    prefs.setPreference("browser.startup.homepage", "about:blank");
    // The user must be able to override this setting (to 1) in order to
    // to change homepage on Firefox 3.0
    prefs.setPreference("browser.startup.page", 0);

    if (userPrefs.exists()) {
      prefs = new Preferences(userPrefs);
      if (!userPrefs.delete()) {
        throw new WebDriverException("Cannot delete existing user preferences");
      }
    }

    additionalPrefs.addTo(prefs);

    // Normal settings to facilitate testing
    prefs.putAll(FROZEN_PREFERENCES);

    // Should we use native events?
    prefs.setPreference(ENABLE_NATIVE_EVENTS_PREF, enableNativeEvents);

    // Should we accept untrusted certificates or not?
    prefs.setPreference(ACCEPT_UNTRUSTED_CERTS_PREF, acceptUntrustedCerts);

    prefs.setPreference(ASSUME_UNTRUSTED_ISSUER_PREF, untrustedCertIssuer);


    // Settings to facilitate debugging the driver

    // Logs errors in chrome files to the Error Console.
    prefs.setPreference("javascript.options.showInConsole", true);

    // Enables the use of the dump() statement
    prefs.setPreference("browser.dom.window.dump.enabled", true);

    // Log exceptions from inner frames (i.e. setTimeout)
    prefs.setPreference("dom.report_all_js_exceptions", true);

    // If the user sets the home page, we should also start up there
    Object homePage = prefs.getPreference("browser.startup.homepage");
    if (homePage != null && homePage instanceof String) {
      prefs.setPreference("startup.homepage_welcome_url", (String) homePage);
    }

    if (!"about:blank".equals(prefs.getPreference("browser.startup.homepage"))) {
      prefs.setPreference("browser.startup.page", 1);
    }

    FileWriter writer = null;
    try {
      writer = new FileWriter(userPrefs);
      prefs.writeTo(writer);
    } catch (IOException e) {
      throw new WebDriverException(e);
    } finally {
      Cleanly.close(writer);
    }
  }

  protected void deleteLockFiles(File profileDir) {
    File macAndLinuxLockFile = new File(profileDir, ".parentlock");
    File windowsLockFile = new File(profileDir, "parent.lock");

    macAndLinuxLockFile.delete();
    windowsLockFile.delete();
  }

  public void deleteExtensionsCacheIfItExists(File profileDir) {
    File cacheFile = new File(profileDir, "extensions.cache");
    if (cacheFile.exists()) {
      cacheFile.delete();
    }
  }

  public boolean enableNativeEvents() {
    return enableNativeEvents;
  }

  public void setEnableNativeEvents(boolean enableNativeEvents) {
    this.enableNativeEvents = enableNativeEvents;
  }

  /**
   * Returns whether the no focus library should be loaded for Firefox
   * profiles launched on Linux, even if native events are disabled.
   *
   * @return Whether the no focus library should always be loaded for Firefox
   *         on Linux.
   */
  public boolean alwaysLoadNoFocusLib() {
    return loadNoFocusLib;
  }

  /**
   * Sets whether the no focus library should always be loaded on Linux.
   *
   * @param loadNoFocusLib Whether to always load the no focus library.
   */
  public void setAlwaysLoadNoFocusLib(boolean loadNoFocusLib) {
    this.loadNoFocusLib = loadNoFocusLib;
  }

  /**
   * Sets whether Firefox should accept SSL certificates which have expired,
   * signed by an unknown authority or are generally untrusted.
   * This is set to true by default.
   *
   * @param acceptUntrustedSsl Whether untrusted SSL certificates should be
   *                           accepted.
   */

  public void setAcceptUntrustedCertificates(boolean acceptUntrustedSsl) {
    this.acceptUntrustedCerts = acceptUntrustedSsl;
  }

  /**
   * By default, when accepting untrusted SSL certificates, assume that
   * these certificates will come from an untrusted issuer or will be self
   * signed.
   * Due to limitation within Firefox, it is easy to find out if the
   * certificate has expired or does not match the host it was served for,
   * but hard to find out if the issuer of the certificate is untrusted.
   * <p/>
   * By default, it is assumed that the certificates were not be issued from
   * a trusted CA.
   * <p/>
   * If you are receive an "untrusted site" prompt on Firefox when using a
   * certificate that was issued by valid issuer, but has expired or
   * is being served served for a different host (e.g. production certificate
   * served in a testing environment) set this to false.
   *
   * @param untrustedIssuer whether to assume untrusted issuer or not.
   */
  public void setAssumeUntrustedCertificateIssuer(boolean untrustedIssuer) {
    this.untrustedCertIssuer = untrustedIssuer;
  }

  public boolean isRunning(File profileDir) {
    File macAndLinuxLockFile = new File(profileDir, ".parentlock");
    File windowsLockFile = new File(profileDir, "parent.lock");

    return macAndLinuxLockFile.exists() || windowsLockFile.exists();
  }

  public void clean(File profileDir) {
    TemporaryFilesystem.getDefaultTmpFS().deleteTempDir(profileDir);
  }

  public String toJson() throws IOException {
    File generatedProfile = layoutOnDisk();

    return new Zip().zip(generatedProfile);
  }

  public static FirefoxProfile fromJson(String json) throws IOException {
    File dir = TemporaryFilesystem.getDefaultTmpFS().createTempDir("webdriver", "duplicated");

    new Zip().unzip(json, dir);

    return new FirefoxProfile(dir);
  }

  /**
   * Call this to cause the current profile to be written to disk. The profile
   * directory is returned. Note that this profile directory is a temporary one
   * and will be deleted when the JVM exists (at the latest)
   *
   * This method should be called immediately before starting to use the profile
   * and should only be called once per instance of the
   * {@link org.openqa.selenium.firefox.FirefoxDriver}.
   *
   * @return The directory containing the profile.
   */
  public File layoutOnDisk() {
      try {
        File profileDir = TemporaryFilesystem.getDefaultTmpFS()
            .createTempDir("anonymous", "webdriver-profile");
        File userPrefs = new File(profileDir, "user.js");

        copyModel(model, profileDir);
        installExtensions(profileDir);
        deleteLockFiles(profileDir);
        deleteExtensionsCacheIfItExists(profileDir);
        updateUserPrefs(userPrefs);
        return profileDir;
      } catch (IOException e) {
        throw new UnableToCreateProfileException(e);
      }
    }

  protected void copyModel(File sourceDir, File profileDir) throws IOException {
    if (sourceDir == null || !sourceDir.exists()) {
      return;
    }

    FileUtils.copyDirectory(sourceDir, profileDir);
  }

  protected void installExtensions(File parentDir) throws IOException {
    File extensionsDir = new File(parentDir, "extensions");

    for (Extension extension : extensions.values()) {
      extension.writeTo(extensionsDir);
    }
  }
}
