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

package org.openqa.selenium.chromium;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.devtools.CdpInfo;
import org.openqa.selenium.devtools.CdpVersionFinder;
import org.openqa.selenium.devtools.Connection;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.HasDevTools;
import org.openqa.selenium.devtools.noop.NoOpCdpInfo;
import org.openqa.selenium.html5.LocalStorage;
import org.openqa.selenium.html5.Location;
import org.openqa.selenium.html5.LocationContext;
import org.openqa.selenium.html5.SessionStorage;
import org.openqa.selenium.html5.WebStorage;
import org.openqa.selenium.interactions.HasTouchScreen;
import org.openqa.selenium.interactions.TouchScreen;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.logging.EventType;
import org.openqa.selenium.logging.HasLogEvents;
import org.openqa.selenium.mobile.NetworkConnection;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.FileDetector;
import org.openqa.selenium.remote.RemoteTouchScreen;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.html5.RemoteLocationContext;
import org.openqa.selenium.remote.html5.RemoteWebStorage;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.mobile.RemoteNetworkConnection;

import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.logging.Logger;

/**
 * A {@link WebDriver} implementation that controls a Chromium browser running on the local machine.
 * This class is provided as a convenience for easily testing the Chromium browser. The control server
 * which each instance communicates with will live and die with the instance.
 *
 * To avoid unnecessarily restarting the ChromiumDriver server with each instance, use a
 * {@link RemoteWebDriver} coupled with the desired WebDriverService, which is managed
 * separately.
 *
 * Note that unlike ChromiumDriver, RemoteWebDriver doesn't directly implement
 * role interfaces such as {@link LocationContext} and {@link WebStorage}.
 * Therefore, to access that functionality, it needs to be
 * {@link org.openqa.selenium.remote.Augmenter augmented} and then cast
 * to the appropriate interface.
 */
public class ChromiumDriver extends RemoteWebDriver
    implements HasDevTools, HasLogEvents, HasTouchScreen, LocationContext, NetworkConnection, WebStorage {

  private static final Logger LOG = Logger.getLogger(ChromiumDriver.class.getName());
  private final RemoteLocationContext locationContext;
  private final RemoteWebStorage webStorage;
  private final TouchScreen touchScreen;
  private final RemoteNetworkConnection networkConnection;
  private final Optional<Connection> connection;
  private final Optional<DevTools> devTools;

  protected ChromiumDriver(CommandExecutor commandExecutor, Capabilities capabilities, String capabilityKey) {
    super(commandExecutor, capabilities);
    locationContext = new RemoteLocationContext(getExecuteMethod());
    webStorage = new RemoteWebStorage(getExecuteMethod());
    touchScreen = new RemoteTouchScreen(getExecuteMethod());
    networkConnection = new RemoteNetworkConnection(getExecuteMethod());

    HttpClient.Factory factory = HttpClient.Factory.createDefault();
    connection = ChromiumDevToolsLocator.getChromeConnector(
        factory,
        getCapabilities(),
        capabilityKey);

    CdpInfo cdpInfo = new CdpVersionFinder().match(getCapabilities().getVersion())
      .orElseGet(() -> {
          LOG.warning(
            String.format(
              "Unable to find version of CDP to use for %s. You may need to " +
                "include a dependency on a specific version of the CDP using " +
                "something similar to " +
                "`org.seleniumhq.selenium:selenium-devtools:86` where the " +
                "version matches the version of the chromium-based browser " +
                "you're using.",
              capabilities.getVersion()));
          return new NoOpCdpInfo();
        });

    devTools = connection.map(conn -> new DevTools(cdpInfo.getDomains(), conn));
  }

  @Override
  public void setFileDetector(FileDetector detector) {
    throw new WebDriverException(
        "Setting the file detector only works on remote webdriver instances obtained " +
        "via RemoteWebDriver");
  }

  @Override
  public <X> void onLogEvent(EventType<X> kind) {
    Require.nonNull("Event type", kind);
    kind.initializeLogger(this);
  }

  @Override
  public LocalStorage getLocalStorage() {
    return webStorage.getLocalStorage();
  }

  @Override
  public SessionStorage getSessionStorage() {
    return webStorage.getSessionStorage();
  }

  @Override
  public Location location() {
    return locationContext.location();
  }

  @Override
  public void setLocation(Location location) {
    locationContext.setLocation(location);
  }

  @Override
  public TouchScreen getTouch() {
    return touchScreen;
  }

  @Override
  public ConnectionType getNetworkConnection() {
    return networkConnection.getNetworkConnection();
  }

  @Override
  public ConnectionType setNetworkConnection(ConnectionType type) {
    return networkConnection.setNetworkConnection(type);
  }

  /**
   * Launches Chrome app specified by id.
   *
   * @param id Chrome app id.
   */
  public void launchApp(String id) {
    execute(ChromiumDriverCommand.LAUNCH_APP, ImmutableMap.of("id", id));
  }

  /**
   * Execute a Chrome Devtools Protocol command and get returned result. The
   * command and command args should follow
   * <a href="https://chromedevtools.github.io/devtools-protocol/">chrome
   * devtools protocol domains/commands</a>.
   */
  public Map<String, Object> executeCdpCommand(String commandName, Map<String, Object> parameters) {
    Require.nonNull("Command name", commandName);
    Require.nonNull("Parameters", parameters);

    @SuppressWarnings("unchecked")
    Map<String, Object> toReturn = (Map<String, Object>) getExecuteMethod().execute(
        ChromiumDriverCommand.EXECUTE_CDP_COMMAND,
        ImmutableMap.of("cmd", commandName, "params", parameters));

    return ImmutableMap.copyOf(toReturn);
  }

  @Override
  public DevTools getDevTools() {
    return devTools.orElseThrow(() -> new WebDriverException("Unable to create DevTools connection"));
  }

  public String getCastSinks() {
    Object response = getExecuteMethod().execute(ChromiumDriverCommand.GET_CAST_SINKS, null);
    return response.toString();
  }

  public String getCastIssueMessage() {
    Object response = getExecuteMethod().execute(ChromiumDriverCommand.GET_CAST_ISSUE_MESSAGE, null);
    return response.toString();
  }

  public void selectCastSink(String deviceName) {
    getExecuteMethod().execute(ChromiumDriverCommand.SET_CAST_SINK_TO_USE, ImmutableMap.of("sinkName", deviceName));
  }

  public void startTabMirroring(String deviceName) {
    getExecuteMethod().execute(ChromiumDriverCommand.START_CAST_TAB_MIRRORING, ImmutableMap.of("sinkName", deviceName));
  }

  public void stopCasting(String deviceName) {
    getExecuteMethod().execute(ChromiumDriverCommand.STOP_CASTING, ImmutableMap.of("sinkName", deviceName));
  }

  public void setPermission(String name, String value) {
    getExecuteMethod().execute(ChromiumDriverCommand.SET_PERMISSION,
      ImmutableMap.of("descriptor", ImmutableMap.of("name", name), "state", value));
  }

  @Override
  public void quit() {
    connection.ifPresent(Connection::close);
    super.quit();
  }
}
