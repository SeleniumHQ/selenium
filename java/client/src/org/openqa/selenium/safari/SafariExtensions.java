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

import org.openqa.selenium.safari.helpers.UninstallThread;
import org.openqa.selenium.safari.installers.SafariExtensionInstaller;

import com.google.common.base.Optional;
import com.google.common.collect.Lists;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.logging.Logger;

/**
 * Manages the installation of the SafariDriver browser extension. This class will backup and
 * uninstall all extensions before installing the SafariDriver browser extension. The SafariDriver
 * may currently installed from one of two locations: <ol> <li>A pre-built extension included with
 * this jar.</li> <li>A pre-packaged Safari .safariextz file specified through the {@link
 * #EXTENSION_LOCATION_PROPERTY} system property.</li> </ol> To use a pre-installed version of the
 * SafariDriver, set the {@link #NO_INSTALL_EXTENSION_PROPERTY} to {@code true}.
 */
class SafariExtensions {


  private static final Logger logger = Logger.getLogger(SafariExtensions.class.getName());

  /**
   * System property that defines the location of an existing, pre-packaged SafariDriver extension
   * to install.
   */
  public static final String EXTENSION_LOCATION_PROPERTY = "webdriver.safari.driver";

  /**
   * System property that disables installing a prebuilt SafariDriver extension on start up.
   */
  public static final String NO_INSTALL_EXTENSION_PROPERTY = "webdriver.safari.noinstall";

  private static final String EXTENSION_RESOURCE_PATH = String.format(
      "/%s/SafariDriver.safariextz",
      SafariExtensions.class.getPackage().getName().replace('.', '/'));

  private final Runtime runtime;
  private final Optional<File> customDataDir;
  private final boolean installExtension;
  private final List<File> safariExtensionFiles;

  private final SafariExtensionInstaller installer;

  private UninstallThread uninstallThread;
  private List<File> installedExtensions;
  private File extensionPlist;

  /**
   * Installs the Driver extension and/or other user-defined extensions using a non-standard
   * directory for the system's Safari installation. The configuration is derived from the {@link
   * SafariOptions} instance. This configuration can be overridden by explicitly setting the {@link
   * #NO_INSTALL_EXTENSION_PROPERTY} system property, which prevents the SafariDriver from
   * installing or removing extensions.
   *
   * @param options A {@link SafariOptions} instance, which provides the configuration.
   * @see SafariOptions#dataDir
   * @see SafariOptions#useCustomDriverExtension
   * @see SafariOptions#skipExtensionInstallation
   * @see SafariOptions#extensionFiles
   */
  SafariExtensions(SafariOptions options) {
    this.runtime = Runtime.getRuntime();
    this.customDataDir = options.getDataDir();
    this.installExtension = !Boolean.getBoolean(NO_INSTALL_EXTENSION_PROPERTY) &&
                            !options.getUseCustomDriverExtension();
    this.safariExtensionFiles = options.getExtensions();
    this.installer =
        SafariExtensionInstaller.getInstaller(EXTENSION_RESOURCE_PATH, this.customDataDir);
  }


  /**
   * Installs the SafariDriver extension, if available.
   *
   * <p><strong>Warning:</strong> This method will uninstall all currently installed extensions.
   * They will be restored when {@link #uninstall()} is called.
   *
   * @throws IOException If an I/O error occurs.
   */
  public synchronized void install() throws IOException {
    if (uninstallThread != null) {
      return;  // Already installed.
    }
    int numberOfExtensions = (this.installExtension ? 1 : 0) + (safariExtensionFiles.size());
    installedExtensions = Lists.newArrayListWithExpectedSize(numberOfExtensions);

    installer.install(installExtension, safariExtensionFiles);

    uninstallThread = new UninstallThread(installer);
    runtime.addShutdownHook(uninstallThread);
  }

  /**
   * Un-installs all extensions installed by this Safari driver, and restores backed-up files.
   *
   * @throws IOException If an I/O error occurs.
   */
  public synchronized void uninstall() throws IOException {
    if (uninstallThread != null) {
      try {
        runtime.removeShutdownHook(uninstallThread);
      } catch (IllegalStateException shutdownInProgress) {
        // Do nothing.
      }
      uninstallThread = null;
      installer.uninstall();
    }
  }


}
