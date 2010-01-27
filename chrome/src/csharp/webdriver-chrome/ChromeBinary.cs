using OpenQA.Selenium;
using System.IO;
using System.Text;
using System;
using System.Threading;
using System.Diagnostics;
using System.Net.Sockets;

namespace OpenQA.Selenium.Chrome
{
internal class ChromeBinary {
  
  private static int BACKOFF_INTERVAL = 2500;

  private static int linearBackoffCoefficient = 1;

  private ChromeProfile profile;
  private ChromeExtension extension;
  
  Process chromeProcess = null;

  /**
   * Creates a new instance for managing an instance of Chrome using the given
   * {@code profile} and {@code extension}.
   *
   * @param profile The Chrome profile to use.
   * @param extension The extension to launch Chrome with.
   */
  internal ChromeBinary(ChromeProfile profile, ChromeExtension extension) {
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
  public void Start(String serverUrl) {
    try {
        chromeProcess = Process.Start(
            GetChromeFile(),
            " --user-data-dir=\"" + profile.ProfileDirectory + "\"" +
            " --load-extension=\"" + extension.ExtensionDirectory + "\"" +
            " --activate-on-launch" +
            " --homepage=about:blank" +
            " --no-first-run" +
            " --disable-hang-monitor" +
            " --disable-popup-blocking" +
            " --disable-prompt-on-repost" +
            " --no-default-browser-check " +
            serverUrl);
    } catch (IOException e) { //TODO(AndreNogueira): Check exception type thrown when process.start fails
      throw new WebDriverException("Could not start Chrome process", e);
    }
    Thread.Sleep(BACKOFF_INTERVAL * linearBackoffCoefficient);
  }
  
  public void Kill() {
    if (!(chromeProcess == null) && !chromeProcess.HasExited) {
      chromeProcess.Kill();
      chromeProcess = null;
    }
  }
  
  public void IncrementBackoffBy(int diff) {
    linearBackoffCoefficient += diff;
  }
  
  /**
   * Locates the Chrome executable on the current platform.
   * First looks in the webdriver.chrome.bin property, then searches
   * through the default expected locations.
   * @return chrome.exe
   * @throws IOException if file could not be found/accessed
   */
  protected String GetChromeFile() {
    string chromeFile = null;
    string chromeFileSystemProperty = null; //System.getProperty("webdriver.chrome.bin");
    if (chromeFileSystemProperty != null) {
      chromeFile = chromeFileSystemProperty;
    } else {
      StringBuilder chromeFileString = new StringBuilder();
      if (Platform.CurrentPlatform.IsPlatformType(PlatformType.XP)) {
          chromeFile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Google\\Chrome\\Application\\chrome.exe");
      //} else if (Platform.CurrentPlatform.IsPlatformType(PlatformType.Vista)) {
      //  //HOPEFULLY this is somewhat consistent...
      //  chromeFileString.Append(System.IO.Path.GetTempPath())
      //                  .Append("..\\")
      //                  .Append("Google\\Chrome\\Application\\chrome.exe");
      //  TODO(Andre.Nogueira): Skipping for now, revisit later with Mono?
      //} else if (Platform.CurrentPlatform.IsPlatformType(PlatformType.Unix)) {
      //   chromeFileString.Append("/usr/bin/google-chrome");
      //} else if (Platform.CurrentPlatform.IsPlatformType(PlatformType.MacOSX)) {
      //  string[] paths = new string[] {
      //    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      //    "/Users/" + System.getProperty("user.name") +
      //        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"};
      //  bool foundPath = false;
      //  foreach (string path in paths) {
      //    FileInfo binary = new FileInfo(path);
      //    if (binary.Exists) {
      //      chromeFileString.Append(binary.FullName);
      //      foundPath = true;
      //      break;
      //    }
      //  }
      //  if (!foundPath) {
      //    throw new WebDriverException("Couldn't locate Chrome.  " +
      //        "Set webdriver.chrome.bin");
      //  }
      } else {
        throw new WebDriverException("Unsupported operating system.  " +
            "Could not locate Chrome.  Set webdriver.chrome.bin");
      }
    }
    return chromeFile;
  }
}
}
