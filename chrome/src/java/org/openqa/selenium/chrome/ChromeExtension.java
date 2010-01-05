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

package org.openqa.selenium.chrome;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.FileHandler;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

/**
 * Class for managing the WebDriver Chrome extension.
 *
 * @author jmleyba@google.com (Jason Leyba)
 */
public class ChromeExtension {

  /**
   * System property used to specify which extension directory to use.
   */
  public static final String CHROME_EXTENSION_DIRECTORY_PROPERTY = "webdriver.chrome.extensiondir";

  private static final String DEFAULT_EXTENSION_PATH = "/chrome-extension.zip";
  private static final String WINDOWS_MANIFEST_FILE = "manifest-win.json";
  private static final String NON_WINDOWS_MANIFEST_FILE = "manifest-nonwin.json";
  private static final String MANIFEST_FILE = "manifest.json";

  private static volatile File defaultExtensionDir;

  private final File directory;

  /**
   * Create a new instance that manages the extension in the specified
   * directory. Assumes that the directory exists and has the required
   * files.

   * @param directory The directory to use as the Chrome extension.
   * @throws WebDriverException If the directory is not valid (e.g. does not
   *     contain a manifest.json file).
   */
  public ChromeExtension(File directory) throws WebDriverException {
    try {
      this.directory = checkExtensionForManifest(directory);
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }

  /**
   * Creates a new instance using the directory specified by the criteria
   * defined by {@link #findChromeExtensionDir()}.
   *
   * @see ChromeExtension(File)
   * @see ChromeExtension#findChromeExtensionDir()
   */
  public ChromeExtension() {
    this(findChromeExtensionDir());
  }

  public File getDirectory() {
    return directory;
  }

  /**
   * Searches for the Chrome extension directory to use. Will first check the
   * directory specified by the {@code webdriver.chrome.extensiondir} system
   * property, and then will check the current classpath for
   * {@code chrome-extension.zip}.
   *
   * @return The Chrome extension directory.
   */
  public static File findChromeExtensionDir() {
    File directory = defaultExtensionDir;
    if (directory == null) {
      synchronized (ChromeExtension.class) {
        directory = defaultExtensionDir;
        if (directory == null) {
          directory = defaultExtensionDir = loadExtension();
        }
      }
    }
    return directory;
  }

  /**
   * Verifies that the given {@code directory} is a valid Chrome extension
   * directory. Will check if the directory has the required
   * {@code manifest.json} file.  If not, it will check for the correct
   * platform manifest and copy it over.
   *
   * @param directory The directory to check.
   * @return The verified directory.
   * @throws IOException If the directory is not valid.
   */
  private static File checkExtensionForManifest(File directory) throws IOException {
    if (!directory.isDirectory()) {
      throw new FileNotFoundException(String.format(
          "The specified directory is not a Chrome extension directory: %s; Try setting %s",
          directory.getAbsolutePath(), CHROME_EXTENSION_DIRECTORY_PROPERTY));
    }

    File manifestFile = new File(directory, MANIFEST_FILE);
    if (!manifestFile.exists()) {
      String platformManifest = Platform.getCurrent().is(Platform.WINDOWS)
          ? WINDOWS_MANIFEST_FILE : NON_WINDOWS_MANIFEST_FILE;

      File platformManifestFile = new File(directory, platformManifest);
      if (!platformManifestFile.exists()) {
        throw new FileNotFoundException(String.format(
            "The specified extension has neither a %s file, nor the platform template, %s: %s",
            MANIFEST_FILE, platformManifestFile.getAbsolutePath(), directory.getAbsolutePath()));
      }

      FileHandler.copy(platformManifestFile, manifestFile);
    }
    return directory;
  }

  private static File loadExtension() {
    try {
      File extensionDir;
      String directory = System.getProperty(CHROME_EXTENSION_DIRECTORY_PROPERTY);
      if (directory != null && !"".equals(directory)) {
        extensionDir = new File(directory);
      } else {
        InputStream stream = ChromeProfile.class.getResourceAsStream(DEFAULT_EXTENSION_PATH);
        extensionDir = FileHandler.unzip(stream);
      }
      return checkExtensionForManifest(extensionDir);
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }
}