package org.openqa.selenium.safari.helpers;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.safari.installers.SafariExtensionInstaller;

import java.io.IOException;

public class UninstallThread extends Thread {

  private final SafariExtensionInstaller installer;

  public UninstallThread(SafariExtensionInstaller installer){
    this.installer = installer;
  }

  @Override
  public void run() {
    try {
      this.installer.uninstall();
    } catch (IOException e) {
      throw new WebDriverException("Unable to uninstall extension", e);
    }
  }
}
