package org.openqa.selenium.chrome;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;

import java.io.File;
import java.io.IOException;

public class ChromeBinary {
  
  private static final int BACKOFF_INTERVAL = 15000;

  private static int linearBackoffCoefficient = 1;

  private final ChromeProfile profile;
  private final ChromeExtension extension;
  
  Process chromeProcess = null;

  /**
   * Creates a new instance for managing an instance of Chrome using the given
   * {@code profile} and {@code extension}.
   *
   * @param profile The Chrome profile to use.
   * @param extension The extension to launch Chrome with.
   */
  public ChromeBinary(ChromeProfile profile, ChromeExtension extension) {
    this.profile = profile;
    this.extension = extension;
  }

  /**
   * Starts the Chrome process for WebDriver.
   * Assumes the passed directories exist.
   * @param serverUrl URL from which commands should be requested
   * @throws IOException wrapped in WebDriverException if process couldn't be
   * started.
   */
  public void start(String serverUrl) throws IOException {
    try {
      chromeProcess = new ProcessBuilder(
          getChromeFile(),
          "--user-data-dir=" + profile.getDirectory().getAbsolutePath(),
          "--load-extension=" + extension.getDirectory().getAbsolutePath(),
          "--activate-on-launch",
          "--homepage=about:blank",
          "--no-first-run",
          "--disable-hang-monitor",
          "--disable-popup-blocking",
          "--disable-prompt-on-repost",
          "--no-default-browser-check",
          serverUrl)
          .start();
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
    try {
      Thread.sleep(BACKOFF_INTERVAL * linearBackoffCoefficient);
    } catch (InterruptedException e) {
      //Nothing sane to do here
    }
  }
  
  public void kill() {
    if (chromeProcess != null) {
      chromeProcess.destroy();
      chromeProcess = null;
    }
  }
  
  public void incrementBackoffBy(int diff) {
    linearBackoffCoefficient += diff;
  }
  
  /**
   * Locates the Chrome executable on the current platform.
   * First looks in the webdriver.chrome.bin property, then searches
   * through the default expected locations.
   * @return chrome.exe
   * @throws IOException if file could not be found/accessed
   */
  protected String getChromeFile() throws IOException {
    File chromeFile = null;
    String chromeFileSystemProperty = System.getProperty(
        "webdriver.chrome.bin");
    if (chromeFileSystemProperty != null) {
      chromeFile = new File(chromeFileSystemProperty);
    } else {
      StringBuilder chromeFileString = new StringBuilder();
      if (Platform.getCurrent().is(Platform.XP)) {
        chromeFileString.append(System.getProperty("user.home"))
                        .append("\\Local Settings\\Application Data\\")
                        .append("Google\\Chrome\\Application\\chrome.exe");
      } else if (Platform.getCurrent().is(Platform.VISTA)) {
        //HOPEFULLY this is somewhat consistent...
        chromeFileString.append(System.getProperty("java.io.tmpdir"))
                        .append("..\\")
                        .append("Google\\Chrome\\Application\\chrome.exe");
      } else if (Platform.getCurrent().is(Platform.UNIX)) {
        chromeFileString.append("/usr/bin/google-chrome");
      } else if (Platform.getCurrent().is(Platform.MAC)) {
        String[] paths = new String[] {
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Users/" + System.getProperty("user.name") +
              "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"};
        boolean foundPath = false;
        for (String path : paths) {
          File binary = new File(path);
          if (binary.exists()) {
            chromeFileString.append(binary.getCanonicalFile());
            foundPath = true;
            break;
          }
        }
        if (!foundPath) {
          throw new WebDriverException("Couldn't locate Chrome.  " +
              "Set webdriver.chrome.bin");
        }
      } else {
        throw new WebDriverException("Unsupported operating system.  " +
            "Could not locate Chrome.  Set webdriver.chrome.bin");
      }
      chromeFile = new File(chromeFileString.toString());
    }
    return chromeFile.getCanonicalFile().toString();
  }
}
