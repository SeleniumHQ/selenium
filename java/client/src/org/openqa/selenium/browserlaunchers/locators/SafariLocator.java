package org.openqa.selenium.browserlaunchers.locators;

import org.openqa.selenium.os.WindowsUtils;

/**
 * Discovers a valid Internet Explorer installation on local system.
 */
public class SafariLocator extends SingleBrowserLocator {

  private static final String[] USUAL_UNIX_LAUNCHER_LOCATIONS = {
      "/Applications/Safari.app/Contents/MacOS",
  };

  private static final String[] USUAL_WINDOWS_LAUNCHER_LOCATIONS = {
      WindowsUtils.getProgramFilesPath() + "\\Safari"
  };

  @Override
  protected String browserName() {
    return "Safari";
  }

  @Override
  protected String seleniumBrowserName() {
    return "safari";
  }

  @Override
  protected String[] standardlauncherFilenames() {
    if (WindowsUtils.thisIsWindows()) {
      return new String[] {"Safari.exe"};
    } else {
      return new String[] {"Safari"};
    }
  }

  @Override
  protected String browserPathOverridePropertyName() {
    return "SafariDefaultPath";
  }

  @Override
  protected String[] usualLauncherLocations() {
    return WindowsUtils.thisIsWindows()
        ? USUAL_WINDOWS_LAUNCHER_LOCATIONS
        : USUAL_UNIX_LAUNCHER_LOCATIONS;
  }

}
