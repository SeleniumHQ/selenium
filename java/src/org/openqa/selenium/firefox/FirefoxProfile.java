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

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.io.Zip;
import org.openqa.selenium.json.Json;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.Charset;

public class FirefoxProfile {

  private final Preferences additionalPrefs;
  private final File model;

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
    additionalPrefs = new Preferences();
    model = profileDir;
    verifyModel(model);

    File prefsInModel = new File(model, "user.js");
    if (prefsInModel.exists()) {
      Preferences existingPrefs = new Preferences(prefsInModel);
      existingPrefs.addTo(this.additionalPrefs);
    }
  }

  public static FirefoxProfile fromJson(String json) throws IOException {
    // We used to just pass in the entire string without quotes. If we see that, we're good.
    // Otherwise, parse the json.

    if (json.trim().startsWith("\"")) {
      json = new Json().toType(json, String.class);
    }

    return new FirefoxProfile(Zip.unzipToTempDir(
      json,
      "webdriver",
      "duplicated"));
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
    if(preference instanceof String) {
      return (String) preference;
    }
    return defaultValue;
  }

  public int getIntegerPreference(String key, int defaultValue) {
    Object preference = additionalPrefs.getPreference(key);
    if(preference instanceof Integer) {
      return (Integer) preference;
    }
    return defaultValue;
  }

  public boolean getBooleanPreference(String key, boolean defaultValue) {
    Object preference = additionalPrefs.getPreference(key);
    if(preference instanceof Boolean) {
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

  public void setPreference(String key, Object value) {
    additionalPrefs.setPreference(key, value);
  }

  protected Preferences getAdditionalPreferences() {
    return additionalPrefs;
  }

  public void setStartupUrl(String startupUrl) {
    setPreference("browser.startup.homepage", startupUrl);
  }

  public void updateUserPrefs(File userPrefs) {
    Preferences prefs = new Preferences();

    if (userPrefs.exists()) {
      prefs = new Preferences(userPrefs);
      if (!userPrefs.delete()) {
        throw new WebDriverException("Cannot delete existing user preferences");
      }
    }

    additionalPrefs.addTo(prefs);

    if (prefs.getPreference("browser.startup.homepage") != null) {
      prefs.setPreference("browser.startup.page", 1);
    }

    try (Writer writer = new OutputStreamWriter(
      new FileOutputStream(userPrefs), Charset.defaultCharset())) {
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

  public void clean(File profileDir) {
    TemporaryFilesystem.getDefaultTmpFS().deleteTempDir(profileDir);
  }

  String toJson() throws IOException {
    File file = layoutOnDisk();
    try {
      return Zip.zip(file);
    } finally {
      clean(file);
    }
  }

  public void cleanTemporaryModel() {
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
      deleteLockFiles(profileDir);
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
}
