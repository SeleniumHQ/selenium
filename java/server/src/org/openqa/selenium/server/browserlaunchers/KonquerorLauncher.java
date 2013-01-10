/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.Proxies;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.server.RemoteControlConfiguration;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintStream;

public class KonquerorLauncher extends AbstractBrowserLauncher {
  private static final String KONQUEROR_PROFILE_SRC_LOCATION = "/konqueror";

  private static final String KONQUEROR_PROFILE_DEST_LOCATION = System.getProperty("user.home") +
      "/.kde/share/config";

  private static final String DEFAULT_KONQUEROR_LOCATION = "/usr/bin/konqueror";

  private CommandLine process;

  private String browserLaunchLocation;

  public KonquerorLauncher(Capabilities browserOptions, RemoteControlConfiguration configuration,
      String sessionId, String browserLaunchLocation) {
    super(sessionId, configuration, browserOptions);
    this.browserLaunchLocation = browserLaunchLocation;
  }

  @Override
  protected void launch(String url) {
    try {
      makeCustomProfile();
    } catch (IOException e) {
      e.printStackTrace();
    }
    exec(browserLaunchLocation + " " + url);
  }

  private void makeCustomProfile() throws IOException {
    File profileDest = new File(KONQUEROR_PROFILE_DEST_LOCATION);
    ResourceExtractor.extractResourcePath(getClass(), KONQUEROR_PROFILE_SRC_LOCATION, profileDest);


    File pacFile = Proxies.makeProxyPAC(new File(KONQUEROR_PROFILE_DEST_LOCATION), getPort(),
        browserConfigurationOptions);

    File kioslaverc = new File(KONQUEROR_PROFILE_DEST_LOCATION, "kioslaverc");
    PrintStream out = new PrintStream(new FileOutputStream(kioslaverc));
    out.println("PersistentProxyConnection=false");
    out.println("[Proxy Settings]");
    out.println("AuthMode=0");
    out.println("Proxy Config Script=file://" + pacFile.getAbsolutePath());
    out.println("ProxyType=2");
    out.println("ReversedException=false");
    out.close();

  }

  public void close() {
    if (process == null) return;
    process.destroy();
  }

  protected void exec(String command) {
    try {
      process = new CommandLine(command);
      process.executeAsync();
    } catch (RuntimeException e) {
      throw new RuntimeException("Error starting browser by executing command " + command + ": " +
          e + "\n See http://openqa.org/selenium-rc/help/launching-konqueror.html");
    }
  }

}
