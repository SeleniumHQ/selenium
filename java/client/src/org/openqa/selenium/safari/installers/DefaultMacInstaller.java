package org.openqa.selenium.safari.installers;

import static com.google.common.base.Preconditions.checkState;

import com.google.common.base.Optional;

import org.openqa.selenium.safari.helpers.GlobalExtensionStatus;

import java.io.File;

public class DefaultMacInstaller extends SafariExtensionInstaller {

  public DefaultMacInstaller(String extensionResourcePath, Optional<File> customDataDir) {
    super(extensionResourcePath, customDataDir);
    enableSafariExtensions();
  }

  @Override
  protected File getSafariDataDirectory() {
      return new File("/Users/" + System.getenv("USER"), "Library/Safari");
  }

  /**
   * Attempts to enable Safari extensions on OSX Platform.
   * If it fails, throws an IllegalStateException
   *
   * @throws IllegalStateException If the extension cannot be enabled
   */
  protected void enableSafariExtensions() {
    if (GlobalExtensionStatus.safariExtensionsEnabled()) {
      return;
    }

    GlobalExtensionStatus.attemptToEnableExtensions();

    checkState(GlobalExtensionStatus.safariExtensionsEnabled(),
               "Error occurred enabling Safari Extensions on this machine. "
               + "Please enable Safari extensions manually to use SafariDriver");

  }

}
