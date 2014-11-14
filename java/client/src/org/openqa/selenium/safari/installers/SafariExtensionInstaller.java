package org.openqa.selenium.safari.installers;

import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.base.Preconditions.checkState;
import static com.google.common.io.Files.write;

import com.google.common.base.Charsets;
import com.google.common.base.Optional;
import com.google.common.base.Strings;
import com.google.common.io.ByteSource;
import com.google.common.io.Files;
import com.google.common.io.Resources;

import org.openqa.selenium.Platform;
import org.openqa.selenium.safari.helpers.ExtensionBackup;
import org.openqa.selenium.safari.helpers.ExtensionsPlistBuilder;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URL;
import java.util.LinkedList;
import java.util.List;
import java.util.logging.Logger;

public abstract class SafariExtensionInstaller {

  protected static final Logger logger = Logger.getLogger(SafariExtensionInstaller.class.getName());
  protected static final String WEB_DRIVER_SAFARIEXTZ = "WebDriver.safariextz";
  protected final Optional<File> customDataDir;
  protected final File extensionInstallDir;
  protected final String extensionResourcePath;
  protected final ExtensionBackup backup;
  protected final File extensionExecutable;
  File extensionPlist;

  /**
   * System property that defines the location of an existing, pre-packaged SafariDriver extension
   * to install.
   */
  public static final String EXTENSION_LOCATION_PROPERTY = "webdriver.safari.driver";
  private List<File> installedExtensions;

  public SafariExtensionInstaller(String extensionResourcePath, Optional<File> customDataDir) {
    this.customDataDir = customDataDir;
    this.extensionResourcePath = extensionResourcePath;
    this.extensionInstallDir = getExtensionInstallDirectory(this.customDataDir);
    this.backup = new ExtensionBackup();
    this.installedExtensions = new LinkedList<File>();
    this.extensionPlist = new File(this.extensionInstallDir, "Extensions.plist");
    this.extensionExecutable = new File(this.extensionInstallDir, WEB_DRIVER_SAFARIEXTZ);
  }


  /**
   * Returns an appropriate extension installer based on the current Platform
   *
   * @return Instance of SafariExtensionInstaller.
   * @throws IllegalStateException If the current platform is unsupported.
   */

  public static SafariExtensionInstaller getInstaller(String extensionResourcePath,
                                                      Optional<File> customDataDir) {

    if (Platform.getCurrent().is(Platform.MAC) && isYosemiteOrAbove()) {
      return new YosemiteInstaller(extensionResourcePath, customDataDir);
    } else if (Platform.getCurrent().is(Platform.MAC)) {
      return new DefaultMacInstaller(extensionResourcePath, customDataDir);
    } else if (Platform.getCurrent().is(Platform.WINDOWS)) {
      return new WindowsInstaller(extensionResourcePath, customDataDir);
    }
    throw new IllegalStateException(
        "The current platform is not supported: " + Platform.getCurrent());

  }

  /**
   * Installs SafariDriver Extension and any Third Party extension specified
   *
   * @param overwriteExisting    true: Install the newest version of SafariDriver from source false:
   *                             Do not overwrite existing extension on the Drive
   * @param thirdPartyExtensions List of third party extensions to be installed for the test
   *                             session
   */
  public void install(boolean overwriteExisting, List<File> thirdPartyExtensions)
      throws IOException {

    if (!overwriteExisting && thirdPartyExtensions.isEmpty()) {
      logger
          .info("Use of custom SafariDriver was detected and no third party extensions to install. "
                + "Exiting installer");
      return;
    }

    if (overwriteExisting) {
      logger.info("Installing SafariDriver Extension");
      installSafariDriver();
    }

    installThirdPartyExtensions(thirdPartyExtensions);

    updateExtensionsPlist();
  }

  /**
   * Uninstalls all of the extensions that were installed in the beginning of the session and
   * restores any extension which was originally there.
   */
  public void uninstall() throws IOException {
    for (File installedExtension : installedExtensions) {
      installedExtension.delete();
    }

    if (this.extensionExecutable.exists()) {
      this.extensionExecutable.delete();
    }
    if (this.extensionPlist.exists()) {
      this.extensionPlist.delete();
    }

    backup.restoreAll();
  }

  protected static boolean isYosemiteOrAbove(){
    int minorVersion = Integer.valueOf(System.getProperty("os.version").split("\\.")[1]);
    return minorVersion >= 10;
  }


  /**
   * Writes the SafariDriver extension to Safari's Extensions directory
   */

  protected void installSafariDriver() throws IOException {
    ByteSource extensionSrc = getExtensionFromSystemProperties().or(getExtensionResource());
    writeExtensionToDisk(extensionSrc, extensionExecutable);
  }

  /**
   * Writes any third party extensions specified by the user to Safari's Extensions directory
   */
  protected void installThirdPartyExtensions(List<File> safariExtensionFiles) throws IOException {
    // Install other extensions, if any
    for (File extensionFile : safariExtensionFiles) {
      File targetFile = new File(this.extensionInstallDir, extensionFile.getName());
      if (targetFile.getCanonicalPath().equals(extensionFile.getCanonicalPath())) {
        // The user wants to keep using an existing extension,
        // and added the path of an existing extension to the list.
        // Back-up the .safariextz file, because Safari will remove it on installation
        backup.backup(targetFile);
        installedExtensions.add(targetFile);
        continue;
      }
      ByteSource extensionSrc = Files.asByteSource(extensionFile);
      writeExtensionToDisk(extensionSrc, targetFile);
    }
  }

  protected synchronized void updateExtensionsPlist() throws IOException {
    if (extensionPlist.exists()) {
      backup.backup(extensionPlist);
    }
    // Generate Extensions.plist and save it

    write(ExtensionsPlistBuilder.buildPlist(installedExtensions), extensionPlist, Charsets.UTF_8);
  }


  /**
   * @return Safari's application data directory for the current platform.
   * @throws IllegalStateException If the current platform is unsupported.
   */
  protected abstract File getSafariDataDirectory();

  /**
   * @param customDataDir Location of the data directory for a custom Safari installation. If
   *                      omitted, the {@link #getSafariDataDirectory() default data directory} is
   *                      used
   * @return The directory that the SafariDriver extension should be installed to for the current
   *         platform.
   * @throws IllegalStateException If the extension cannot be installed on the current platform.
   * @throws java.io.IOException   If an I/O error occurs.
   */
  protected File getExtensionInstallDirectory(Optional<File> customDataDir) {
    File dataDir = customDataDir.or(getSafariDataDirectory());
    checkIfDirectoryExists(dataDir);
    File extensionsDir = new File(dataDir, "Extensions");
    if (!extensionsDir.isDirectory()) {
      extensionsDir.mkdir();
    }
    checkIfDirectoryExists(extensionsDir);

    File databasesDir = new File(dataDir, "Databases");
    if (!databasesDir.exists()) {
      databasesDir.mkdir();
    }
    checkIfDirectoryExists(databasesDir);

    return extensionsDir;
  }


  protected static void checkIfDirectoryExists(File dir) {
    checkState(dir.exists(),
               "SafariDriver needs the following directory to exist, in order to work properly: %s",
               dir.getAbsolutePath());
  }

  protected static Optional<ByteSource> getExtensionFromSystemProperties()
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


  protected ByteSource getExtensionResource() {
    URL url = SafariExtensionInstaller.class.getResource(this.extensionResourcePath);
    checkNotNull(url, "Unable to locate extension resource, %s", this.extensionResourcePath);
    return Resources.asByteSource(url);
  }

  /**
   * Writes a Safari extension to disk
   *
   * @param extensionSrc ByteSource of the extension to be written to disk
   * @param targetFile   File location to be written to.
   */
  protected synchronized void writeExtensionToDisk(ByteSource extensionSrc, File targetFile)
      throws IOException {
    if (targetFile.exists()) {
      backup.backup(targetFile);
    }
    extensionSrc.copyTo(Files.asByteSink(targetFile));
    installedExtensions.add(targetFile);
  }


}
