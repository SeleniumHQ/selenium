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

import org.junit.Test;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.server.RemoteControlConfiguration;

/**
 * {@link org.openqa.selenium.server.browserlaunchers.InternetExplorerCustomProxyLauncher}
 * functional test class.
 */
public class InternetExplorerCustomProxyLauncherFunctionalTest {

  @Test
  public void testCanLaunchASingleBrowser() {
    final InternetExplorerCustomProxyLauncher launcher;

    launcher =
        new InternetExplorerCustomProxyLauncher(BrowserOptions.newBrowserOptions(),
            new RemoteControlConfiguration(), "aSessionId", (String) null);
    launcher.launch("http://www.google.com/");
    Sleeper.sleepTightInSeconds(5);
    launcher.close();
  }

  @Test
  public void testCanLaunchTwoBrowsersInSequence() {
    final InternetExplorerCustomProxyLauncher firstLauncher;
    final InternetExplorerCustomProxyLauncher secondLauncher;

    firstLauncher =
        new InternetExplorerCustomProxyLauncher(BrowserOptions.newBrowserOptions(),
            new RemoteControlConfiguration(), "firstSessionId", (String) null);
    secondLauncher =
        new InternetExplorerCustomProxyLauncher(BrowserOptions.newBrowserOptions(),
            new RemoteControlConfiguration(), "secondSessionId", (String) null);
    firstLauncher.launch("http://www.google.com/");
    Sleeper.sleepTightInSeconds(5);
    firstLauncher.close();
    secondLauncher.launch("http://www.google.com/");
    Sleeper.sleepTightInSeconds(5);
    secondLauncher.close();
  }

  @Test
  public void testCanLaunchTwoBrowsersInterleaved() {
    final InternetExplorerCustomProxyLauncher firstLauncher;
    final InternetExplorerCustomProxyLauncher secondLauncher;

    firstLauncher =
        new InternetExplorerCustomProxyLauncher(BrowserOptions.newBrowserOptions(),
            new RemoteControlConfiguration(), "firstSessionId", (String) null);
    secondLauncher =
        new InternetExplorerCustomProxyLauncher(BrowserOptions.newBrowserOptions(),
            new RemoteControlConfiguration(), "secondSessionId", (String) null);
    firstLauncher.launch("http://www.google.com/");
    secondLauncher.launch("http://www.google.com/");
    Sleeper.sleepTightInSeconds(5);
    firstLauncher.close();
    secondLauncher.close();
  }

}
