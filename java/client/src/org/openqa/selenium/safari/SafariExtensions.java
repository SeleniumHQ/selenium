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

import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.base.Preconditions.checkState;
import static com.google.common.io.Files.copy;
import static com.google.common.io.Files.write;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.io.TemporaryFilesystem;

import com.google.common.base.Charsets;
import com.google.common.base.Joiner;
import com.google.common.base.Optional;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.io.ByteSource;
import com.google.common.io.Files;
import com.google.common.io.Resources;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

/**
 * Manages the installation of the SafariDriver browser extension. This class
 * will backup and uninstall all extensions before installing the SafariDriver
 * browser extension. The SafariDriver may currently installed from one of two
 * locations:
 * <ol>
 *   <li>A pre-built extension included with this jar.</li>
 *   <li>A pre-packaged Safari .safariextz file specified through the
 *       {@link #EXTENSION_LOCATION_PROPERTY} system property.</li>
 * </ol>
 * To use a pre-installed version of the SafariDriver, set the
 * {@link #NO_INSTALL_EXTENSION_PROPERTY} to {@code true}.
 */
class SafariExtensions {

  private static final Logger logger = Logger.getLogger(SafariExtensions.class.getName());

  /**
   * System property that defines the location of an existing, pre-packaged
   * SafariDriver extension to install.
   */
  public static final String EXTENSION_LOCATION_PROPERTY = "webdriver.safari.driver";

  /**
   * System property that disables installing a prebuilt SafariDriver extension on
   * start up.
   */
  public static final String NO_INSTALL_EXTENSION_PROPERTY = "webdriver.safari.noinstall";

  private static final String EXTENSION_RESOURCE_PATH = String.format(
      "/%s/SafariDriver.safariextz",
      SafariExtensions.class.getPackage().getName().replace('.', '/'));

  private static final String EXTENSION_PLIST_LINES_HEAD = Joiner.on("\n").join(
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
      "\t<array>\n");

  private static final String EXTENSION_PLIST_LINES_ITEM = Joiner.on("\n").join(
      "\t\t<dict>",
      "\t\t\t<key>Added Non-Default Toolbar Items</key>",
      "\t\t\t<array/>",
      "\t\t\t<key>Archive File Name</key>",
      "\t\t\t<string>%s.safariextz</string>",       // %s = name
      "\t\t\t<key>Bundle Directory Name</key>",
      "\t\t\t<string>%s.safariextension</string>",  // %s = name
      "\t\t\t<key>Enabled</key>",
      "\t\t\t<true/>",
      "\t\t\t<key>Hidden Bars</key>",
      "\t\t\t<array/>",
      "\t\t\t<key>Removed Default Toolbar Items</key>",
      "\t\t\t<array/>",
      "\t\t</dict>\n");

  private static final String EXTENSION_PLIST_LINES_TAIL = Joiner.on("\n").join(
      "\t</array>",
      "\t<key>Version</key>",
      "\t<integer>1</integer>",
      "</dict>",
      "</plist>");

  private final Runtime runtime;
  private final Backup backup;
  private final Optional<File> customDataDir;
  private final boolean installExtension;
  private final List<File> safariExtensionFiles;

  private UninstallThread uninstallThread;
  private List<File> installedExtensions;
  private File extensionPlist;

  /**
   * Installs the Driver extension and/or other user-defined extensions using a
   * non-standard directory for the system's Safari installation.
   * The configuration is derived from the {@link SafariOptions} instance.
   * This configuration can be overridden by explicitly setting the
   * {@link #NO_INSTALL_EXTENSION_PROPERTY} system property, which prevents the
   * SafariDriver from installing or removing extensions.
   *
   * @param options A {@link SafariOptions} instance, which provides the configuration.
   * @see SafariOptions#dataDir
   * @see SafariOptions#useCustomDriverExtension
   * @see SafariOptions#skipExtensionInstallation
   * @see SafariOptions#extensionFiles
   */
  SafariExtensions(SafariOptions options) {
    this.runtime = Runtime.getRuntime();
    this.backup = new Backup();
    this.customDataDir = options.getDataDir();
    this.installExtension = !Boolean.getBoolean(NO_INSTALL_EXTENSION_PROPERTY) &&
                            !options.getUseCustomDriverExtension();
    this.safariExtensionFiles = options.getExtensions();
  }

  /**
   * @return Safari's application data directory for the current platform.
   * @throws IllegalStateException If the current platform is unsupported.
   */
  private static File getSafariDataDirectory() {
    Platform current = Platform.getCurrent();
    if (Platform.MAC.is(current)) {
      return new File("/Users/" + System.getenv("USER"), "Library/Safari");
    } else if (Platform.WINDOWS.is(current)) {
      return new File(System.getenv("APPDATA"), "Apple Computer/Safari");
    }

    throw new IllegalStateException("The current platform is not supported: " + current);
  }

  /**
   * @param customDataDir Location of the data directory for a custom Safari
   *     installation. If omitted, the {@link #getSafariDataDirectory() default
   *     data directory} is used
   * @return The directory that the SafariDriver extension should be installed
   *     to for the current platform.
   * @throws IllegalStateException If the extension cannot be installed on the
   *     current platform.
   * @throws IOException If an I/O error occurs.
   */
  private static File getInstallDirectory(Optional<File> customDataDir) throws IOException {
    File dataDir = customDataDir.or(getSafariDataDirectory());
    checkState(dataDir.isDirectory(),
        "The expected Safari data directory does not exist: %s",
        dataDir.getAbsolutePath());

    File extensionsDir = new File(dataDir, "Extensions");
    if (!extensionsDir.isDirectory()) {
      extensionsDir.mkdir();
    }
    return extensionsDir;
  }

  /**
   * Installs the SafariDriver extension, if available.
   *
   * <p><strong>Warning:</strong> This method will uninstall all currently
   * installed extensions. They will be restored when {@link #uninstall()} is
   * called.
   *
   * @throws IOException If an I/O error occurs.
   */
  public synchronized void install() throws IOException {
    if (uninstallThread != null) {
      return;  // Already installed.
    }
    int numberOfExtensions = (this.installExtension ? 1 : 0) + (safariExtensionFiles.size());
    installedExtensions = Lists.newArrayListWithExpectedSize(numberOfExtensions);

    if (!installExtension) {
      logger.info("Use of custom driver extension requested; skipping installation");
      if (safariExtensionFiles.isEmpty()) {
        return;  // Nothing to install.
      }
    }

    File installDirectory = getInstallDirectory(customDataDir);

    // Install SafariDriver extension, if wanted
    if (installExtension) {
        ByteSource extensionSrc = getExtensionFromSystemProperties().or(getExtensionResource());
        File targetFile = new File(installDirectory, "WebDriver.safariextz");
        installExtension(extensionSrc, targetFile);
    }
    // Install other extensions, if any
    for (File extensionFile : safariExtensionFiles) {
        File targetFile = new File(installDirectory, extensionFile.getName());
        if (targetFile.getCanonicalPath().equals(extensionFile.getCanonicalPath())) {
            // The user wants to keep using an existing extension,
            // and added the path of an existing extension to the list.
            // Back-up the .safariextz file, because Safari will remove it on installation
            backup.backup(targetFile);
            installedExtensions.add(targetFile);
            continue;
        }
        ByteSource extensionSrc = Files.asByteSource(extensionFile);
        installExtension(extensionSrc, targetFile);
    }

    // Create Extensions.plist (backup if needed)
    replaceExtensionsPlist(installDirectory);

    uninstallThread = new UninstallThread();
    runtime.addShutdownHook(uninstallThread);
  }

  /**
   * Copy a Safari extension to the target location. Any existing file is backed up.
   */
  private synchronized void installExtension(ByteSource extensionSrc, File targetFile)
      throws IOException {
    if (targetFile.exists()) {
      backup.backup(targetFile);
    }
    extensionSrc.copyTo(Files.asByteSink(targetFile));
    installedExtensions.add(targetFile);
  }

  private synchronized void replaceExtensionsPlist(File installDirectory) throws IOException {
    extensionPlist = new File(installDirectory, "Extensions.plist");
    if (extensionPlist.exists()) {
      backup.backup(extensionPlist);
    }
    // Generate Extensions.plist and save it
    StringBuilder plistContent = new StringBuilder(EXTENSION_PLIST_LINES_HEAD);
    for (File extensionFile : installedExtensions) {
      String basename = Files.getNameWithoutExtension(extensionFile.getName()); // Strip .safariextz
      plistContent.append(String.format(EXTENSION_PLIST_LINES_ITEM, basename, basename));
    }
    plistContent.append(EXTENSION_PLIST_LINES_TAIL);
    write(plistContent.toString(), extensionPlist, Charsets.UTF_8);
  }

  private static Optional<ByteSource> getExtensionFromSystemProperties()
      throws FileNotFoundException {
    String extensionPath = System.getProperty(EXTENSION_LOCATION_PROPERTY);
    if (Strings.isNullOrEmpty(extensionPath)) {
      return Optional.absent();
    }

    File extensionSrc = new File(extensionPath);
    checkState(extensionSrc.isFile(),
        "The SafariDriver extension specified through the %s system property does not exist: %s",
        EXTENSION_LOCATION_PROPERTY, extensionPath);
    checkState(extensionSrc.canRead(),
        "The SafariDriver extension specified through the %s system property is not readable: %s",
        EXTENSION_LOCATION_PROPERTY, extensionPath);

    logger.info("Using extension " + extensionSrc.getAbsolutePath());

    return Optional.<ByteSource>of(Files.asByteSource(extensionSrc));
  }

  private static ByteSource getExtensionResource() {
    URL url = SafariExtensions.class.getResource(EXTENSION_RESOURCE_PATH);
    checkNotNull(url, "Unable to locate extension resource, %s", EXTENSION_RESOURCE_PATH);
    return Resources.asByteSource(url);
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

      for (File installedExtension : installedExtensions) {
          installedExtension.delete();
      }
      // .safariextz installation files are automatically deleted on install,
      // but the Extensions.plist file has to be deleted manually.
      extensionPlist.delete();

      backup.restoreAll();
    }
  }

  private static class Backup {

    private final TemporaryFilesystem filesystem = TemporaryFilesystem.getDefaultTmpFS();
    private final Map<File, File> backups = Maps.newHashMap();

    private File backupDir;

    File backup(File file) throws IOException {
      if (backupDir == null) {
        backupDir = filesystem.createTempDir("SafariBackups", "webdriver");
      }
      File backup = new File(backupDir, file.getName());
      copy(file, backup);
      backups.put(file, backup);
      return backup;
    }

    void restoreAll() throws IOException {
      for (Map.Entry<File, File> entry : backups.entrySet()) {
        File originalLocation = entry.getKey();
        File backup = entry.getValue();
        copy(backup, originalLocation);
      }
    }
  }

  private class UninstallThread extends Thread {
    @Override
    public void run() {
      try {
        uninstall();
      } catch (IOException e) {
        throw new WebDriverException("Unable to uninstall extension", e);
      }
    }
  }
}
