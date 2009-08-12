package org.openqa.selenium.chrome;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URL;
import java.util.List;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.FileHandler;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.Response;

public class ChromeDriver extends RemoteWebDriver {

  public ChromeDriver() throws Exception {
      super(new URL("http://localhost:7601"), DesiredCapabilities.chrome());
  }

  //TODO(danielwh): Work out why rake launch is broken
  
  @Override
  /**
   * By default will try to load Chrome from system property
   * webdriver.chrome.binary and the extension from
   * webdriver.chrome.extensiondir.  If the former fails, will try to guess the
   * path to Chrome.  If the latter fails, will try to unzip from the JAR we 
   * hope we're in.  If these fail, throws exceptions.
   */
  protected void startClient() {
    try {
      File extensionDir = getExtensionDir();
      if (!extensionDir.isDirectory()) {
        throw new FileNotFoundException("Could not find extension directory" +
            "(" + extensionDir + ").  Try setting webdriver.chrome.extensiondir."); 
      }
      File chromeFile = getChromeFile();
      if (!chromeFile.isFile()) {
        throw new FileNotFoundException("Could not find chrome binary(" +
            chromeFile.getCanonicalPath() + ").  " +
            "Try setting webdriver.chrome.binary.");
      }
      System.out.println(chromeFile.getCanonicalPath() +
          " --enable-extensions --load-extension=\"" + 
          extensionDir.getCanonicalPath() + "\"");
      clientProcess = Runtime.getRuntime().exec(chromeFile.getCanonicalPath() +
          " --enable-extensions --load-extension=\"" + 
          extensionDir.getCanonicalPath() + "\"");
      //Ick, we sleep for a little bit in case the browser hasn't quite loaded
      Thread.sleep(200);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
  
  @Override
  protected void stopClient() {
    if (clientProcess != null) {
      clientProcess.destroy();
      clientProcess = null;
    }
  }
  
  @Override
  public WebElement findElementByPartialLinkText(String using) {
    Response response = execute("findElement", "partial link text", using);
    return getElementFrom(response);
  }
  
  @Override
  public List<WebElement> findElementsByPartialLinkText(String using) {
    Response response = execute("findElements", "partial link text", using);
    return getElementsFrom(response);
  }
  
  
  protected File getExtensionDir() throws IOException {
    File extensionDir = null;
    String extensionDirSystemProperty = System.getProperty(
        "webdriver.chrome.extensiondir");
    if (extensionDirSystemProperty != null) {
      //Default to reading from the property
      extensionDir = new File(extensionDirSystemProperty);
    } else {
      //If property not set, try to unpack the zip from the jar
      extensionDir = FileHandler.unzip(this.getClass().getResourceAsStream(
          "/chrome-extension.zip"));
    }
    return extensionDir;
  }
  
  protected File getChromeFile() throws IOException {
    File chromeFile = null;
    String chromeFileSystemProperty = System.getProperty(
        "webdriver.chrome.binary");
    if (chromeFileSystemProperty != null) {
      chromeFile = new File(chromeFileSystemProperty);
    } else {
      StringBuilder chromeFileString = new StringBuilder();
      if (System.getProperty("os.name").equals("Windows XP")) {
        chromeFileString.append(System.getProperty("user.home"))
                        .append("\\Local Settings\\Application Data\\")
                        .append("Google\\Chrome\\Application\\chrome.exe");
      } else if (System.getProperty("os.name").equals("Windows Vista")) {
        chromeFileString.append("C:\\Users\\")
                        .append(System.getProperty("user.name"))
                        .append("\\AppData\\Local\\")
                        .append("Google\\Chrome\\Application\\chrome.exe");
      } else {
        throw new RuntimeException("Unsupported operating system.  " +
            "Could not locate Chrome.  Set webdriver.chrome.binary.");
      }
      chromeFile = new File(chromeFileString.toString());
    }
    return chromeFile;
  }
}
