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

import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.server.RemoteControlConfiguration;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * {@link FirefoxCustomProfileLauncher} integration test class.
 */
public class FirefoxCustomProfileLauncherIntegrationTest extends LauncherFunctionalTestCase {

  public void testLauncherWithDefaultConfiguration() throws Exception {
    launchBrowser(new FirefoxCustomProfileLauncher(BrowserOptions.newBrowserOptions(),
        new RemoteControlConfiguration(), "CUSTFFCHROME", (String) null));
  }

  public void testLaunchTwoBrowsersInARowWithDefaultConfiguration() throws Exception {
    final RemoteControlConfiguration configuration = new RemoteControlConfiguration();

    launchBrowser(new FirefoxCustomProfileLauncher(BrowserOptions.newBrowserOptions(),
        configuration, "CUSTFFCHROME", (String) null));
    launchBrowser(new FirefoxCustomProfileLauncher(BrowserOptions.newBrowserOptions(),
        configuration, "CUSTFFCHROME", (String) null));
  }

  public void testLaunchMultipleBrowsersConcurrentlyWithDefaultConfiguration() {
    List<Thread>  threads = new ArrayList<Thread>();
    for(int i = 0; i < 20; i++){
      threads.add( new Thread(run)); // Thread safety reviewed
    }
    for(int i = 0; i < 20; i++){
      threads.get(i).start();
    }
    Sleeper.sleepTight(60 * 1000);
  }

  static Runnable run = new Runnable() {
    public void run() {
      System.out.println("Thread: " + Thread.currentThread().getName());
      String sessionId = "TEST" + UUID.randomUUID().toString().replace("-", "");
      new FirefoxCustomProfileLauncher(BrowserOptions.newBrowserOptions(),
          new RemoteControlConfiguration(), sessionId, (String) null)
          .launch("http://www.google.com");
    }
  };

}
