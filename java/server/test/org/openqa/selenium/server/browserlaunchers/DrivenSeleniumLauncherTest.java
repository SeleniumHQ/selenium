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

import static org.junit.Assert.assertEquals;

import com.thoughtworks.selenium.SeleniumException;

import org.jmock.Expectations;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.Session;
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
  public void shouldRequireSessionExistsInKnownSessionsWhenLaunching() {
    TestSessions sessions = new TestSessions(context);

    DrivenSeleniumLauncher launcher = new DrivenSeleniumLauncher(
        caps, rcConfig, seleniumSessionId, "1234");
    launcher.setDriverSessions(sessions);

    launcher.launchRemoteSession("http://www.example.com");
  }

  @Test
  public void closeShouldCallQuitOnTheDriver() {
    final DriverSessions sessions = mock(DriverSessions.class);
    final SessionId id = new SessionId("1234");
    final Session session = mock(Session.class);
    final WebDriver driver = mock(WebDriver.class);
    caps.setCapability("webdriver.remote.sessionid", id.toString());

    checking(new Expectations() {{
      one(sessions).get(id);
      will(returnValue(session));
      one(session).getDriver();
      will(returnValue(driver));
      one(driver).quit();
      one(session).close();
    }});

    DrivenSeleniumLauncher launcher = new DrivenSeleniumLauncher(
        caps, rcConfig, id.toString(), null);
    launcher.setDriverSessions(sessions);
    launcher.close();
  }

  @Test
  public void closeShouldSurviveIfTheSessionIsNotPresent() {
    final DriverSessions sessions = mock(DriverSessions.class);
    final SessionId id = new SessionId("1234");
    caps.setCapability("webdriver.remote.sessionid", id.toString());

    checking(new Expectations() {{
      one(sessions).get(id); will(returnValue(null));
    }});

    DrivenSeleniumLauncher launcher = new DrivenSeleniumLauncher(
        caps, rcConfig, id.toString(), null);
    launcher.setDriverSessions(sessions);
    launcher.close();
  }

  @Test
  public void closeShouldSurviveIfThereIsNoWebDriverInstance() {
    final DriverSessions sessions = mock(DriverSessions.class);
    final SessionId id = new SessionId("1234");
    final Session session = mock(Session.class);
    caps.setCapability("webdriver.remote.sessionid", id.toString());

    checking(new Expectations() {{
      one(sessions).get(id); will(returnValue(session));
      one(session).getDriver(); will(returnValue(null));
      one(session).close();
    }});

    DrivenSeleniumLauncher launcher = new DrivenSeleniumLauncher(
        caps, rcConfig, id.toString(), null);
    launcher.setDriverSessions(sessions);
    launcher.close();
  }

  @Test
  public void closeShouldSurviveQuitThrowingAnException() {
    final DriverSessions sessions = mock(DriverSessions.class);
    final SessionId id = new SessionId("1234");
    final Session session = mock(Session.class);
    final WebDriver driver = mock(WebDriver.class);
    caps.setCapability("webdriver.remote.sessionid", id.toString());

    checking(new Expectations() {{
      one(sessions).get(id); will(returnValue(session));
      one(session).getDriver(); will(returnValue(driver));
      one(driver).quit(); will(throwException(new WebDriverException("boom")));
      one(session).close();
    }});

    DrivenSeleniumLauncher launcher = new DrivenSeleniumLauncher(
        caps, rcConfig, id.toString(), null);
    launcher.setDriverSessions(sessions);
    launcher.close();
  }
}
