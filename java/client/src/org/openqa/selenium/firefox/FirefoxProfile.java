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

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.Maps;
import com.google.common.io.Resources;

import org.openqa.selenium.Beta;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.internal.ClasspathExtension;
import org.openqa.selenium.firefox.internal.Extension;
import org.openqa.selenium.firefox.internal.FileExtension;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.io.Zip;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringReader;
import java.net.URL;
import java.util.Map;


public class FirefoxProfile {
  public static final String PORT_PREFERENCE = "webdriver_firefox_port";
  public static final String ALLOWED_HOSTS_PREFERENCE = "webdriver_firefox_allowed_hosts";

  private static final String defaultPrefs = "/org/openqa/selenium/firefox/webdriver_prefs.json";

  private Preferences additionalPrefs;

  private Map<String, Extension> extensions = Maps.newHashMap();
  private boolean loadNoFocusLib;
  private boolean acceptUntrustedCerts;
  private boolean untrustedCertIssuer;
  private File model;
  private static final String ACCEPT_UNTRUSTED_CERTS_PREF = "webdriver_accept_untrusted_certs";
  private static final String ASSUME_UNTRUSTED_ISSUER_PREF = "webdriver_assume_untrusted_issuer";

  public FirefoxProfile() {
    this(null);
  }

  /**
   * Constructs a firefox profile from an existing profile directory.
   * <p>
   * Users who need this functionality should consider using a named profile.
   *
   * @param profileDir The profile directory to use as a model.
   */
  public FirefoxProfile(File profileDir) {
    this(null, profileDir);
  }

  @VisibleForTesting
  @Beta
  protected FirefoxProfile(Reader defaultsReader, File profileDir) {
    if (defaultsReader == null) {
      defaultsReader = onlyOverrideThisIfYouKnowWhatYouAreDoing();
    }

    additionalPrefs = new Preferences(defaultsReader);

    model = profileDir;
    verifyModel(model);

    File prefsInModel = new File(model, "user.js");
    if (prefsInModel.exists()) {
      StringReader reader = new StringReader("{\"frozen\": {}, \"mutable\": {}}");
      Preferences existingPrefs = new Preferences(reader, prefsInModel);
      acceptUntrustedCerts = getBooleanPreference(existingPrefs, ACCEPT_UNTRUSTED_CERTS_PREF, true);
      untrustedCertIssuer = getBooleanPreference(existingPrefs, ASSUME_UNTRUSTED_ISSUER_PREF, true);
      existingPrefs.addTo(additionalPrefs);
    } else {
      acceptUntrustedCerts = true;
      untrustedCertIssuer = true;
    }

    // This is not entirely correct but this is not stored in the profile
    // so for now will always be set to false.
    loadNoFocusLib = false;

    try {
      defaultsReader.close();
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }

  /**
   * <strong>Internal method. This is liable to change at a moment's notice.</strong>
   *
   * @return InputStreamReader of the default firefox profile preferences
   */
  @Beta
  protected Reader onlyOverrideThisIfYouKnowWhatYouAreDoing() {
    URL resource = Resources.getResource(FirefoxProfile.class, defaultPrefs);
    try {
      return new InputStreamReader(resource.openStream());
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
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

  public String getStringPreference(String key, String defaultValue) {
    Object preference = additionalPrefs.getPreference(key);
    if(preference != null && preference instanceof String) {
      return (String) preference;
    }
    return defaultValue;
  }

  public int getIntegerPreference(String key, int defaultValue) {
    Object preference = additionalPrefs.getPreference(key);
    if(preference != null && preference instanceof Integer) {
      return (Integer) preference;
    }
    return defaultValue;
  }

  public boolean getBooleanPreference(String key, boolean defaultValue) {
    Object preference = additionalPrefs.getPreference(key);
    if(preference != null && preference instanceof Boolean) {
      return (Boolean) preference;
    }
    return defaultValue;
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

  public boolean containsWebDriverExtension() {
    return extensions.containsKey("webdriver");
  }

  public void addExtension(Class<?> loadResourcesUsing, String loadFrom) {
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
   * @param extensionToInstall File pointing to the extension
   */
  public void addExtension(File extensionToInstall) {
    addExtension(extensionToInstall.getName(), new FileExtension(extensionToInstall));
  }

  public void addExtension(String key, Extension extension) {
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
   * Set a preference for this particular profile. The value will be properly quoted before use.
   * Note that if a value looks as if it is a quoted string (that is, starts with a quote character
   * and ends with one too) an IllegalArgumentException is thrown: Firefox fails to start properly
   * when some values are set to this.
   *
   * @param key The key
   * @param value The new value.
   */
  public void setPreference(String key, String value) {
    additionalPrefs.setPreference(key, value);
  }

  /**
   * Set a preference for this particular profile.
   *
   * @param key The key
   * @param value The new value.
   */
  public void setPreference(String key, boolean value) {
    additionalPrefs.setPreference(key, value);
  }

  /**
   * Set a preference for this particular profile.
   *
   * @param key The key
   * @param value The new value.
   */
  public void setPreference(String key, int value) {
    additionalPrefs.setPreference(key, value);
  }

  protected Preferences getAdditionalPreferences() {
    return additionalPrefs;
  }

  public void updateUserPrefs(File userPrefs) {
    Preferences prefs = new Preferences(onlyOverrideThisIfYouKnowWhatYouAreDoing());

    // Allow users to override these settings
    prefs.setPreference("browser.startup.homepage", "about:blank");
    // The user must be able to override this setting (to 1) in order to
    // to change homepage on Firefox 3.0
    prefs.setPreference("browser.startup.page", 0);

    if (userPrefs.exists()) {
      prefs = new Preferences(onlyOverrideThisIfYouKnowWhatYouAreDoing(), userPrefs);
      if (!userPrefs.delete()) {
        throw new WebDriverException("Cannot delete existing user preferences");
      }
    }

    additionalPrefs.addTo(prefs);

    // Should we accept untrusted certificates or not?
    prefs.setPreference(ACCEPT_UNTRUSTED_CERTS_PREF, acceptUntrustedCerts);

    prefs.setPreference(ASSUME_UNTRUSTED_ISSUER_PREF, untrustedCertIssuer);

    // If the user sets the home page, we should also start up there
    Object homePage = prefs.getPreference("browser.startup.homepage");
    if (homePage != null && homePage instanceof String) {
      prefs.setPreference("startup.homepage_welcome_url", "");
    }

    if (!"about:blank".equals(prefs.getPreference("browser.startup.homepage"))) {
      prefs.setPreference("browser.startup.page", 1);
    }

    try (FileWriter writer = new FileWriter(userPrefs)) {
      prefs.writeTo(writer);
    } catch (IOException e) {
      throw new WebDriverException(e);
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

  /**
   * @deprecated "Native" events are not supported in FirefoxDriver anymore
   */
  @Deprecated
  public boolean areNativeEventsEnabled() {
    return false;
  }

  /**
   * @deprecated "Native" events are not supported in FirefoxDriver anymore
   */
  @Deprecated
  public void setEnableNativeEvents(boolean enableNativeEvents) {
  }

  /**
   * Returns whether the no focus library should be loaded for Firefox profiles launched on Linux,
   * even if native events are disabled.
   *
   * @return Whether the no focus library should always be loaded for Firefox on Linux.
   */
  public boolean shouldLoadNoFocusLib() {
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
   * Sets whether Firefox should accept SSL certificates which have expired, signed by an unknown
   * authority or are generally untrusted. This is set to true by default.
   *
   * @param acceptUntrustedSsl Whether untrusted SSL certificates should be accepted.
   */

  public void setAcceptUntrustedCertificates(boolean acceptUntrustedSsl) {
    this.acceptUntrustedCerts = acceptUntrustedSsl;
  }

  /**
   * By default, when accepting untrusted SSL certificates, assume that these certificates will come
   * from an untrusted issuer or will be self signed. Due to limitation within Firefox, it is easy
   * to find out if the certificate has expired or does not match the host it was served for, but
   * hard to find out if the issuer of the certificate is untrusted.
   * <p>
   * By default, it is assumed that the certificates were not be issued from a trusted CA.
   * <p>
   * If you are receive an "untrusted site" prompt on Firefox when using a certificate that was
   * issued by valid issuer, but has expired or is being served served for a different host (e.g.
   * production certificate served in a testing environment) set this to false.
   *
   * @param untrustedIssuer whether to assume untrusted issuer or not.
   */
  public void setAssumeUntrustedCertificateIssuer(boolean untrustedIssuer) {
    this.untrustedCertIssuer = untrustedIssuer;
  }

  public void clean(File profileDir) {
    TemporaryFilesystem.getDefaultTmpFS().deleteTempDir(profileDir);
  }

  public String toJson() throws IOException {
    return Zip.zip(layoutOnDisk());
  }

  public static FirefoxProfile fromJson(String json) throws IOException {
    return new FirefoxProfile(Zip.unzipToTempDir(json, "webdriver", "duplicated"));
  }

  protected void cleanTemporaryModel() {
    clean(model);
  }

  /**
   * Call this to cause the current profile to be written to disk. The profile directory is
   * returned. Note that this profile directory is a temporary one and will be deleted when the JVM
   * exists (at the latest)
   *
   * This method should be called immediately before starting to use the profile and should only be
   * called once per instance of the {@link org.openqa.selenium.firefox.FirefoxDriver}.
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

    FileHandler.copy(sourceDir, profileDir);
  }

  protected void installExtensions(File parentDir) throws IOException {
    File extensionsDir = new File(parentDir, "extensions");

    for (Extension extension : extensions.values()) {
      extension.writeTo(extensionsDir);
    }
  }
}
