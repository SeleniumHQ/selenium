package org.openqa.selenium.chrome;

import org.openqa.selenium.Platform;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.Proxy.ProxyType;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ChromeBinary {
  
  private static final int BACKOFF_INTERVAL = 2500;

  private static int linearBackoffCoefficient = 1;

  private final ChromeProfile profile;
  private final ChromeExtension extension;
  
  protected String chromeBinaryLocation = null;
  
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
      List<String> commandline = getCommandline(serverUrl);
      chromeProcess = new ProcessBuilder(commandline)
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

  // Visible for testing.
  public List<String> getCommandline(String serverUrl) throws IOException {
    ArrayList<String> commandline = new ArrayList<String>(Arrays.asList(
        getChromeBinaryLocation(),
        "--user-data-dir=" + profile.getDirectory().getAbsolutePath(),
        "--load-extension=" + extension.getDirectory().getAbsolutePath(),
        "--activate-on-launch",
        "--homepage=about:blank",
        "--no-first-run",
        "--disable-hang-monitor",
        "--disable-popup-blocking",
        "--disable-prompt-on-repost",
        "--no-default-browser-check"
    ));
    appendProxyArguments(commandline)
        .add(serverUrl);
    return commandline;
  }
  
  private ArrayList<String> appendProxyArguments(ArrayList<String> commandline) {
    Proxy proxy = profile.getProxy();
    if (proxy == null) {
      return commandline;
    }
    if (proxy.getProxyAutoconfigUrl() != null) {
      commandline.add("--proxy-pac-url=" + proxy.getProxyAutoconfigUrl());
    } else if (proxy.getHttpProxy() != null) {
      commandline.add("--proxy-server=" + proxy.getHttpProxy());
    } else if (proxy.isAutodetect()) {
      commandline.add("--proxy-auto-detect");
    } else if (proxy.getProxyType() == ProxyType.DIRECT) {
      commandline.add("--no-proxy-server");
    } else if (proxy.getProxyType() != ProxyType.SYSTEM) {
      throw new IllegalStateException("Unsupported proxy setting");
    }
    return commandline;
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
  protected String getChromeBinaryLocation() throws IOException {
    if (!isChromeBinaryLocationKnown()) {
      chromeBinaryLocation = System.getProperty("webdriver.chrome.bin");
      if (chromeBinaryLocation == null) {
        if (Platform.getCurrent().is(Platform.WINDOWS)) {
          chromeBinaryLocation = getWindowsBinaryLocation();
        } else if (Platform.getCurrent().is(Platform.UNIX)) {
          chromeBinaryLocation = "/usr/bin/google-chrome";
        } else if (Platform.getCurrent().is(Platform.MAC)) {
          String[] paths = new String[] {
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Users/" + System.getProperty("user.name") +
                "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"};
          for (String path : paths) {
            File binary = new File(path);
            if (binary.exists()) {
              chromeBinaryLocation = binary.getCanonicalFile().getAbsoluteFile().toString();
              break;
            }
          }
        } else {
          throw new WebDriverException("Unsupported operating system.  " +
              "Could not locate Chrome.  Set webdriver.chrome.bin");
        }
      }
      if (!isChromeBinaryLocationKnown()) {
        throw new WebDriverException("Couldn't locate Chrome.  " +
            "Set webdriver.chrome.bin");
      }
    }
    return chromeBinaryLocation;
  }
  
  protected boolean isChromeBinaryLocationKnown() {
    return chromeBinaryLocation != null && new File(chromeBinaryLocation).exists();
  }
  
  /**
   * Returns null if couldn't read value from registry
   */
  protected static final String getWindowsBinaryLocation() {
    //TODO: Promote org.openqa.selenium.server.browserlaunchers.WindowsUtils
    //to common and reuse that to read the registry
    if (!Platform.WINDOWS.is(Platform.getCurrent())) {
      throw new UnsupportedOperationException("Cannot get registry value on non-Windows systems");
    }
    try {
      Process process = Runtime.getRuntime().exec(
          "reg query \"HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe\" /v \"\"");
      BufferedReader reader = new BufferedReader(new InputStreamReader(
          process.getInputStream()));
      process.waitFor();
      String line;
      while ((line = reader.readLine()) != null) {
        if (line.contains("    ")) {
          String[] tokens = line.split("REG_SZ");
          return tokens[tokens.length - 1].trim();
        }
      }
    } catch (IOException e) {
      //Drop through to return null
    } catch (InterruptedException e) {
      //Drop through to return null
    }
    return null;
  }
}
