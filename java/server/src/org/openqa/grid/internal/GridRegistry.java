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

import org.openqa.grid.web.Hub;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.http.HttpClient;

import java.net.URL;
import java.util.List;
import java.util.Set;

public interface GridRegistry {
  String KEY = GridRegistry.class.getName();

  /**
   * Ends this test session, releasing the resources in the registry. Resources should be released
   * on a separate thread so the call does not block. MUST honor listeners for the {@link TestSlot} which
   * is being released.
   *
   * @param session The session to terminate
   * @param reason  the reason for termination
   */
  void terminate(final TestSession session, final SessionTerminationReason reason);

  /**
   * Remove the {@link RemoteProxy} specified from the registry
   *
   * @param proxy
   */
  void removeIfPresent(RemoteProxy proxy);

  /**
   * Releases the test slot, WITHOUT running any listener.
   *
   * @param testSlot test slot to be released
   * @param reason reason for termination
   */
  void forceRelease(TestSlot testSlot, SessionTerminationReason reason);

  /**
   * @return the {@link Hub} for this registry or {@code null} if no {@link Hub} is set.
   */
  Hub getHub();

  /**
   * Set the {@link Hub} for this registry
   * @param hub
   */
  void setHub(Hub hub);

  /**
   * Add a new session request to the registry
   *
   * @param requestHandler the {@link RequestHandler}
   */
  void addNewSessionRequest(RequestHandler requestHandler);

  /**
   * Add a proxy to the list of proxy available for the grid to managed and link the proxy to the
   * registry.
   *
   * @param proxy The proxy to add
   */
  void add(RemoteProxy proxy);

  /**
   * If throwOnCapabilityNotPresent is set to true, the hub will reject test request for a
   * capability that is not on the grid. No exception will be thrown if the capability is present
   * but busy. <p> If set to false, the test will be queued hoping a new proxy will register later
   * offering that capability.
   *
   * @param throwOnCapabilityNotPresent true to throw if capability not present
   */
  void setThrowOnCapabilityNotPresent(boolean throwOnCapabilityNotPresent);

  /**
   * @return a {@link ProxySet} of all of the connected proxies/nodes
   */
  ProxySet getAllProxies();

  /**
   * @return a {@link List} of all of the proxies/nodes which are in use
   */
  List<RemoteProxy> getUsedProxies();

  /**
   * Gets the test session associated to this external key. The external key is the session used by
   * webdriver.
   *
   * @param externalKey the external session key
   * @return null if the hub doesn't have a node associated to the provided externalKey
   */
  TestSession getSession(ExternalSessionKey externalKey);

  /**
   * gets the test existing session associated to this external key. The external key is the session
   * used by webdriver.
   *
   * This method will log complaints and reasons if the key cannot be found
   *
   * @param externalKey the external session key
   * @return null if the hub doesn't have a node associated to the provided externalKey
   */
  TestSession getExistingSession(ExternalSessionKey externalKey);

  /**
   * @return the number of new session requests in the queue
   */
  int getNewSessionRequestCount();

  /**
   * Start the registry
   */
  void start();

  /**
   * @return an iteration of {@link DesiredCapabilities} in the new session queue
   */
  Iterable<DesiredCapabilities> getDesiredCapabilities();

  /**
   * @return the {@link Set} of active {@link TestSession}s
   */
  Set<TestSession> getActiveSessions();

  /**
   * Get the {@link RemoteProxy} using the id provided
   *
   * @param id the string identifier
   * @return the {@link RemoteProxy}
   */
  RemoteProxy getProxyById(String id);

  /**
   * Stop the registry
   */
  void stop();

  /**
    * @return the {@link HttpClient.Factory} to use.
    * @deprecated use {@link GridRegistry#getHttpClient(URL,int,int)}
   */
  HttpClient getHttpClient(URL url);

  /**
   *
   * @param url URL
   * @param connectionTimeout int
   * @param readTimeout int
   * @return the {@link HttpClient.Factory} to use.
   */
  HttpClient getHttpClient(URL url, int connectionTimeout, int readTimeout);

  /**
   * Remove a new session request from the registry
   *
   * @param requestHandler the {@link RequestHandler}
   */
  boolean removeNewSessionRequest(RequestHandler requestHandler);

  /**
   * Clear all new session requests in the registry
   */
  void clearNewSessionRequests();
}
