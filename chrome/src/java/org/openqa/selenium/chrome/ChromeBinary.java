package org.openqa.selenium.chrome;

import java.io.File;
import java.io.IOException;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;

public class ChromeBinary {
  
  private static int linearBackoffCoefficient = 1;
  
  Process chromeProcess = null;
  
  public void start(String[] flags) throws IOException {
    File chromeFile = getChromeFile();
    if (Platform.getCurrent().is(Platform.XP)) {
      String toExec = chromeFile.getCanonicalPath();
      for (String flag : flags) {
        toExec += " " + flag;
      }
      chromeProcess = Runtime.getRuntime().exec(toExec);
    } else {
      String[] toExec = new String[flags.length + 1];
      toExec[0] = chromeFile.getCanonicalPath();
      for (int i = 0; i < flags.length; ++i) {
        toExec[i + 1] = flags[i];
      }
      chromeProcess = Runtime.getRuntime().exec(toExec);
    }
    try {
      Thread.sleep(2500 * linearBackoffCoefficient);
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
  protected File getChromeFile() throws IOException {
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
    return chromeFile;
  }
}
