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

import static org.openqa.selenium.browserlaunchers.CapabilityType.PROXY;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.browserlaunchers.WindowsProxyManager;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.HttpCommandExecutor;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.remote.internal.JsonToWebElementConverter;

import com.sun.jna.Native;
import com.sun.jna.Pointer;
import com.sun.jna.win32.StdCallLibrary;

public class InternetExplorerDriver extends RemoteWebDriver {
  private Pointer server;
  private IEServer lib;
  private int port;
  private WindowsProxyManager proxyManager;

  public InternetExplorerDriver() {
    setup();
  }

  public InternetExplorerDriver(Capabilities capabilities) {
    assertOnWindows();

    proxyManager = new WindowsProxyManager(true, "webdriver-ie", 0, 0);
    prepareProxy(capabilities);
    setup();
  }

  public InternetExplorerDriver(int port) {
    this.port = port;
    setup();
  }

  protected void assertOnWindows() {
    Platform current = Platform.getCurrent();
      if (!current.is(Platform.WINDOWS)) {
        throw new WebDriverException(
          String.format("You appear to be running %s. The IE driver only runs on Windows.", current)); 
      }
  }

  private void setup() {
    if (port == 0) {
      port = PortProber.findFreePort();
    }
    startClient();
    setCommandExecutor(new HttpCommandExecutor(getServerUrl(port)));
    setElementConverter(new JsonToWebElementConverter(this) {
      @Override
      protected RemoteWebElement newRemoteWebElement() {
        return new InternetExplorerElement(InternetExplorerDriver.this);
      }
    });
    startSession(DesiredCapabilities.internetExplorer());
  }

  protected void startClient() {
    initializeLib();
    server = lib.StartServer(port);
  }

  protected void stopClient() {
    if (server != null) {
      lib.StopServer(server);
    }
  }

  private static URL getServerUrl(int port) {
    try {
      return new URL("http://localhost:" + port);
    } catch (MalformedURLException e) {
      throw new WebDriverException(e);
    }
  }

  private void initializeLib() {
    synchronized (this) {
      if (lib != null) {
        return;
      }

      File parentDir = TemporaryFilesystem.createTempDir("webdriver",
          "libs");
      try {
        FileHandler.copyResource(parentDir, getClass(), "IEDriver.dll");
      } catch (IOException ioe) {
        try {
          if (Boolean.getBoolean("webdriver.development")) {
            String arch = System.getProperty("os.arch", "")
                .contains("64") ? "x64" : "Win32";

            List<String> sourcePaths = new ArrayList<String>();
            sourcePaths.add("build\\cpp\\" + arch + "\\Debug");
            sourcePaths.add("..\\build\\cpp\\" + arch + "\\Debug");
            sourcePaths.add("..\\..\\build\\cpp\\" + arch + "\\Debug");
            boolean copied = false;
            for (String path : sourcePaths) {
              File sourceFile = new File(path, "IEDriver.dll");
              if (sourceFile.exists()) {
                FileHandler.copy(sourceFile, new File(
                    parentDir, "IEDriver.dll"));
                copied = true;
                break;
              }
            }
            if (!copied) {
              throw new WebDriverException(
                  "Couldn't find IEDriver.dll: " + arch);
            }
          } else {
            throw new WebDriverException(ioe);
          }
        } catch (IOException ioe2) {
          throw new WebDriverException(ioe2);
        }
      }
      System.setProperty("jna.library.path",
          System.getProperty("jna.library.path", "")
              + File.pathSeparator + parentDir);

      try {
        lib = (IEServer) Native.loadLibrary("IEDriver", IEServer.class);
      } catch (UnsatisfiedLinkError e) {
        System.out.println("new File(\".\").getAbsolutePath() = "
            + new File(".").getAbsolutePath());
        throw new WebDriverException(e);
      }
    }
  }

  private void prepareProxy(Capabilities caps) {
    if (caps == null || caps.getCapability(PROXY) == null) {
      return;
    }

    // Because of the way that the proxying is currently implemented,
    // we can only set a single host.
    try {
      proxyManager.backupRegistrySettings();
      proxyManager.changeRegistrySettings(caps);
    } catch (IOException e) {
      throw new WebDriverException(e);
    }

    Thread cleanupThread = new Thread() {
      @Override
      public void run() {
        proxyManager.restoreRegistrySettings(true);
      }
    };
    Runtime.getRuntime().addShutdownHook(cleanupThread);
  }

  private interface IEServer extends StdCallLibrary {
    Pointer StartServer(int port);

    void StopServer(Pointer server);
  }
}
