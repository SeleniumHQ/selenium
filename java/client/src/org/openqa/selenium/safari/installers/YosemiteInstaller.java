package org.openqa.selenium.safari.installers;

import static com.google.common.base.Preconditions.checkState;

import com.google.common.base.Optional;
import com.google.common.base.Throwables;

import org.openqa.selenium.safari.applescripts.AppleScripts;
import org.openqa.selenium.safari.helpers.CLICommandExecutor;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.logging.Logger;


public class YosemiteInstaller extends DefaultMacInstaller {

  private static final Logger logger = Logger.getLogger(YosemiteInstaller.class.getName());

  public YosemiteInstaller(String extensionResourcePath,
                           Optional<File> customDataDir) {
    super(extensionResourcePath, customDataDir);
  }

  @Override
  public void install(boolean overwriteExisting, List<File> thirdPartyExtensions)
      throws IOException {
    if (!overwriteExisting && thirdPartyExtensions.isEmpty()) {
      logger
          .info("Use of custom SafariDriver was detected and no third party extensions to install. "
                + "Exiting installer");
      return;
    }

    AppleScripts.notifySafariDriverInstallation();

    if (overwriteExisting) {
      logger.info("Installing SafariDriver Extension");
      installSafariDriver();
      AppleScripts.activateExtensionViaGui(extensionExecutable);
    }

    installThirdPartyExtensions(thirdPartyExtensions);

    for (File thirdPartyExtension : thirdPartyExtensions) {
      AppleScripts.activateExtensionViaGui(thirdPartyExtension);
    }

    AppleScripts.tellSafariToQuit();

    checkState(isSafariDriverInstalled(),
               "Error automatically installing SafariDriver, please check local "
               + "logs for more info or install SafariDriver Manually. "
               + "SafariDriver extension should be located in this directory: " +
               extensionExecutable.getParentFile().getAbsolutePath());

  }

  protected boolean isSafariDriverInstalled() {

    int status = checkKeychain();

    switch (status) {
      case 0:
        return true;
      case 44:
        throwError("'Safari Extensions List' was not found in the Keychain Accesses");
      case 36:
        throwError("SafariDriver needs to have access to System GUI. "
                   + "Running this process as a service or through SSH is not allowed.");
      case 51:
        throwError("SafariDriver needs access to 'Safari Extensions List' application password "
                   + " in the login.keychain. Please allow it access.");
      default:
        throwError("SafariDriver is not installed for current user, no error provided.");

    }

    return false;
  }

  protected void throwError(String error) {
    checkState(false, error);
  }

  /**
   * Asks the keychain if SafariDriver is currently installed and enabled.
   *
   * @return int value:  -1   Not installed, no reason provided, 0   Installed, 44  'Safari
   *         Extension List' application password not found in keychain, 36  Process is running in
   *         GUI-less mode, such as via SSH, 51  Access to 'Safari Extension List' is not permitted
   */

  protected int checkKeychain() {

    File queryOutput = new File("/tmp/keychain_output.txt");
    CLICommandExecutor executor = AppleScripts.askKeychainIfSafariIsInstalled(queryOutput);

    if (executor == null) {
      return -1;
    }

    if (executor.getExitCode() != 0) {

      String stdError = executor.getStandardError();
      if (stdError.contains("(44)")) {
        return 44;
      } else if (stdError.contains("(36)")) {
        return 36;
      } else if (stdError.contains("(51)")) {
        return 51;
      }
    }

    byte[] encoded;
    try {
      encoded = Files.readAllBytes(Paths.get(queryOutput.getAbsolutePath()));
      String output = new String(encoded, StandardCharsets.UTF_8);

      if (output.contains("WebDriver")) {
        return 0;
      }
    } catch (IOException e) {
      logger.warning(
          String.format("Error reading output file %s,\n%s",
                        queryOutput.getAbsolutePath(),
                        Throwables.getStackTraceAsString(e)));
    }

    return -1;
  }


}
