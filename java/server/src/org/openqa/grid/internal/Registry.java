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

package org.openqa.grid.internal;

import net.jcip.annotations.ThreadSafe;

import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.web.Hub;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.internal.HttpClientFactory;

import java.util.List;
import java.util.Set;

/**
 * Deprecated Kernel of the grid. Keeps track of what's happening, what's free/used and assigns resources to
 * incoming requests.
 *
 * @deprecated use {@link DefaultGridRegistry} instead. This class is just a proxy to it.
 */
@Deprecated
@ThreadSafe
public class Registry implements GridRegistry {
  BaseGridRegistry gridRegistry;

  @Deprecated
  public Registry() {
    gridRegistry = new DefaultGridRegistry();
  }

  private Registry(Hub hub) {
    gridRegistry = new DefaultGridRegistry(hub);
  }

  private void setConfiguration(GridHubConfiguration configuration) {
    gridRegistry.configuration = configuration;
  }

  /**
   * @see GridRegistry#start()
   */
  @Deprecated
  public void start() {
    gridRegistry.start();
  }

  /**
   * Creates a new {@link Registry} that is not associated with a Hub and starts it.
   * @return the registry
   */
  @SuppressWarnings({"NullableProblems"})
  @Deprecated
  public static Registry newInstance() {
    return newInstance(null, new GridHubConfiguration());
  }

  /**
   * Creates a new {@link Registry} and starts it
   *
   * @param hub the {@link Hub} to associate this registry with
   * @param config the {@link GridHubConfiguration}
   * @return the registry
   */
  @Deprecated
  public static Registry newInstance(Hub hub, GridHubConfiguration config) {
    Registry registry = new Registry(hub);
    if (hub.getConfiguration() != config) {
      registry.setConfiguration(config);
    }
    registry.start();
    return registry;
  }

  /**
   * @see GridRegistry#getConfiguration()
   */
  @Deprecated
  public GridHubConfiguration getConfiguration() {
    return gridRegistry.getConfiguration();
  }

  /**
   * @see GridRegistry#terminate(TestSession, SessionTerminationReason)
   */
  @Deprecated
  public void terminate(final TestSession session, final SessionTerminationReason reason) {
    gridRegistry.terminate(session, reason);
  }

  /**
   * @see GridRegistry#removeIfPresent(RemoteProxy)
   */
  @Deprecated
  public void removeIfPresent(RemoteProxy proxy) {
    gridRegistry.removeIfPresent(proxy);
  }

  /**
   * @see GridRegistry#forceRelease(TestSlot, SessionTerminationReason)
   */
  @Deprecated
  public void forceRelease(TestSlot testSlot, SessionTerminationReason reason) {
    gridRegistry.forceRelease(testSlot, reason);
  }

  /**
   * @see GridRegistry#stop()
   */
  @Deprecated
  public void stop() {
    gridRegistry.stop();
  }

  /**
   * @see GridRegistry#getHub()
   */
  @Deprecated
  public Hub getHub() {
    return gridRegistry.getHub();
  }

  /**
   * @see GridRegistry#setHub(Hub)
   */
  @Deprecated
  public void setHub(Hub hub) {
    gridRegistry.setHub(hub);
  }

  /**
   * @see GridRegistry#addNewSessionRequest(RequestHandler)
   */
  @Deprecated
  public void addNewSessionRequest(RequestHandler handler) {
    gridRegistry.addNewSessionRequest(handler);
  }

  /**
   * @see GridRegistry#add(RemoteProxy)
   */
  @Deprecated
  public void add(RemoteProxy proxy) {
    gridRegistry.add(proxy);
  }

  /**
   * @see GridRegistry#setThrowOnCapabilityNotPresent(boolean)
   */
  @Deprecated
  public void setThrowOnCapabilityNotPresent(boolean throwOnCapabilityNotPresent) {
    gridRegistry.setThrowOnCapabilityNotPresent(throwOnCapabilityNotPresent);
  }

  /**
   * @see GridRegistry#getAllProxies()
   */
  @Deprecated
  public ProxySet getAllProxies() {
    return gridRegistry.getAllProxies();
  }

  /**
   * @see GridRegistry#getUsedProxies()
   */
  @Deprecated
  public List<RemoteProxy> getUsedProxies() {
    return gridRegistry.getUsedProxies();
  }

  /**
   * @see GridRegistry#getSession(ExternalSessionKey)
   */
  @Deprecated
  public TestSession getSession(ExternalSessionKey externalKey) {
    return gridRegistry.getSession(externalKey);
  }

  /**
   * @see GridRegistry#getExistingSession(ExternalSessionKey)
   */
  @Deprecated
  public TestSession getExistingSession(ExternalSessionKey externalKey) {
    return gridRegistry.getExistingSession(externalKey);
  }

  /**
   * @see GridRegistry#getNewSessionRequestCount()
   */
  @Deprecated
  public int getNewSessionRequestCount() {
    return gridRegistry.getNewSessionRequestCount();
  }

  /**
   * @see GridRegistry#clearNewSessionRequests()
   */
  @Deprecated
  public void clearNewSessionRequests() {
    gridRegistry.clearNewSessionRequests();
  }

  /**
   * @see GridRegistry#removeNewSessionRequest(RequestHandler)
   */
  @Deprecated
  public boolean removeNewSessionRequest(RequestHandler request) {
    return gridRegistry.removeNewSessionRequest(request);
  }

  /**
   * @see GridRegistry#getDesiredCapabilities()
   */
  @Deprecated
  public Iterable<DesiredCapabilities> getDesiredCapabilities() {
    return gridRegistry.getDesiredCapabilities();
  }

  /**
   * @see GridRegistry#getActiveSessions()
   */
  @Deprecated
  public Set<TestSession> getActiveSessions() {
    return gridRegistry.getActiveSessions();
  }

  /**
   * @see GridRegistry#getProxyById(String)
   */
  @Deprecated
  public RemoteProxy getProxyById(String id) {
    return gridRegistry.getProxyById(id);
  }

  /**
   * @see GridRegistry#getHttpClientFactory()
   */
  @Deprecated
  public HttpClientFactory getHttpClientFactory() {
    return gridRegistry.getHttpClientFactory();
  }

}
