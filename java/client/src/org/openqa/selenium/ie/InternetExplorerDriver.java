/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium.ie;

import static org.openqa.selenium.remote.CapabilityType.PROXY;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Platform;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.browserlaunchers.DriverCommandExecutor;
import org.openqa.selenium.browserlaunchers.WindowsProxyManager;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.HttpCommandExecutor;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.remote.internal.JsonToWebElementConverter;

import java.util.logging.Logger;

public class InternetExplorerDriver extends RemoteWebDriver implements TakesScreenshot {
  private static Logger log = Logger.getLogger(InternetExplorerDriver.class.getName());

  /**
   * Setting this capability will make your tests unstable and hard to debug.
   */
  public final static String INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS =
      "ignoreProtectedModeSettings";

  private InternetExplorerDriverServer server;
  private WindowsProxyManager proxyManager;
  private boolean useLegacyServer = false;

  public InternetExplorerDriver() {
    assertOnWindows();

    setup(DesiredCapabilities.internetExplorer(), 0);
  }

  public InternetExplorerDriver(Capabilities capabilities) {
    assertOnWindows();

    proxyManager = new WindowsProxyManager(true, "webdriver-ie", 0, 0);
    prepareProxy(capabilities);
    setup(capabilities, 0);
  }

  public InternetExplorerDriver(int port) {
    assertOnWindows();

    setup(DesiredCapabilities.internetExplorer(), port);
  }

  public <X> X getScreenshotAs(OutputType<X> target) {
    // Get the screenshot as base64.
    String base64 = execute(DriverCommand.SCREENSHOT).getValue().toString();

    // There's a bug in some versions of IE where images are returned as
    // being completely black. We're not sure _why_, but try and work
    // around this.
//    BufferedImage image = ImageIO.read(new ByteArrayInputStream(
//        OutputType.BYTES.convertFromBase64Png(base64)));
//    int width = image.getWidth();
//    int height = image.getHeight();
//    int[] rgb = new int[width * height];
//    image.getRGB(0, 0, width, height, rgb, 0, width);
//    boolean allBlack = true;
//    for (int i = 0; i < (width * height) && allBlack; i++) {
//      allBlack &= rgb[i] == 0;
//    }
//    if (allBlack) {
//      base64 = execute(DriverCommand.SCREENSHOT).getValue().toString();
//    }

    // ... and convert it.
    return target.convertFromBase64Png(base64);
  }

  protected void assertOnWindows() {
    Platform current = Platform.getCurrent();
    if (!current.is(Platform.WINDOWS)) {
      throw new WebDriverException(
          String
              .format("You appear to be running %s. The IE driver only runs on Windows.", current));
    }
  }

  private void setup(Capabilities capabilities, int port) {
    if (capabilities.is("useLegacyInternalServer")) {
      setupLegacyServer(port);
    } else {
      try {
        setCommandExecutor(new DriverCommandExecutor(
            InternetExplorerDriverService.createDefaultService()));
      } catch (IllegalStateException ex) {
        System.err.println(ex.getMessage());
        // fallback
        setupLegacyServer(port);
      }
    }
    setElementConverter(new JsonToWebElementConverter(this) {
      @Override
      protected RemoteWebElement newRemoteWebElement() {
        return new InternetExplorerElement(InternetExplorerDriver.this);
      }
    });
    startSession(capabilities);
  }

  private void setupLegacyServer(int port) {
    useLegacyServer = true;
    server = new InternetExplorerDriverServer(port);
    startClient();
    setCommandExecutor(new HttpCommandExecutor(server.getUrl()));
  }

  @Override
  protected void startClient() {
    if (useLegacyServer) {
      server.start();
    }
  }

  @Override
  protected void stopClient() {
    if (server != null) {
      server.stop();
    }
  }

  private void prepareProxy(Capabilities caps) {
    if (caps == null || caps.getCapability(PROXY) == null) {
      return;
    }

    // Because of the way that the proxying is currently implemented,
    // we can only set a single host.
    proxyManager.backupRegistrySettings();
    proxyManager.changeRegistrySettings(caps);

    Thread cleanupThread = new Thread() { // Thread safety reviewed
      @Override
      public void run() {
        proxyManager.restoreRegistrySettings(true);
      }
    };
    Runtime.getRuntime().addShutdownHook(cleanupThread);
  }
}
