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

import com.google.common.base.Throwables;

import org.openqa.grid.common.SeleniumProtocol;
import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.listeners.TestSessionListener;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;

import java.net.MalformedURLException;
import java.net.URL;
import java.security.InvalidParameterException;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Logger;

/**
 * The entity on a proxy that can host a test session. A test slot has only 1 desired capabilities (
 * firefox or chrome for instance, but if a remoteproxy needs to support both, the remoteproxy will
 * need 2 TestSlots ) A TestSlot can host 1 TestSession max at a time.
 * <p>
 * The listener ({@link TestSessionListener} attached to the test session of this test slot is
 * thread safe. If 2 threads are trying to execute the before / after session, only 1 will be
 * executed.The other one will be discarded.
 *
 * This class sees multiple threads but is currently sort-of protected by the lock in Registry.
 * Unfortunately the CleanUpThread also messes around in here, so it should be thread safe on its
 * own.
 *
 */
public class TestSlot {

  private static final Logger log = Logger.getLogger(TestSlot.class.getName());

  private final Map<String, Object> capabilities;
  private final RemoteProxy proxy;
  private final SeleniumProtocol protocol;
  private final String path;
  private final CapabilityMatcher matcher;
  private final Lock lock = new ReentrantLock();

  private volatile TestSession currentSession;
  volatile boolean beingReleased = false;
  private boolean showWarning = false;
  private long lastSessionStart = -1;


  public TestSlot(RemoteProxy proxy, SeleniumProtocol protocol, String path,
                  Map<String, Object> capabilities) {
    this.proxy = proxy;
    this.protocol = protocol;
    this.path = path;

    CapabilityMatcher c = proxy.getCapabilityHelper();
    if (c == null) {
      throw new InvalidParameterException("the proxy needs to have a valid "
          + "capabilityMatcher to support have some test slots attached to it");
    }
    matcher = proxy.getCapabilityHelper();
    this.capabilities = capabilities;
  }

  public Map<String, Object> getCapabilities() {
    return Collections.unmodifiableMap(capabilities);
  }

  /**
   * @return the RemoteProxy that hosts this slot.
   */
  public RemoteProxy getProxy() {
    return proxy;
  }

  /**
   * Try to get a new session for the test slot for the desired capability. To define if the
   * test slot can host the desired capabilities, {@link CapabilityMatcher#matches(Map, Map)} is
   * invoked.
   * <p>
   * Use {@link GridHubConfiguration#setCapabilityMatcher(CapabilityMatcher)}
   * on the proxy hosting the test slot to modify the definition of match
   *
   * @param desiredCapabilities capabilities for the new session
   * @return a new session linked to that testSlot if possible, null otherwise.
   */
  public TestSession getNewSession(Map<String, Object> desiredCapabilities) {
    try {
      lock.lock();
      if (currentSession != null) {
        return null;
      }
      if (matches(desiredCapabilities)) {
        log.info("Trying to create a new session on test slot " + this.capabilities);
        TestSession session = new TestSession(this, desiredCapabilities, new DefaultTimeSource());
        currentSession = session;
        lastSessionStart = System.currentTimeMillis();
        return session;
      }
      return null;
    } finally {
      lock.unlock();
    }
  }



  /**
   * the type of protocol for the TestSlot.Ideally should always be webdriver, but can also be
   * selenium1 protocol for backward compatibility purposes.
   *
   * @return the protocol for this TestSlot
   */
  public SeleniumProtocol getProtocol() {
    return protocol;
  }

  /**
   * the path the server is using to handle the request. Typically /wd/hub for a webdriver based
   * protocol and /selenium-server/driver/ for a selenium1 based protocol
   *
   * @return the path the server is using for the requests of this slot.
   */
  public String getPath() {
    return path;
  }

  /**
   * @param desiredCapabilities capabilities for the new session
   * @return true if the desired capabilities matches for the
   *         {@link RemoteProxy#getCapabilityHelper()}
   */
  boolean matches(Map<String, Object> desiredCapabilities) {
    return matcher.matches(capabilities, desiredCapabilities);
  }

  /**
   * get the test session currently executed on this test slot.
   *
   * @return the session. Null if the slot is not used at the moment.
   */
  public TestSession getSession() {
    return currentSession;
  }

  /**
   * Starts the release process for the TestSlot. Once the release process has started, the clients
   * can't access the test slot any more, but the slot can't be reserved for another test until
   * finishReleaseProcess is called.
   * <p>
   * That gives time to run exactly once the cleanup operation needed using @see
   * {@link TestSessionListener#afterSession(TestSession)}
   *
   * @return true if that's the first thread trying to release this test slot, false otherwise.
   * @see TestSlot#finishReleaseProcess()
   */
  boolean startReleaseProcess() {
    if (currentSession == null) {
      return false;
    }

    try {
      lock.lock();
      if (beingReleased) {
        return false;
      }
      beingReleased = true;
      return true;
    } finally {
      lock.unlock();
    }
  }

  /**
   * releasing all the resources. The slot can now be reused.
   */
  void finishReleaseProcess() {
    try {
      lock.lock();
      doFinishRelease();
    } finally {
      lock.unlock();
    }
  }

  public void doFinishRelease() {
    currentSession = null;
    beingReleased = false;
  }

  String getInternalKey() {
    return currentSession == null ? null : currentSession.getInternalKey();
  }

  boolean performAfterSessionEvent() {
    // run the pre-release listener
    try {
      if (proxy instanceof TestSessionListener) {
        if (showWarning && proxy.getMaxNumberOfConcurrentTestSessions() != 1) {
          log.warning("WARNING : using a afterSession on a proxy that can support multiple tests is risky.");
          showWarning = false;
        }
        ((TestSessionListener) proxy).afterSession(currentSession);
      }
    } catch (Throwable t) {
      log.severe(String.format(
          "Error running afterSession for %s, the test slot is now dead: %s\n%s", currentSession,
          t.getMessage(), Throwables.getStackTraceAsString(t)));
      return false;
    }
    return true;
  }

  @Override
  public String toString() {
    return currentSession == null ? "no session" : currentSession.toString();
  }

  /**
   * get the full URL the underlying server is listening on for selenium / webdriver commands.
   *
   * @return the url
   */
  public URL getRemoteURL() {
    String u = getProxy().getRemoteHost() + getPath();
    try {
      return new URL(u);
    } catch (MalformedURLException e) {
      throw new GridException("Configuration error for the node." + u + " isn't a valid URL");
    }
  }

  /**
   * @return System.currentTimeMillis() of when the session was started, otherwise -1
   */
  public long getLastSessionStart() {
    return lastSessionStart;
  }
}
