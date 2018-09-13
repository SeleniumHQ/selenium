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

import static org.openqa.grid.common.RegistrationRequest.MAX_INSTANCES;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.SeleniumProtocol;
import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.listeners.TimeoutListener;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.grid.internal.utils.DefaultCapabilityMatcher;
import org.openqa.grid.internal.utils.DefaultHtmlRenderer;
import org.openqa.grid.internal.utils.HtmlRenderer;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.server.jmx.ManagedAttribute;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.InvalidParameterException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.logging.Level;
import java.util.logging.Logger;

public class BaseRemoteProxy implements RemoteProxy {
  private final RegistrationRequest request;

  private static final Logger log = Logger.getLogger(BaseRemoteProxy.class.getName());

  // the host the remote listen on.The final URL will be proxy.host + slot.path
  protected volatile URL remoteHost;

  protected final GridNodeConfiguration config;

  // list of the type of test the remote can run.
  private final List<TestSlot> testSlots;

  private final GridRegistry registry;

  private CapabilityMatcher capabilityMatcher;

  private final String id;

  private volatile boolean stop = false;
  private CleanUpThread cleanUpThread;

  public List<TestSlot> getTestSlots() {
    return testSlots;
  }

  public <T extends GridRegistry> T getRegistry() {
    return (T) registry;
  }

  public CapabilityMatcher getCapabilityHelper() {
    return capabilityMatcher;
  }


  /**
   * Create the proxy from the info sent by the remote. <p> If maxSession is not specified, default
   * to 1 = max number of tests running at a given time will be 1. <p> For each capability,
   * maxInstances is defaulted to 1 if not specified = max number of test of each capability running
   * at a time will be 1. maxInstances for firefox can be &gt; 1. IE won't support it.
   *
   * @param request  The request
   * @param registry The registry to use
   */
  public BaseRemoteProxy(RegistrationRequest request, GridRegistry registry) {
    this.request = request;
    this.registry = registry;
    this.config = new GridNodeConfiguration();
    this.capabilityMatcher = new DefaultCapabilityMatcher();
    // the registry is the 'hub' configuration, which is used as a seed for this proxy configuration
    if (registry.getHub() != null) {
      this.config.merge(registry.getHub().getConfiguration());
      this.capabilityMatcher = registry.getHub().getConfiguration().capabilityMatcher;
    }
    // the proxy values must override any that the hub specify where an overlap occurs.
    // merging last causes the values to be overridden.
    this.config.merge(request.getConfiguration());
    // host and port are merge() protected values -- overrule this behavior
    this.config.host = request.getConfiguration().host;
    this.config.port = request.getConfiguration().port;

    String url = config.getRemoteHost();
    String id = config.id;

    if (url == null && id == null) {
      throw new GridException(
          "The registration request needs to specify either the remote host, or a valid id.");
    }

    if (url != null) {
      try {
        this.remoteHost = new URL(url);
      } catch (MalformedURLException e) {
        // should only happen when a bad config is sent.
        throw new GridException("Not a correct url to register a remote : " + url);
      }
    }

    // if id was provided in the request, use that
    if (id != null) {
      this.id = id;
    } else {
      // otherwise assign the remote host as id.
      this.id = remoteHost.toExternalForm();
    }

    List<MutableCapabilities> capabilities = request.getConfiguration().capabilities;

    List<TestSlot> slots = new ArrayList<>();
    for (MutableCapabilities capability : capabilities) {
      Object maxInstance = capability.getCapability(MAX_INSTANCES);

      SeleniumProtocol protocol = SeleniumProtocol.fromCapabilitiesMap(capability.asMap());

      if (maxInstance == null) {
        log.warning("Max instance not specified. Using default = 1 instance");
        maxInstance = "1";
      }

      int value = Integer.parseInt(maxInstance.toString());
      for (int i = 0; i < value; i++) {
        Map<String, Object> c = new HashMap<>();
        for (String k : capability.asMap().keySet()) {
          c.put(k, capability.getCapability(k));
        }
        slots.add(createTestSlot(protocol, c));
      }
    }

    this.testSlots = Collections.unmodifiableList(slots);
  }

  public void setupTimeoutListener() {
    cleanUpThread = null;
    if (this instanceof TimeoutListener) {
      if (config.cleanUpCycle > 0 && config.timeout > 0) {
        log.fine("starting cleanup thread");
        cleanUpThread = new CleanUpThread(this);
        new Thread(cleanUpThread, "RemoteProxy CleanUpThread for " + getId())
            .start(); // Thread safety reviewed (hopefully ;)
      }
    }
  }

  public String getId() {
    if (id == null) {
      throw new RuntimeException("Bug. Trying to use the id on a proxy but it hasn't been set.");
    }

    return id;
  }

  public void teardown() {
    stop = true;
  }

  /**
   * Internal use only
   */
  public void forceSlotCleanerRun() {
    cleanUpThread.cleanUpAllSlots();
  }

  class CleanUpThread implements Runnable {

    private BaseRemoteProxy proxy;

    public CleanUpThread(BaseRemoteProxy proxy) {
      this.proxy = proxy;
    }

    public void run() {

      log.fine("cleanup thread starting...");
      while (!proxy.stop) {
        try {
          Thread.sleep(config.cleanUpCycle);
        } catch (InterruptedException e) {
          log.severe("clean up thread died. " + e.getMessage());
        }

        cleanUpAllSlots();
      }
    }

    void cleanUpAllSlots() {
      for (TestSlot slot : getTestSlots()) {
        try {
          cleanUpSlot(slot);
        } catch (Throwable t) {
          log.warning("Error executing the timeout when cleaning up slot " + slot
              + t.getMessage());
        }
      }
    }

    private void cleanUpSlot(TestSlot slot) {
      TestSession session = slot.getSession();
      if (session != null) {
        long inactivity = session.getInactivityTime();
        boolean hasTimedOut = inactivity > getTimeOut();
        if (hasTimedOut) {
          if (!session.isForwardingRequest()) {
            log.logp(Level.WARNING, "SessionCleanup", null,
                "session " + session
                    + " has TIMED OUT due to client inactivity and will be released.");
            try {
              ((TimeoutListener) proxy).beforeRelease(session);
            } catch(IllegalStateException ignore) {
              log.log(Level.WARNING, ignore.getMessage());
            }
            registry.terminate(session, SessionTerminationReason.TIMEOUT);
          }
        }

        if (session.isOrphaned()) {
          log.logp(Level.WARNING, "SessionCleanup", null,
              "session " + session + " has been ORPHANED and will be released");
          try {
            ((TimeoutListener) proxy).beforeRelease(session);
          } catch(IllegalStateException ignore) {
            log.log(Level.WARNING, ignore.getMessage());
          }
          registry.terminate(session, SessionTerminationReason.ORPHAN);
        }
      }
    }
  }

  public GridNodeConfiguration getConfig() {
    return config;
  }

  public RegistrationRequest getOriginalRegistrationRequest() {
    return request;
  }

  @ManagedAttribute
  public int getMaxNumberOfConcurrentTestSessions() {
    return config.maxSession;
  }

  @ManagedAttribute
  public URL getRemoteHost() {
    return remoteHost;
  }

  public TestSession getNewSession(Map<String, Object> requestedCapability) {
    log.fine("Trying to create a new session on node " + this);

    if (!hasCapability(requestedCapability)) {
      log.fine("Node " + this + " has no matching capability");
      return null;
    }
    // any slot left at all?
    if (getTotalUsed() >= config.maxSession) {
      log.fine("Node " + this + " has no free slots");
      return null;
    }
    // any slot left for the given app ?
    for (TestSlot testslot : getTestSlots()) {
      TestSession session = testslot.getNewSession(requestedCapability);

      if (session != null) {
        return session;
      }
    }
    return null;
  }

  @ManagedAttribute
  public int getTotalUsed() {
    int totalUsed = 0;

    for (TestSlot slot : getTestSlots()) {
      if (slot.getSession() != null) {
        totalUsed++;
      }
    }

    return totalUsed;
  }

  @ManagedAttribute
  public int getTotal() {
    return getTestSlots().size();
  }

  public boolean hasCapability(Map<String, Object> requestedCapability) {
    for (TestSlot slot : getTestSlots()) {
      if (slot.matches(requestedCapability)) {
        return true;
      }
    }

    return false;
  }

  @ManagedAttribute
  public boolean isBusy() {
    return getTotalUsed() != 0;
  }

  /**
   * Takes a registration request and return the RemoteProxy associated to it. It can be any class
   * extending RemoteProxy.
   *
   * @param request  The request
   * @param registry The registry to use
   * @param <T> RemoteProxy subclass
   * @return a new instance built from the request.
   */
  @SuppressWarnings("unchecked")
  public static <T extends RemoteProxy> T getNewInstance(
      RegistrationRequest request, GridRegistry registry) {
    try {
      String proxyClass = request.getConfiguration().proxy;
      if (proxyClass == null) {
        log.fine("No proxy class. Using default");
        proxyClass = BaseRemoteProxy.class.getCanonicalName();
      }
      Class<?> clazz = Class.forName(proxyClass);
      log.fine("Using class " + clazz.getName());
      Object[] args = new Object[]{request, registry};
      Class<?>[] argsClass = new Class[]{RegistrationRequest.class, GridRegistry.class};
      Constructor<?> c = clazz.getConstructor(argsClass);
      Object proxy = c.newInstance(args);
      if (proxy instanceof RemoteProxy) {
        ((RemoteProxy) proxy).setupTimeoutListener();
        return (T) proxy;
      }
      throw new InvalidParameterException("Error: " + proxy.getClass() + " isn't a remote proxy");
    } catch (InvocationTargetException e) {
      throw new InvalidParameterException("Error: " + e.getTargetException().getMessage());
    } catch (Exception e) {
      throw new InvalidParameterException("Error: " + e.getMessage());
    }
  }

  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result + ((id == null) ? 0 : id.hashCode());
    return result;
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj) {
      return true;
    }

    if (obj == null) {
      return false;
    }

    if (getClass() != obj.getClass()) {
      return false;
    }

    RemoteProxy other = (RemoteProxy) obj;
    if (getId() == null) {
      if (other.getId() != null) {
        return false;
      }
    } else if (!getId().equals(other.getId())) {
      return false;
    }

    return true;
  }

  // less busy to more busy.
  public int compareTo(RemoteProxy o) {
    if (o == null) {
      return -1;
    }
    return (int)(getResourceUsageInPercent() - o.getResourceUsageInPercent());
  }

  @Override
  public String toString() {
    return getRemoteHost() != null ? getRemoteHost().toString() : "<detached>";
  }

  private final HtmlRenderer renderer = new DefaultHtmlRenderer(this);

  public HtmlRenderer getHtmlRender() {
    return renderer;
  }

  public int getTimeOut() {
    return config.timeout * 1000;
  }

  /**
   * @return the {@link HttpClient.Factory} to use.
   * @deprecated use {@link BaseRemoteProxy#getHttpClient(URL, int, int)}
   */
  public HttpClient getHttpClient(URL url) {
    return getRegistry().getHttpClient(url);
  }

  public HttpClient getHttpClient(URL url, int connectionTimeout, int readTimeout) {
    return getRegistry().getHttpClient(url, connectionTimeout, readTimeout);
  }

  public Map<String, Object> getProxyStatus() {
    String url = getRemoteHost().toExternalForm() + "/wd/hub/status";

    HttpRequest r = new HttpRequest(GET, url);
    HttpClient client = getHttpClient(getRemoteHost(), config.nodeStatusCheckTimeout,
                                      config.nodeStatusCheckTimeout);
    HttpResponse response;
    String existingName = Thread.currentThread().getName();
    try {
      Thread.currentThread().setName("Probing status of " + url);
      response = client.execute(r);
      int code = response.getStatus();

      if (code == 200) {
        Map<String, Object> status = new TreeMap<>();
        try {
          status = new Json().toType(response.getContentString(), MAP_TYPE);
        } catch (Exception e) {
          // ignored due it's not required from node to return anything. Just 200 code is enough.
        }
        return status;
      } else if (code == 404) { // selenium RC case
        return new TreeMap<>();
      } else {
        throw new GridException("server response code : " + code);
      }

    } catch (Exception e) {
      throw new GridException(e.getMessage(), e);
    } finally {
      Thread.currentThread().setName(existingName);
    }
  }

  @ManagedAttribute
  public float getResourceUsageInPercent() {
    return 100 * (float)getTotalUsed() / (float)getMaxNumberOfConcurrentTestSessions();
  }

  @ManagedAttribute
  public long getLastSessionStart() {
    long last = -1;
    for (TestSlot slot : getTestSlots()) {
      last = Math.max(last, slot.getLastSessionStart());
    }
    return last;
  }
}
