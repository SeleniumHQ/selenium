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
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.BrowserLauncher;
import org.openqa.selenium.server.RemoteControlConfiguration;

/**
 * {@link org.openqa.selenium.server.browserlaunchers.BrowserLauncherFactory} unit test class
 */
public class BrowserLauncherFactoryUnitTest {

  @Test
  public void testAllSupportedBrowsersDefineAppropriateConstructor() {
    for (Class<? extends BrowserLauncher> c : BrowserLauncherFactory.getSupportedLaunchers()
        .values()) {
      try {
        c.getConstructor(Capabilities.class, RemoteControlConfiguration.class, String.class,
            String.class);
      } catch (Exception e) {
        throw new RuntimeException(c.getSimpleName(), e);
      }
    }
  }
}
