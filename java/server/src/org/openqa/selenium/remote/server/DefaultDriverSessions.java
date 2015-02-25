/*
Copyright 2007-2009 Selenium committers

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

package org.openqa.selenium.remote.server;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.SessionId;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.ServiceLoader;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

public class DefaultDriverSessions implements DriverSessions {

  private static final Logger log = Logger.getLogger(DefaultDriverSessions.class.getName());

  private final DriverFactory factory;

  private final Map<SessionId, Session> sessionIdToDriver =
      new ConcurrentHashMap<SessionId, Session>();

  private static Map<Capabilities, String> defaultDrivers = new HashMap<Capabilities, String>() {{
    put(DesiredCapabilities.chrome(), "org.openqa.selenium.chrome.ChromeDriver");
    put(DesiredCapabilities.firefox(), "org.openqa.selenium.firefox.FirefoxDriver");
    put(DesiredCapabilities.htmlUnit(), "org.openqa.selenium.htmlunit.HtmlUnitDriver");
    put(DesiredCapabilities.internetExplorer(), "org.openqa.selenium.ie.InternetExplorerDriver");
    put(DesiredCapabilities.opera(), "com.opera.core.systems.OperaDriver");
    put(DesiredCapabilities.operaBlink(), "org.openqa.selenium.opera.OperaDriver");
    put(DesiredCapabilities.safari(), "org.openqa.selenium.safari.SafariDriver");
    put(DesiredCapabilities.phantomjs(), "org.openqa.selenium.phantomjs.PhantomJSDriver");
  }};

  public DefaultDriverSessions() {
    this(Platform.getCurrent(), new DefaultDriverFactory());
  }

  public DefaultDriverSessions(
      DriverFactory factory, Map<Capabilities, Class<? extends WebDriver>> drivers) {
    this.factory = factory;
    for (Map.Entry<Capabilities, Class<? extends WebDriver>> entry : drivers.entrySet()) {
      registerDriver(entry.getKey(), entry.getValue());
    }
  }

  protected DefaultDriverSessions(Platform runningOn, DriverFactory factory) {
    this.factory = factory;
    registerDefaults(runningOn);
    registerDriverProviders(runningOn);
  }

  private void registerDefaults(Platform current) {
    for (Map.Entry<Capabilities, String> entry : defaultDrivers.entrySet()) {
      Capabilities caps = entry.getKey();
      if (caps.getPlatform() == null || caps.getPlatform() == Platform.ANY || current.is(caps.getPlatform())) {
        registerDriver(caps, entry.getValue());
      } else {
        log.info("Default driver " + entry.getValue() + " registration is skipped: registration capabilities "
                 + caps.toString() + " does not match with current platform: " + current.toString());
      }
    }
  }

  private void registerDriverProviders(Platform current) {
    for (DriverProvider provider : ServiceLoader.load(DriverProvider.class)) {
      Capabilities caps = provider.getProvidedCapabilities();
      if (caps.getPlatform() == null || caps.getPlatform() == Platform.ANY || current.is(caps.getPlatform())) {
        factory.registerDriverProvider(caps, provider);
      } else {
        log.info("Driver provider " + provider + " registration is skipped: registration capabilities "
                 + caps.toString() + " does not match with current platform: " + current.toString());
      }
    }
  }

  private void registerDriver(Capabilities caps, String className) {
    try {
      registerDriver(caps, Class.forName(className).asSubclass(WebDriver.class));
    } catch (ClassNotFoundException e) {
      log.log(Level.INFO, "Unable to register driver with className " + className + " due to ClassNotFoundException");
    } catch (NoClassDefFoundError e) {
      log.log(Level.WARNING, "Unable to register driver with className " + className + " due to NoClassDefFoundError");
    }
  }

  public SessionId newSession(Capabilities desiredCapabilities) throws Exception {
    SessionId sessionId = new SessionId(UUID.randomUUID().toString());
    Session session = DefaultSession.createSession(factory, sessionId, desiredCapabilities);

    sessionIdToDriver.put(sessionId, session);

    return sessionId;
  }

  public Session get(SessionId sessionId) {
    return sessionIdToDriver.get(sessionId);
  }

  public void deleteSession(SessionId sessionId) {
    final Session removedSession = sessionIdToDriver.remove(sessionId);
    if (removedSession != null) {
      removedSession.close();
    }
  }

  public void registerDriver(Capabilities capabilities, Class<? extends WebDriver> implementation) {
    factory.registerDriver(capabilities, implementation);
  }

  public Set<SessionId> getSessions() {
    return Collections.unmodifiableSet(sessionIdToDriver.keySet());
  }
}
