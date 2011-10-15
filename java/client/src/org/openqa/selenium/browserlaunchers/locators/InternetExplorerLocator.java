package org.openqa.selenium.browserlaunchers.locators;

import org.openqa.selenium.os.WindowsUtils;
import org.openqa.selenium.remote.BrowserType;

/**
 * Discovers a valid Internet Explorer installation on local system.
 */
public class InternetExplorerLocator extends SingleBrowserLocator {

  private static final String[] USUAL_WINDOWS_LAUNCHER_LOCATIONS = {
      WindowsUtils.getProgramFilesPath() + "\\Internet Explorer"
  };

  @Override
  protected String browserName() {
    return "Internet Explorer";
  }

  @Override
  protected String seleniumBrowserName() {
    return BrowserType.IEXPLORE;
  }

  @Override
  protected String[] standardlauncherFilenames() {
    return new String[] {"iexplore.exe"};
  }

  @Override
  protected String browserPathOverridePropertyName() {
    return "internetExplorerDefaultPath";
  }

  @Override
  protected String[] usualLauncherLocations() {
    return WindowsUtils.thisIsWindows() ? USUAL_WINDOWS_LAUNCHER_LOCATIONS : new String[0];
  }

}
