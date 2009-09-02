/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium.firefox;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.internal.RunningInstanceConnection;

import java.io.IOException;
import java.net.ConnectException;

public class FirefoxLauncher {
  private final FirefoxBinary binary;

  public FirefoxLauncher(FirefoxBinary binary) {
      this.binary = binary;
  }

  public static void main(String[] args) {
    FirefoxBinary binary = new FirefoxBinary();
    FirefoxLauncher launcher = new FirefoxLauncher(new FirefoxBinary());

    String profileName = "WebDriver";
    int port = FirefoxDriver.DEFAULT_PORT;
    if (args.length >= 2) {
      port = Integer.parseInt(args[1]);
    }
    
    if (args.length >= 1) {
      profileName = args[0];
    }
    
    // If there's a browser already running, connect and kill it.
    launcher.connectAndKill(port);
    
    // Ensure the profile is created, and initialize it.
    launcher.createBaseWebDriverProfile(binary, profileName, port);

    // Connect until it works.
    launcher.repeatedlyConnectUntilFirefoxAppearsStable(port);
  }
    
  public FirefoxBinary startProfile(FirefoxProfile profile, int port) throws IOException {
    FirefoxBinary binaryToUse = binary;
    if (binary == null) {
      binaryToUse = new FirefoxBinary();
    }

    FirefoxProfile profileToUse = profile.createCopy(port);
    binaryToUse.clean(profileToUse);
    binaryToUse.startProfile(profileToUse);
    return binaryToUse;
  }
  
  @Deprecated
  public void createBaseWebDriverProfile(FirefoxBinary binary, String profileName, int port) {
    // If there's a browser already running
    connectAndKill(port);

    System.out.println(String.format("Creating %s", profileName));
    try {
        binary.createProfile(profileName);
        System.out.println("Profile created");
        binary.waitFor();
    } catch (IOException e) {
        throw new WebDriverException("Unable to create base webdriver profile", e);
    } catch (InterruptedException e) {
        throw new WebDriverException(e);
    }
    
    ProfileManager.getInstance().createProfile(binary, profileName, port);
  }

  @Deprecated
  protected void connectAndKill(int port) {
    try {
        ExtensionConnection connection = new RunningInstanceConnection("localhost", port, 5000);
        connection.quit();
    } catch (ConnectException e) {
        // This is fine. It just means that Firefox isn't running with the webdriver extension installed already
    } catch (NotConnectedException e) {
        // This is fine. It just means that Firefox isn't running with the webdriver extension installed already
    } catch (IOException e) {
        throw new WebDriverException(e);
    }
  }

  private void repeatedlyConnectUntilFirefoxAppearsStable(int port) {
    ExtensionConnection connection;
    
    // maximum wait time is a minute
    long maxWaitTime = System.currentTimeMillis() + binary.getTimeout();
      
    do {
      try {
          connection = new RunningInstanceConnection("localhost", port, 1000);
          Thread.sleep(2000);
          connection.quit();
          return;
      } catch (ConnectException e) {
          // Fine. Nothing listening. Perhaps in a restart?
      } catch (IOException e) {
          // Expected. It'll do that
      } catch (InterruptedException e) {
          throw new WebDriverException(e);
      }
    } while (System.currentTimeMillis() < maxWaitTime);
  }
}
