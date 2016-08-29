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

import com.google.gson.JsonObject;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.grid.internal.utils.HtmlRenderer;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.selenium.remote.internal.HttpClientFactory;

import java.net.URL;
import java.util.List;
import java.util.Map;

/**
 * Proxy to a remote server executing the tests. <p> The proxy keeps a state of what is happening
 * on the remote server and knows if a new test can be run on the remote server. There are several
 * reasons why a test could not be run on the specified remote server, for instance: if the
 * RemoteProxy decides the remote server has reached the maximum number of concurrent sessions, or
 * if the client has requested DesiredCapabilities we don't support e.g. asking for Chrome when we
 * only support Firefox.
 */
public interface RemoteProxy extends Comparable<RemoteProxy> {
  /**
   * Each test running on the node will occupy a test slot.  A test slot can either be in use (have a session) or be
   * available for scheduling (no associated session).  This method allows retrieving the total state of the node,
   * both test slots in use and those unused.
   *
   * @return the test slots.
   */
  List<TestSlot> getTestSlots();

  /**
   * Retrieves the handle to the registry this remote proxy is registered with.
   *
   * @return the registry.
   */
  Registry getRegistry();

  /**
   * Returns the capability matcher that will be used to by the remote proxy
   * to determine whether its test slots can run a requested test session.
   *
   * @return the capability matcher.
   */
  CapabilityMatcher getCapabilityHelper();

  /**
   * If the RemoteProxy implementation also implements TimeoutListener, then this method
   * will start up the thread used to monitor timeouts and handle cleanup of timed out resources.
   */
  void setupTimeoutListener();

  /**
   * Returns the unique id for the node.  The ID should not change throughout the life of the node.
   *
   * @return the unique node id.
   */
  String getId();

  /**
   * If the RemoteProxy implementation also implements TimeoutListener, then this method
   * will stop the thread used to monitor timeouts.
   */
  void teardown();

  /**
   * Returns the configuration the node was initialized with.
   *
   * @return the node configuration.
   */
  GridNodeConfiguration getConfig();

  /**
   * Returns the request sent from the node to the hub to register the proxy.
   *
   * @return the original node registration request.
   */
  RegistrationRequest getOriginalRegistrationRequest();

  /**
   * Returns the maximum number of concurrent tests that can run on this node.  NB: this number can be less than
   * the number of test slots because a test slot only indicates what type of test session can be run on the remote.
   * I.e., a node may allow N different <em>types</em> of tests, but only allow M tests to run at once, for M &lt;= N.
   *
   * @return Maximum number of concurrent tests that can run on this node.
   */
  int getMaxNumberOfConcurrentTestSessions();

  /**
   * Get the host the node is on. This is different from the URL used to communicate with the
   * driver. For a local node that support both RC and WebDriver protocols,
   * remoteHost=http://localhost:5555, but the underlying server will respond on urls
   * http://localhost:5555/wd/hub (proxy.host + slot.path, where slot is a WebDriver slot) and
   * http://localhost:5555/selenium-server/driver (proxy.host + slot.path, where slot is an RC slot).
   *
   * @return the host the node is running on.
   */
  URL getRemoteHost();

  /**
   * Creates and returns a new test session if the current node has the resources and is ready to run the test.
   *
   * @param requestedCapability the type of test the client is interested in performing.
   *
   * @return a new TestSession if possible, <code>null</code> otherwise
   */
  TestSession getNewSession(Map<String, Object> requestedCapability);

  /**
   * Returns the total number of test slots used on this node.
   *
   * @return the total number of test slots in use.
   */
  int getTotalUsed();

  /**
   * Returns the object responsible for rendering any information about the proxy in a Web application.
   *
   * @return the renderer.
   */
  HtmlRenderer getHtmlRender();

  /**
   * Indicates how long a node should wait for a seemingly non-responsive test session before deciding it has timed out.
   *
   * @return the timeout in milliseconds.
   */
  int getTimeOut();

  /**
   * Retrieves the global factory for creating HTTP clients.
   *
   * @return The thread-safe HTTP client factory.
   */
  HttpClientFactory getHttpClientFactory();

  /**
   * Renders the status of the node as JSON.  Useful for APIs.
   *
   * @return the node status.
   *
   * @throws GridException if the node is down.
   */
  JsonObject getStatus() throws GridException;

  /**
   * Checks if the node has the capability requested.
   * <br>
   * The definition of "has" is defined by {@link CapabilityMatcher#matches(Map, Map)}
   * <br>
   * <code>hasCapability = true</code> doesn't mean the test cast start just now, only that the proxy will be
   * able to run a test requiring that capability at some point.
   *
   * @param requestedCapability the type of test the client is interested in performing.
   *
   * @return <code>true</code> if present
   */
  boolean hasCapability(Map<String,Object> requestedCapability);

  /**
   * Indicates whether the node has any test slots in use.  The node may still be able to accept more work even
   * if it is busy.
   *
   * @return <code>true</code> if the node has any test slots in use.
   */
  boolean isBusy();


  /**
   * Return how much resources are currently used on the proxy. Default implementation is runningTests / maxTests
   * on the proxy. For a proxy with more knowledge about its resources, a finer implementation can also take into
   * account CPU usage, RAM usage etc.
   * @return the percentage of the available resource used. Can be greater than 100 if the grid is under heavy load.
   */
  float getResourceUsageInPercent();

  /**
   * @return the time the latest session was started on a TestSlot, -1 if no sessions were started.
   */
  long getLastSessionStart();
}
