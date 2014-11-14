package org.openqa.selenium.safari.installers;

import com.google.common.base.Optional;

import java.io.File;

public class WindowsInstaller extends SafariExtensionInstaller {


  public WindowsInstaller(String extensionResourcePath, Optional<File> customDataDir) {
    super(extensionResourcePath, customDataDir);
  }

  @Override
  protected File getSafariDataDirectory() {
    return new File(System.getenv("APPDATA"), "Apple Computer/Safari");
  }
}
