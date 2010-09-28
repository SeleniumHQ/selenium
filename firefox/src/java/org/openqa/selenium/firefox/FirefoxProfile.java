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

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.util.HashMap;
import java.util.Map;

import com.google.common.collect.Maps;
import org.apache.commons.io.FileUtils;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.Proxy.ProxyType;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.internal.ClasspathExtension;
import org.openqa.selenium.firefox.internal.Extension;
import org.openqa.selenium.firefox.internal.FileExtension;
import org.openqa.selenium.internal.Cleanly;
import org.openqa.selenium.internal.TemporaryFilesystem;
import org.openqa.selenium.internal.Zip;

public class FirefoxProfile {
  public static final String PORT_PREFERENCE = "webdriver_firefox_port";

  private Preferences additionalPrefs = new Preferences();
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
      Map<String, String> existingPrefs = readExistingPrefs(prefsInModel);
      enableNativeEvents = Boolean.valueOf(existingPrefs.get(ENABLE_NATIVE_EVENTS_PREF));
      acceptUntrustedCerts = Boolean.valueOf(existingPrefs.get(ACCEPT_UNTRUSTED_CERTS_PREF));
      untrustedCertIssuer = Boolean.valueOf(existingPrefs.get(ASSUME_UNTRUSTED_ISSUER_PREF));
    } else {
      enableNativeEvents = FirefoxDriver.DEFAULT_ENABLE_NATIVE_EVENTS;
      acceptUntrustedCerts = FirefoxDriver.ACCEPT_UNTRUSTED_CERTIFICATES;
      untrustedCertIssuer = FirefoxDriver.ASSUME_UNTRUSTED_ISSUER;
    }

    // This is not entirely correct but this is not stored in the profile
    // so for now will always be set to false.
    loadNoFocusLib = false;
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

    ClasspathExtension extension = new ClasspathExtension(FirefoxProfile.class, "/webdriver.xpi");
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

  //Assumes that we only really care about the preferences, not the comments
  private Map<String, String> readExistingPrefs(File userPrefs) {
    Map<String, String> prefs = new HashMap<String, String>();

    BufferedReader reader = null;
    try {
      reader = new BufferedReader(new FileReader(userPrefs));
      String line = reader.readLine();
      while (line != null) {
        if (!line.startsWith("user_pref(\"")) {
          line = reader.readLine();
          continue;
        }
        line = line.substring("user_pref(\"".length());
        line = line.substring(0, line.length() - ");".length());
        String[] parts = line.split(",");
        parts[0] = parts[0].substring(0, parts[0].length() - 1);
        prefs.put(parts[0].trim(), parts[1].trim());

        line = reader.readLine();
      }
    } catch (IOException e) {
      throw new WebDriverException(e);
    } finally {
      Cleanly.close(reader);
    }

    return prefs;
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
    additionalPrefs.setPreference(key, value);
  }

  /**
   * Set a preference for this particular profile.
   *
   * @param key   The key
   * @param value The new value.
   */
  public void setPreference(String key, boolean value) {
    additionalPrefs.setPreference(key, value);
  }

  /**
   * Set a preference for this particular profile.
   *
   * @param key   The key
   * @param value The new value.
   */
  public void setPreference(String key, int value) {
    additionalPrefs.setPreference(key, value);
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
    Map<String, String> prefs = new HashMap<String, String>();

    // Allow users to override these settings
    prefs.put("browser.startup.homepage", "\"about:blank\"");
    // The user must be able to override this setting (to 1) in order to
    // to change homepage on Firefox 3.0
    prefs.put("browser.startup.page", "0");

    if (userPrefs.exists()) {
      prefs = readExistingPrefs(userPrefs);
      if (!userPrefs.delete()) {
        throw new WebDriverException("Cannot delete existing user preferences");
      }
    }

    additionalPrefs.addTo(prefs);

    // Normal settings to facilitate testing
    prefs.put("app.update.auto", "false");
    prefs.put("app.update.enabled", "false");
    prefs.put("browser.download.manager.showWhenStarting", "false");
    prefs.put("browser.EULA.override", "true");
    prefs.put("browser.EULA.3.accepted", "true");
    prefs.put("browser.link.open_external", "2");
    prefs.put("browser.link.open_newwindow", "2");
    prefs.put("browser.safebrowsing.enabled", "false");
    prefs.put("browser.search.update", "false");
    prefs.put("browser.sessionstore.resume_from_crash", "false");
    prefs.put("browser.shell.checkDefaultBrowser", "false");
    prefs.put("browser.tabs.warnOnClose", "false");
    prefs.put("browser.tabs.warnOnOpen", "false");
    prefs.put("dom.disable_open_during_load", "false");
    prefs.put("extensions.update.enabled", "false");
    prefs.put("extensions.update.notifyUser", "false");
    prefs.put("network.manage-offline-status", "false");
    prefs.put("security.fileuri.origin_policy", "3");
    prefs.put("security.fileuri.strict_origin_policy", "false");
    prefs.put("security.warn_entering_secure", "false");
    prefs.put("security.warn_submit_insecure", "false");
    prefs.put("security.warn_entering_secure.show_once", "false");
    prefs.put("security.warn_entering_weak", "false");
    prefs.put("security.warn_entering_weak.show_once", "false");
    prefs.put("security.warn_leaving_secure", "false");
    prefs.put("security.warn_leaving_secure.show_once", "false");
    prefs.put("security.warn_submit_insecure", "false");
    prefs.put("security.warn_viewing_mixed", "false");
    prefs.put("security.warn_viewing_mixed.show_once", "false");
    prefs.put("signon.rememberSignons", "false");

    // Should we use native events?
    prefs.put(ENABLE_NATIVE_EVENTS_PREF,
        Boolean.toString(enableNativeEvents));

    // Should we accept untrusted certificates or not?
    prefs.put(ACCEPT_UNTRUSTED_CERTS_PREF,
        Boolean.toString(acceptUntrustedCerts));

    prefs.put(ASSUME_UNTRUSTED_ISSUER_PREF,
        Boolean.toString(untrustedCertIssuer));


    // Settings to facilitate debugging the driver

    // Logs errors in chrome files to the Error Console.
    prefs.put("javascript.options.showInConsole", "true");

    // Enables the use of the dump() statement
    prefs.put("browser.dom.window.dump.enabled", "true");

    // If the user sets the home page, we should also start up there
    prefs.put("startup.homepage_welcome_url", prefs.get("browser.startup.homepage"));

    if (!"about:blank".equals(prefs.get("browser.startup.homepage"))) {
      prefs.put("browser.startup.page", "1");
    }

    writeNewPrefs(userPrefs, prefs);
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

  protected void writeNewPrefs(File userPrefs, Map<String, String> prefs) {
    Writer writer = null;
    try {
      writer = new FileWriter(userPrefs);
      for (Map.Entry<String, String> entry : prefs.entrySet()) {
        writer.append(
            String.format("user_pref(\"%s\", %s);\n", entry.getKey(), entry.getValue())
        );
      }
    } catch (IOException e) {
      throw new WebDriverException(e);
    } finally {
      Cleanly.close(writer);
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
    TemporaryFilesystem.deleteTempDir(profileDir);
  }

  public String toJson() throws IOException {
    File generatedProfile = layoutOnDisk();

    return new Zip().zip(generatedProfile);
  }

  public static FirefoxProfile fromJson(String json) throws IOException {
    File dir = TemporaryFilesystem.createTempDir("webdriver", "duplicated");

    new Zip().unzip(json, dir);

    return new FirefoxProfile(dir);
  }

  public File layoutOnDisk() {
    try {
      File profileDir = TemporaryFilesystem.createTempDir("anonymous", "webdriver-profile");
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
