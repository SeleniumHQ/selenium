// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.remote.server;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.RemovalListener;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.common.io.Files;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.log.LoggingManager;
import org.openqa.selenium.remote.server.log.PerSessionLogHandler;

import java.util.List;
import java.util.ServiceLoader;
import java.util.Set;
import java.util.logging.Logger;

public class DefaultDriverSessions implements DriverSessions {

  private static final Logger LOG = Logger.getLogger(DefaultDriverSessions.class.getName());

  private final DriverFactory factory;
  private final Clock clock;

  private final Cache<SessionId, Session> sessionIdToDriver;

  private static List<DriverProvider> defaultDriverProviders =
    new ImmutableList.Builder<DriverProvider>()
      .add(new FirefoxDriverProvider())
      .add(new DefaultDriverProvider(DesiredCapabilities.chrome(),
                                     "org.openqa.selenium.chrome.ChromeDriver"))
      .add(new DefaultDriverProvider(DesiredCapabilities.internetExplorer(),
                                     "org.openqa.selenium.ie.InternetExplorerDriver"))
      .add(new DefaultDriverProvider(DesiredCapabilities.edge(),
                                     "org.openqa.selenium.edge.EdgeDriver"))
      .add(new DefaultDriverProvider(DesiredCapabilities.opera(),
                                     "com.opera.core.systems.OperaDriver"))
      .add(new DefaultDriverProvider(DesiredCapabilities.operaBlink(),
                                     "org.openqa.selenium.opera.OperaDriver"))
      .add(new DefaultDriverProvider(DesiredCapabilities.safari(),
                                     "org.openqa.selenium.safari.SafariDriver"))
      .add(new DefaultDriverProvider(DesiredCapabilities.phantomjs(),
                                     "org.openqa.selenium.phantomjs.PhantomJSDriver"))
      .add(new DefaultDriverProvider(DesiredCapabilities.htmlUnit(),
                                     "org.openqa.selenium.htmlunit.HtmlUnitDriver"))
      .build();

  public DefaultDriverSessions(Platform runningOn, DriverFactory factory, Clock clock) {
    this.factory = factory;
    this.clock = clock;
    registerDefaults(runningOn);
    registerServiceLoaders(runningOn);

    RemovalListener<SessionId, Session> listener = notification -> {
      Session session = notification.getValue();

      session.close();
      PerSessionLogHandler logHandler = LoggingManager.perSessionLogHandler();
      logHandler.transferThreadTempLogsToSessionLogs(session.getSessionId());
      logHandler.removeSessionLogs(session.getSessionId());
    };

    this.sessionIdToDriver = CacheBuilder.newBuilder()
        .removalListener(listener)
        .build();
  }

  private void registerDefaults(Platform current) {
    for (DriverProvider provider : defaultDriverProviders) {
      registerDriverProvider(current, provider);
    }
  }

  private void registerServiceLoaders(Platform current) {
    for (DriverProvider provider : ServiceLoader.load(DriverProvider.class)) {
      registerDriverProvider(current, provider);
    }
  }

  private void registerDriverProvider(Platform current, DriverProvider provider) {
    Capabilities caps = provider.getProvidedCapabilities();
    if (!platformMatches(current, caps)) {
      LOG.info(String.format(
        "Driver provider %s registration is skipped:%n" +
        " registration capabilities %s does not match the current platform %s",
        provider, caps, current));
      return;
    }

    if (!provider.canCreateDriverInstances()) {
      LOG.info(String.format(
        "Driver provider %s registration is skipped:%n" +
        "Unable to create new instances on this machine.",
        provider));
    }

    factory.registerDriverProvider(provider);
  }

  private boolean platformMatches(Platform current, Capabilities caps) {
    return caps.getPlatform() == null
           || caps.getPlatform() == Platform.ANY
           || current.is(caps.getPlatform());
  }

  public void registerDriver(Capabilities capabilities, Class<? extends WebDriver> driverClass) {
    factory.registerDriverProvider(new DefaultDriverProvider(capabilities, driverClass));
  }

  public SessionId newSession(Capabilities desiredCapabilities) throws Exception {
    Session session = DefaultSession.createSession(
        factory,
        TemporaryFilesystem.getTmpFsBasedOn(Files.createTempDir()),
        clock,
        desiredCapabilities);

    sessionIdToDriver.put(session.getSessionId(), session);

    return session.getSessionId();
  }

  public Session get(SessionId sessionId) {
    return sessionIdToDriver.getIfPresent(sessionId);
  }

  public void deleteSession(SessionId sessionId) {
    sessionIdToDriver.invalidate(sessionId);
  }

  public Set<SessionId> getSessions() {
    return ImmutableSet.copyOf(sessionIdToDriver.asMap().keySet());
  }
}
