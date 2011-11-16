/*
 * Copyright 2008 Google, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.server.RemoteControlConfiguration;

/**
 * {@link org.openqa.selenium.server.browserlaunchers.GoogleChromeLaunhcer} functional test class.
 * 
 * <p>
 * If no local proxy server (such as Selenium Server) is running during this test, there won't be a
 * proxy server for Google Chrome to use. The --proxy-server command-line switch given to Google
 * Chrome does not fall back to a direct connection, so the URLs loaded by this test won't work
 * unless Selenium Server is already running. The tests will still pass, though.
 */
public class GoogleChromeLauncherFunctionalTest {
  public void testCanLaunchASingleBrowser() {
    final GoogleChromeLauncher launcher;

    launcher =
        new GoogleChromeLauncher(BrowserOptions.newBrowserOptions(),
            new RemoteControlConfiguration(), "aSessionId", (String) null);
    launcher.launch("http://www.google.com/");
    Sleeper.sleepTightInSeconds(5);
    launcher.close();
  }

  public void testCanLaunchTwoBrowsersInSequence() {
    final GoogleChromeLauncher firstLauncher;
    final GoogleChromeLauncher secondLauncher;

    firstLauncher =
        new GoogleChromeLauncher(BrowserOptions.newBrowserOptions(),
            new RemoteControlConfiguration(), "firstSessionId", (String) null);
    secondLauncher =
        new GoogleChromeLauncher(BrowserOptions.newBrowserOptions(),
            new RemoteControlConfiguration(), "secondSessionId", (String) null);

    firstLauncher.launch("http://www.google.com/");
    Sleeper.sleepTightInSeconds(5);
    firstLauncher.close();

    secondLauncher.launch("http://www.google.com/");
    Sleeper.sleepTightInSeconds(5);
    secondLauncher.close();
  }

  public void testCanLaunchTwoBrowsersInterleaved() {
    final GoogleChromeLauncher firstLauncher;
    final GoogleChromeLauncher secondLauncher;

    firstLauncher =
        new GoogleChromeLauncher(BrowserOptions.newBrowserOptions(),
            new RemoteControlConfiguration(), "firstSessionId", (String) null);
    secondLauncher =
        new GoogleChromeLauncher(BrowserOptions.newBrowserOptions(),
            new RemoteControlConfiguration(), "secondSessionId", (String) null);

    firstLauncher.launch("http://www.google.com/");
    secondLauncher.launch("http://www.google.com/");
    Sleeper.sleepTightInSeconds(5);
    firstLauncher.close();
    secondLauncher.close();
  }
}
