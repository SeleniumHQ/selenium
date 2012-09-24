/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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

package org.openqa.selenium.safari;

import static com.google.common.base.Preconditions.checkState;

import com.google.common.base.Charsets;
import com.google.common.base.Joiner;
import com.google.common.base.Strings;
import com.google.common.io.Files;

import org.openqa.selenium.Platform;

import java.io.File;
import java.io.IOException;
import java.util.logging.Logger;

/**
 * Manages the installation of the SafariDriver browser extension. The extension
 * may currently be installed from the following sources:
 * <ul>
 *   <li>A pre-packaged Safari .safariextz file specified through the
 *       {@link #EXTENSION_LOCATION_PROPERTY} system property.
 *       <em>Using this option will uninstall all other extensions.</em></li>
 * </ul>
 */
class SafariDriverExtension {

  // TODO: Add the ability to install the extension packaged with this JAR.
  // This will require us to distribute a prebuilt extension. See
  // http://code.google.com/p/selenium/issues/detail?id=4107

  private static final Logger logger = Logger.getLogger(SafariDriverExtension.class.getName());

  /**
   * System property that defines the location of an existing, pre-packaged
   * SafariDriver extension to install.
   */
  public static final String EXTENSION_LOCATION_PROPERTY = "webdriver.safari.driver";

  private static final String EXTENSION_PLIST_LINES = Joiner.on("\n").join(
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
      "<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\"" +
          " \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">",
      "<plist version=\"1.0\">",
      "<dict>",
      "\t<key>Available Updates</key>",
      "\t<dict>",
      "\t\t<key>Last Update Check Time</key>",
      "\t\t<real>370125644.75941497</real>",
      "\t\t<key>Updates List</key>",
      "\t\t<array/>",
      "\t</dict>",
      "\t<key>Installed Extensions</key>",
      "\t<array>",
      "\t\t<dict>",
      "\t\t\t<key>Added Non-Default Toolbar Items</key>",
      "\t\t\t<array/>",
      "\t\t\t<key>Archive File Name</key>",
      "\t\t\t<string>WebDriver.safariextz</string>",
      "\t\t\t<key>Bundle Directory Name</key>",
      "\t\t\t<string>WebDriver.safariextension</string>",
      "\t\t\t<key>Enabled</key>",
      "\t\t\t<true/>",
      "\t\t\t<key>Hidden Bars</key>",
      "\t\t\t<array/>",
      "\t\t\t<key>Removed Default Toolbar Items</key>",
      "\t\t\t<array/>",
      "\t\t</dict>",
      "\t</array>",
      "\t<key>Version</key>",
      "\t<integer>1</integer>",
      "</dict>",
      "</plist>");

  /**
   * @return The directory that the SafariDriver extension should be installed
   *     to for the current platform.
   * @throws IllegalStateException If the extension cannot be installed on the
   *     current platform.
   */
  private static File getInstallDirectory() {
    Platform current = Platform.getCurrent();
    if (Platform.MAC.is(current)) {
      return new File("/Users/" + System.getenv("USER"), "Library/Safari/Extensions");
    } else if (Platform.WINDOWS.is(current)) {
      return new File(System.getenv("APPDATA"), "Apple Computer/Safari/Extensions");
    }

    throw new IllegalStateException(
        "Unable to install the SafariDriver extension on the current platform");
  }

  /**
   * Installs the SafariDriver extension, if available.
   *
   * <p><strong>Warning:</strong> This method will uninstall all currently
   * installed extensions.
   *
   * @throws IOException If an I/O error occurs.
   */
  public void install() throws IOException {
    String extensionPath = System.getProperty(EXTENSION_LOCATION_PROPERTY);
    if (Strings.isNullOrEmpty(extensionPath)) {
      return;  // No extension specified; nothing to do.
    }

    File extensionSrc = new File(extensionPath);
    checkState(extensionSrc.isFile(),
        "The SafariDriver extension specified through the %s system property does not exist: %s",
        EXTENSION_LOCATION_PROPERTY, extensionPath);
    checkState(extensionSrc.canRead(),
        "The SafariDriver extension specified through the %s system property is not readable: %s",
        EXTENSION_LOCATION_PROPERTY, extensionPath);

    logger.info(String.format("Installing %s defined extension: %s",
        EXTENSION_LOCATION_PROPERTY, extensionSrc.getAbsolutePath()));

    File extensionDest = new File(getInstallDirectory(), "WebDriver.safariextz");
    Files.copy(extensionSrc, extensionDest);

    File extensionPlist = new File(getInstallDirectory(), "Extensions.plist");
    Files.write(EXTENSION_PLIST_LINES, extensionPlist, Charsets.UTF_8);
  }
}
