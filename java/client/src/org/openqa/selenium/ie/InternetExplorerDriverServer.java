/*
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.

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

import com.sun.jna.Native;
import com.sun.jna.Pointer;
import com.sun.jna.win32.StdCallLibrary;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.net.PortProber;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class InternetExplorerDriverServer {
  // Constantly reloading the DLL causes JVM crashes. Prefer a static field this one time.
  private static IEServer lib = initializeLib();

  private Pointer server;
  private int port;

  public InternetExplorerDriverServer(int port) {
    this.port = port;
  }

  public URL getUrl() {
    if (!lib.ServerIsRunning()) {
      throw new WebDriverException("Server has not yet been started");
    }
    try {
      return new URL("http://localhost:" + port);
    } catch (MalformedURLException e) {
      throw new WebDriverException(e);
    }
  }

  public void start() {
    if (lib.ServerIsRunning()) {
      port = lib.GetServerPort();
      return;
    }

    // TODO: Race. Need to lock across processes to avoid port being assigned
    if (port == 0) {
      port = PortProber.findFreePort();
    }

    server = lib.StartServer(port);
  }

  public void stop() {
    if (lib != null) {
      lib.StopServer(server);
    }
  }

  private static IEServer initializeLib() {
    if (lib != null) {
      return lib;
    }
    File parentDir = TemporaryFilesystem.getDefaultTmpFS().createTempDir("webdriver", "libs");
    try {
      FileHandler.copyResource(parentDir, InternetExplorerDriverServer.class, "IEDriver.dll");
    } catch (IOException ioe) {
      // TODO(simon): Delete this. Test code should not be in production code
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
      return (IEServer) Native.loadLibrary("IEDriver", IEServer.class);
    } catch (UnsatisfiedLinkError e) {
      System.out.println("new File(\".\").getAbsolutePath() = "
          + new File(".").getAbsolutePath());
      throw new WebDriverException(e);
    }
  }

  private interface IEServer extends StdCallLibrary {
    Pointer StartServer(int port);

    void StopServer(Pointer server);

    int GetServerPort();

    boolean ServerIsRunning();
  }
}
