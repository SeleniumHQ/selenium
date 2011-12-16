/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.
Portions copyright 2011 Software Freedom Conservancy

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

package org.openqa.selenium.android.environment;

import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.Jetty7AppServer;

public class AndroidTestEnvironment implements TestEnvironment {
  private AppServer appServer;
  // In order to run the tests on a real device, the device and the host
  // running the tests must be on the same network. This variable should
  // contain the externally-visible IP of the host.
  private static String ANDROID_HOST_IP = "ANDROID_HTTP_HOST";

  public AndroidTestEnvironment() {
    String servingHost = System.getenv(ANDROID_HOST_IP);
    if (servingHost == null) {
      servingHost = "10.0.2.2";
    }
    appServer = new Jetty7AppServer(servingHost);
    appServer.start();
  }

  public AppServer getAppServer() {
    return appServer;
  }

  public void stop() {
    appServer.stop();
  }

  public static void main(String[] args) {
    new AndroidTestEnvironment();
  }
}
