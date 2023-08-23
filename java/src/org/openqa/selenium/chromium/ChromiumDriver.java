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

import static org.openqa.selenium.remote.Browser.CHROME;
import static org.openqa.selenium.remote.Browser.EDGE;
import static org.openqa.selenium.remote.Browser.OPERA;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Credentials;
import org.openqa.selenium.HasAuthentication;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.PersistentCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.BiDiException;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.devtools.CdpEndpointFinder;
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
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.logging.EventType;
import org.openqa.selenium.logging.HasLogEvents;
import org.openqa.selenium.mobile.NetworkConnection;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.FileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.html5.RemoteLocationContext;
import org.openqa.selenium.remote.html5.RemoteWebStorage;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.ConnectionFailedException;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.mobile.RemoteNetworkConnection;

/**
 * A {@link WebDriver} implementation that controls a Chromium browser running on the local machine.
 * It is used as the base class for Chromium-based browser drivers (Chrome, Edge).
 */
public class ChromiumDriver extends RemoteWebDriver
    implements HasAuthentication,
        HasBiDi,
        HasCasting,
        HasCdp,
        HasDevTools,
        HasLaunchApp,
        HasLogEvents,
        HasNetworkConditions,
        HasPermissions,
        LocationContext,
        NetworkConnection,
        WebStorage {

  public static final Predicate<String> IS_CHROMIUM_BROWSER =
      name -> CHROME.is(name) || EDGE.is(name) || OPERA.is(name);
  private static final Logger LOG = Logger.getLogger(ChromiumDriver.class.getName());

  private final Capabilities capabilities;
  private final RemoteLocationContext locationContext;
  private final RemoteWebStorage webStorage;
  private final RemoteNetworkConnection networkConnection;
  private final HasNetworkConditions networkConditions;
  private final HasPermissions permissions;
  private final HasLaunchApp launch;
  private Optional<Connection> connection;
  private final Optional<DevTools> devTools;
  private final Optional<URI> biDiUri;
  private final Optional<BiDi> biDi;
  protected HasCasting casting;
  protected HasCdp cdp;

  protected ChromiumDriver(
      CommandExecutor commandExecutor, Capabilities capabilities, String capabilityKey) {
    super(commandExecutor, capabilities);
    locationContext = new RemoteLocationContext(getExecuteMethod());
    webStorage = new RemoteWebStorage(getExecuteMethod());
    permissions = new AddHasPermissions().getImplementation(getCapabilities(), getExecuteMethod());
    networkConnection = new RemoteNetworkConnection(getExecuteMethod());
    networkConditions =
        new AddHasNetworkConditions().getImplementation(getCapabilities(), getExecuteMethod());
    launch = new AddHasLaunchApp().getImplementation(getCapabilities(), getExecuteMethod());

    HttpClient.Factory factory = HttpClient.Factory.createDefault();
    Capabilities originalCapabilities = super.getCapabilities();

    Optional<String> webSocketUrl =
        Optional.ofNullable((String) originalCapabilities.getCapability("webSocketUrl"));

    this.biDiUri =
        webSocketUrl.map(
            uri -> {
              try {
                return new URI(uri);
              } catch (URISyntaxException e) {
                LOG.warning(e.getMessage());
              }
              return null;
            });

    this.biDi = createBiDi(biDiUri);

    Optional<URI> reportedUri =
        CdpEndpointFinder.getReportedUri(capabilityKey, originalCapabilities);
    Optional<HttpClient> client =
        reportedUri.map(uri -> CdpEndpointFinder.getHttpClient(factory, uri));
    Optional<URI> cdpUri;

    try {
      try {
        cdpUri = client.flatMap(httpClient -> CdpEndpointFinder.getCdpEndPoint(httpClient));
      } catch (Exception e) {
        try {
          client.ifPresent(HttpClient::close);
        } catch (Exception ex) {
          e.addSuppressed(ex);
        }
        throw e;
      }
      connection = cdpUri.map(uri -> new Connection(client.get(), uri.toString()));
    } catch (ConnectionFailedException e) {
      cdpUri = Optional.empty();
      LOG.log(Level.WARNING, "Unable to establish websocket connection to " + reportedUri.get(), e);
      connection = Optional.empty();
    }

    CdpInfo cdpInfo =
        new CdpVersionFinder()
            .match(originalCapabilities.getBrowserVersion())
            .orElseGet(
                () -> {
                  LOG.warning(
                      String.format(
                          "Unable to find version of CDP to use for %s. You may need to include a"
                              + " dependency on a specific version of the CDP using something"
                              + " similar to `org.seleniumhq.selenium:selenium-devtools-v86:%s`"
                              + " where the version (\"v86\") matches the version of the"
                              + " chromium-based browser you're using and the version number of the"
                              + " artifact is the same as Selenium's.",
                          originalCapabilities.getBrowserVersion(),
                          new BuildInfo().getReleaseLabel()));
                  return new NoOpCdpInfo();
                });

    devTools = connection.map(conn -> new DevTools(cdpInfo::getDomains, conn));

    this.capabilities =
        cdpUri
            .map(
                uri ->
                    new ImmutableCapabilities(
                        new PersistentCapabilities(originalCapabilities)
                            .setCapability("se:cdp", uri.toString())
                            .setCapability(
                                "se:cdpVersion", originalCapabilities.getBrowserVersion())))
            .orElse(new ImmutableCapabilities(originalCapabilities));
  }

  @Override
  public Capabilities getCapabilities() {
    return capabilities;
  }

  @Override
  public void setFileDetector(FileDetector detector) {
    throw new WebDriverException(
        "Setting the file detector only works on remote webdriver instances obtained "
            + "via RemoteWebDriver");
  }

  @Override
  public <X> void onLogEvent(EventType<X> kind) {
    Require.nonNull("Event type", kind);
    kind.initializeListener(this);
  }

  @Override
  public void register(Predicate<URI> whenThisMatches, Supplier<Credentials> useTheseCredentials) {
    Require.nonNull("Check to use to see how we should authenticate", whenThisMatches);
    Require.nonNull("Credentials to use when authenticating", useTheseCredentials);

    getDevTools().createSessionIfThereIsNotOne(getWindowHandle());
    getDevTools().getDomains().network().addAuthHandler(whenThisMatches, useTheseCredentials);
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
    Require.nonNull("Location", location);
    locationContext.setLocation(location);
  }

  @Override
  public ConnectionType getNetworkConnection() {
    return networkConnection.getNetworkConnection();
  }

  @Override
  public ConnectionType setNetworkConnection(ConnectionType type) {
    Require.nonNull("Network Connection Type", type);
    return networkConnection.setNetworkConnection(type);
  }

  @Override
  public void launchApp(String id) {
    Require.nonNull("Launch App ID", id);
    launch.launchApp(id);
  }

  @Override
  public Map<String, Object> executeCdpCommand(String commandName, Map<String, Object> parameters) {
    Require.nonNull("Command Name", commandName);
    return cdp.executeCdpCommand(commandName, parameters);
  }

  @Override
  public Optional<DevTools> maybeGetDevTools() {
    return devTools;
  }

  private Optional<BiDi> createBiDi(Optional<URI> biDiUri) {
    if (!biDiUri.isPresent()) {
      return Optional.empty();
    }

    URI wsUri =
        biDiUri.orElseThrow(
            () -> new BiDiException("This version of Chromium driver does not support BiDi"));

    HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();
    ClientConfig wsConfig = ClientConfig.defaultConfig().baseUri(wsUri);
    HttpClient wsClient = clientFactory.createClient(wsConfig);

    org.openqa.selenium.bidi.Connection biDiConnection =
        new org.openqa.selenium.bidi.Connection(wsClient, wsUri.toString());

    return Optional.of(new BiDi(biDiConnection));
  }

  @Override
  public Optional<BiDi> maybeGetBiDi() {
    return biDi;
  }

  @Override
  public List<Map<String, String>> getCastSinks() {
    return casting.getCastSinks();
  }

  @Override
  public String getCastIssueMessage() {
    return casting.getCastIssueMessage();
  }

  @Override
  public void selectCastSink(String deviceName) {
    Require.nonNull("Device Name", deviceName);
    casting.selectCastSink(deviceName);
  }

  @Override
  public void startDesktopMirroring(String deviceName) {
    Require.nonNull("Device Name", deviceName);
    casting.startDesktopMirroring(deviceName);
  }

  @Override
  public void startTabMirroring(String deviceName) {
    Require.nonNull("Device Name", deviceName);
    casting.startTabMirroring(deviceName);
  }

  @Override
  public void stopCasting(String deviceName) {
    Require.nonNull("Device Name", deviceName);
    casting.stopCasting(deviceName);
  }

  @Override
  public void setPermission(String name, String value) {
    Require.nonNull("Permission Name", name);
    Require.nonNull("Permission Value", value);
    permissions.setPermission(name, value);
  }

  @Override
  public ChromiumNetworkConditions getNetworkConditions() {
    return networkConditions.getNetworkConditions();
  }

  @Override
  public void setNetworkConditions(ChromiumNetworkConditions networkConditions) {
    Require.nonNull("Network Conditions", networkConditions);
    this.networkConditions.setNetworkConditions(networkConditions);
  }

  @Override
  public void deleteNetworkConditions() {
    networkConditions.deleteNetworkConditions();
  }

  @Override
  public void quit() {
    super.quit();
  }
}
