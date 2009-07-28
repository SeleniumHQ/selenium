package org.openqa.selenium.chrome;

import java.io.File;
import java.io.FileNotFoundException;
import java.net.URL;
import java.util.List;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.Response;

public class ChromeDriver extends RemoteWebDriver {

  public ChromeDriver() throws Exception {
      super(new URL("http://localhost:7601"), DesiredCapabilities.chrome());
  }
  
  @Override
  protected void startClient() {
    String extensionDir = System.getProperty("user.dir") + "\\src\\extension";
    try {
      //TODO(danielwh): This is really hacky and wrong, do better
      String chromeBinary = System.getProperty("webdriver.chrome.binary", System.getProperty("java.io.tmpdir") + "..\\Google\\Chrome\\Application\\chrome.exe");
      File extensionFolder = new File(extensionDir);
      File chromeFile = new File(chromeBinary);
      if (!chromeFile.isFile()) {
        throw new FileNotFoundException("Could not find chrome binary(" + chromeBinary + ").  Try setting webdriver.chrome.binary");
      }
      if (extensionFolder.isDirectory()) {
        clientProcess = Runtime.getRuntime().exec(chromeBinary + " --enable-extensions --load-extension=" + extensionFolder.getCanonicalPath());
        //Ick, we sleep for a little bit in case the browser hasn't quite loaded
        Thread.sleep(50);
      } else {
        throw new FileNotFoundException("Could not find extension directory (" + extensionDir + ").  Try setting webdriver.chrome.extensiondir");
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
  
  @Override
  protected void stopClient() {
    if (clientProcess != null) {
      //clientProcess.destroy();
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
}
