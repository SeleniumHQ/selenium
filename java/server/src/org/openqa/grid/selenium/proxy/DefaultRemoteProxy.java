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

package org.openqa.grid.selenium.proxy;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.RemoteException;
import org.openqa.grid.common.exception.RemoteNotReachableException;
import org.openqa.grid.common.exception.RemoteUnregisterException;
import org.openqa.grid.internal.BaseRemoteProxy;
import org.openqa.grid.internal.GridRegistry;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.listeners.CommandListener;
import org.openqa.grid.internal.listeners.SelfHealingProxy;
import org.openqa.grid.internal.listeners.TestSessionListener;
import org.openqa.grid.internal.listeners.TimeoutListener;
import org.openqa.grid.internal.utils.HtmlRenderer;
import org.openqa.grid.web.servlet.console.DefaultProxyHtmlRenderer;
import org.openqa.selenium.remote.server.jmx.JMXHelper;
import org.openqa.selenium.remote.server.jmx.ManagedAttribute;
import org.openqa.selenium.remote.server.jmx.ManagedService;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Default remote proxy for selenium, handling both selenium1 and webdriver requests.
 */
@ManagedService(description = "Selenium Grid Hub TestSlot")
public class DefaultRemoteProxy extends BaseRemoteProxy
    implements
      TimeoutListener,
      SelfHealingProxy,
      CommandListener,
      TestSessionListener {

  private static final Logger LOG = Logger.getLogger(DefaultRemoteProxy.class.getName());

  public static final int DEFAULT_POLLING_INTERVAL = 10000;
  public static final int DEFAULT_UNREGISTER_DELAY = 60000;
  public static final int DEFAULT_DOWN_POLLING_LIMIT = 2;

  private volatile int pollingInterval = DEFAULT_POLLING_INTERVAL;
  private volatile int unregisterDelay = DEFAULT_UNREGISTER_DELAY;
  private volatile int downPollingLimit = DEFAULT_DOWN_POLLING_LIMIT;

  public DefaultRemoteProxy(RegistrationRequest request, GridRegistry registry) {
    super(request, registry);

    pollingInterval = config.nodePolling != null ? config.nodePolling : DEFAULT_POLLING_INTERVAL;
    unregisterDelay = config.unregisterIfStillDownAfter != null ? config.unregisterIfStillDownAfter : DEFAULT_UNREGISTER_DELAY;
    downPollingLimit = config.downPollingLimit != null ? config.downPollingLimit : DEFAULT_DOWN_POLLING_LIMIT;

    // Only attempt to register the remote proxy as a JMX bean if it's managed.
    if (this.getClass().getAnnotation(ManagedService.class) != null) {
      JMXHelper helper = new JMXHelper();
      helper.unregister(this.getObjectName());
      helper.register(this);
    }
  }

  public void beforeRelease(TestSession session) {
    // release the resources remotely if the remote started a browser.
    if (session.getExternalKey() == null) {
      return;
    }
    boolean ok = session.sendDeleteSessionRequest();
    if (!ok) {
      LOG.warning("Error releasing the resources on timeout for session " + session);
    }
  }


  public void afterCommand(TestSession session, HttpServletRequest request, HttpServletResponse response) {
    session.put("lastCommand", request.getMethod() + " - " + request.getPathInfo() + " executed.");
  }


  public void beforeCommand(TestSession session, HttpServletRequest request, HttpServletResponse response) {
    session.put("lastCommand", request.getMethod() + " - " + request.getPathInfo() + " executing ...");
  }

  private final HtmlRenderer renderer = new DefaultProxyHtmlRenderer(this);

  @Override
  public HtmlRenderer getHtmlRender() {
    return renderer;
  }

  /*
   * Self Healing part. Polls the remote, and marks it down if it cannot be reached twice in a row.
   */
  private volatile boolean down = false;
  private volatile boolean poll = true;

  private final List<RemoteException> errors = Collections.synchronizedList(new ArrayList<>());
  private Thread pollingThread = null;

  @ManagedAttribute
  public boolean isAlive() {
    try {
      getProxyStatus();
      return true;
    } catch (Exception e) {
      LOG.fine("Failed to check status of node: " + e.getMessage());
      return false;
    }
  }

  public void startPolling() {
    pollingThread = new Thread(new Runnable() { // Thread safety reviewed
          int failedPollingTries = 0;
          long downSince = 0;

          public void run() {
            while (poll) {
              try {
                Thread.sleep(pollingInterval);
                if (!isAlive()) {
                  if (!down) {
                    failedPollingTries++;
                    if (failedPollingTries >= downPollingLimit) {
                      downSince = System.currentTimeMillis();
                      addNewEvent(new RemoteNotReachableException(String.format(
                        "Marking the node %s as down: cannot reach the node for %s tries",
                        DefaultRemoteProxy.this, failedPollingTries)));
                    }
                  } else {
                    long downFor = System.currentTimeMillis() - downSince;
                    if (downFor > unregisterDelay) {
                      addNewEvent(new RemoteUnregisterException(String.format(
                        "Unregistering the node %s because it's been down for %s milliseconds",
                        DefaultRemoteProxy.this, downFor)));
                    }
                  }
                } else {
                  down = false;
                  failedPollingTries = 0;
                  downSince = 0;
                }
              } catch (InterruptedException e) {
                return;
              }
            }
          }
        }, "RemoteProxy failure poller thread for " + getId());
    pollingThread.start();
  }

  public void stopPolling() {
    poll = false;
    pollingThread.interrupt();
  }

  public void addNewEvent(RemoteException event) {
    synchronized (errors) {
      errors.add(event);
      onEvent(new ArrayList<>(errors), event);
    }
  }

  public void onEvent(List<RemoteException> events, RemoteException lastInserted) {
    for (RemoteException e : events) {
      if (e instanceof RemoteNotReachableException) {
        LOG.info(e.getMessage());
        down = true;
        // We are already in a synchronized block, so do not need to synchronize again
        this.errors.clear();
      }
      if (e instanceof RemoteUnregisterException) {
        LOG.info(e.getMessage());
        GridRegistry registry = this.getRegistry();
        registry.removeIfPresent(this);
      }
    }
  }

  /**
   * overwrites the session allocation to discard the proxy that are down.
   */
  @Override
  public TestSession getNewSession(Map<String, Object> requestedCapability) {
    if (down) {
      return null;
    }
    return super.getNewSession(requestedCapability);
  }

  @ManagedAttribute
  public boolean isDown() {
    return down;
  }

  /**
   * The client shouldn't have to care where firefox is installed as long as the correct version is
   * launched, however with webdriver the binary location is specified in the desiredCapability,
   * making it the responsibility of the person running the test.
   *
   * With this implementation of beforeSession, that problem disappears . If the webdriver slot is
   * registered with a firefox using a custom binary location, the hub will handle it.
   *
   * <p>
   * For instance if a node registers:
   * {"browserName":"firefox","version":"7.0","firefox_binary":"/home/ff7"}
   *
   * and later on a client requests {"browserName":"firefox","version":"7.0"} , the hub will
   * automatically append the correct binary path to the desiredCapability before it's forwarded to
   * the server. That way the version / install location mapping is done only once at the node
   * level.
   */
  public void beforeSession(TestSession session) {
    // Nothing to do by default
  }

  public void afterSession(TestSession session) {
    // nothing to do here in this default implementation
  }

  @Override
  public void teardown() {
    super.teardown();
    stopPolling();
  }

  public ObjectName getObjectName() {
    try {
      return new ObjectName(
          String.format("org.seleniumhq.grid:type=RemoteProxy,node=\"%s\"", getRemoteHost()));
    } catch (MalformedObjectNameException e) {
      e.printStackTrace();
      return null;
    }
  }

}
