/*
Copyright 2012 WebDriver committers
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

import static org.junit.Assert.assertEquals;

import com.thoughtworks.selenium.SeleniumException;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.server.testing.TestSessions;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.testing.MockTestBase;

import java.util.UUID;

public class DrivenSeleniumLauncherTest extends MockTestBase {

  private RemoteControlConfiguration rcConfig;
  private DesiredCapabilities caps;
  private String seleniumSessionId;

  @Before
  public void prepareStandardFields() {
    rcConfig = new RemoteControlConfiguration();
    caps = new DesiredCapabilities();
    seleniumSessionId = UUID.randomUUID().toString();
  }

  @Test(expected = SeleniumException.class)
  public void shouldExplodeIfCapabilitiesLacksTheSessionId() {
    new DrivenSeleniumLauncher(caps, rcConfig, seleniumSessionId, null);
  }

  @Test
  public void shouldExtractWebDriverSessionIdFromCapabilities() {
    caps.setCapability("webdriver.remote.sessionid", "1234");
    DrivenSeleniumLauncher launcher = new DrivenSeleniumLauncher(
        caps, rcConfig, seleniumSessionId, null);

    String seen = launcher.getSessionId();

    assertEquals("1234", seen);
  }

  @Test
  public void shouldExtractWebDriverSessionIdFromBrowserPathInPreferenceToCapabilities() {
    caps.setCapability("webdriver.remote.sessionid", "1234");
    DrivenSeleniumLauncher launcher = new DrivenSeleniumLauncher(
        caps, rcConfig, seleniumSessionId, "4567");

    String seen = launcher.getSessionId();

    assertEquals("4567", seen);
  }

  @Test(expected = SeleniumException.class)
  public void testShouldRequireSessionExistsInKnownSessionsWhenLaunching() {
    TestSessions sessions = new TestSessions(context);

    DrivenSeleniumLauncher launcher = new DrivenSeleniumLauncher(
        caps, rcConfig, seleniumSessionId, "1234");
    launcher.setDriverSessions(sessions);

    launcher.launchRemoteSession("http://www.example.com");
  }
}
