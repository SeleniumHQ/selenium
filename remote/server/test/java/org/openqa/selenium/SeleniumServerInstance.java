package org.openqa.selenium;

import static org.openqa.selenium.DevMode.isInDevMode;
import static org.openqa.selenium.internal.PortProber.pollPort;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;

import org.openqa.selenium.internal.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.HttpRequest;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SeleniumServer;

import com.google.common.collect.Maps;

class SeleniumServerInstance {
  private SeleniumServer seleniumServer;
  private int serverPort;

  public void start() throws Exception {
    serverPort = PortProber.findFreePort();
    RemoteControlConfiguration config = new RemoteControlConfiguration();
    config.setPort(serverPort);
    seleniumServer = new SeleniumServer(config);
    seleniumServer.boot();
    
    pollPort(serverPort);
    
    if (isInDevMode()) {
      Map<String, Object> payload = Maps.newHashMap();
      payload.put("capabilities", DesiredCapabilities.firefox());
      payload.put("class", "org.openqa.selenium.firefox.FirefoxDriverTestSuite$TestFirefoxDriver");

      HttpRequest request = new HttpRequest(
          HttpRequest.Method.POST, 
          String.format("http://localhost:%d/wd/hub/config/drivers", serverPort),
          payload);
      System.out.println(request.getResponse());
    }
  }

  public void stop() {
    seleniumServer.stop();
  }

  public int getPort() {
    return serverPort;
  }

  public URL getWebDriverUrl() throws MalformedURLException {
    return new URL("http://localhost:" + serverPort + "/wd/hub");
  }
}
