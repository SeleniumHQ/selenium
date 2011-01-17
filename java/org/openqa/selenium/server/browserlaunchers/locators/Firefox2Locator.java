package org.openqa.selenium.server.browserlaunchers.locators;

import java.io.File;

import org.openqa.selenium.Platform;
import org.openqa.selenium.os.WindowsUtils;
import org.openqa.selenium.os.CommandLine;

/**
 * Discovers a valid Firefox 2.x installation on local system.
 */
public class Firefox2Locator extends FirefoxLocator {

    private static final String[] USUAL_UNIX_LAUNCHER_LOCATIONS = {
            "/Applications/Firefox-2.app/Contents/MacOS",
            "/Applications/Firefox.app/Contents/MacOS",
            "/usr/lib/firefox", /* Ubuntu 7.x default location */
    };

    private static final String[] USUAL_WINDOWS_LAUNCHER_LOCATIONS = {
            WindowsUtils.getProgramFilesPath() + "\\Mozilla Firefox",
            WindowsUtils.getProgramFilesPath() + "\\Firefox",
            WindowsUtils.getProgramFilesPath() + "\\Firefox-2",
    };


    protected String browserName() {
        return "Firefox 2";
    }

    protected String seleniumBrowserName() {
        return "*firefox2";
    }

    protected String[] standardlauncherFilenames() {
        if (WindowsUtils.thisIsWindows()) {
            return new String[]{"firefox.exe"};
        } else {
            return new String[]{"firefox-bin"};
        }
    }

    protected String[] usualLauncherLocations() {
        return WindowsUtils.thisIsWindows() ? USUAL_WINDOWS_LAUNCHER_LOCATIONS : USUAL_UNIX_LAUNCHER_LOCATIONS;
    }

    protected boolean runningOnWindows() {
        return Platform.getCurrent().is(Platform.WINDOWS);
    }

    @Override
    public String computeLibraryPath(File launcherPath) {
      if (runningOnWindows()) {
        return "";
      }

      StringBuilder libraryPath = new StringBuilder();
      String libraryPropertyName = CommandLine.getLibraryPathPropertyName();

      String existingLibraryPath = System.getenv(libraryPropertyName);

      if (Platform.getCurrent().is(Platform.MAC) && Platform.getCurrent().getMinorVersion() > 5) {
          libraryPath.append(existingLibraryPath);
      } else {
          libraryPath.append(launcherPath.getParent()).append(File.pathSeparator).append(libraryPath);
      }

      return libraryPath.toString();
  }

}