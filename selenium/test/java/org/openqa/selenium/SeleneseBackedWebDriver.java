package org.openqa.selenium;

import org.openqa.selenium.remote.Capabilities;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.net.MalformedURLException;
import java.net.URL;

public class SeleneseBackedWebDriver extends RemoteWebDriver {
  public SeleneseBackedWebDriver() throws Exception {
    super(newCommandExecutor(getSeleniumServerUrl(), describeBrowser()),
        describeBrowser());
  }

  private static CommandExecutor newCommandExecutor(URL remoteAddress, Capabilities capabilities)
      throws MalformedURLException {
    return new SeleneseCommandExecutor(getSeleniumServerUrl(), remoteAddress, capabilities);
  }

  private static URL getSeleniumServerUrl() throws MalformedURLException {
    String port = System.getProperty("webdriver.selenium.server.port", "5555");
    return new URL("http://localhost:" + port);
  }

  private static Capabilities describeBrowser() {
    if (Platform.getCurrent().is(Platform.MAC)) {
      DesiredCapabilities caps = new DesiredCapabilities();
      caps.setBrowserName("safari");
      return caps;
    }

    return DesiredCapabilities.firefox();
  }
}
