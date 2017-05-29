package org.openqa.grid.internal;

import java.util.List;
import java.util.Set;

import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.web.HubInterface;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.internal.HttpClientFactory;

public interface HubRegistryInterface {

  public static final String KEY = HubRegistryInterface.class.getName();

  public abstract GridHubConfiguration getConfiguration();

  /**
   * How long a session can remain in the newSession queue before being evicted.
   *
   * @return the new session wait timeout
   */
  public abstract int getNewSessionWaitTimeout();

  public abstract void setNewSessionWaitTimeout(int newSessionWaitTimeout);

  /**
   * Ends this test session for the hub, releasing the resources in the hub /
   * registry. It does not release anything on the remote. The resources are
   * released in a separate thread, so the call returns immediately. It allows
   * release with long duration not to block the test while the hub is releasing
   * the resource.
   *
   * @param session
   *          The session to terminate
   * @param reason
   *          the reason for termination
   */
  public abstract void terminate(TestSession session,
      SessionTerminationReason reason);

  public abstract void removeIfPresent(RemoteProxy proxy);

  /**
   * Releases the test slot, WITHOUT running any listener.
   */
  public abstract void forceRelease(TestSlot testSlot,
      SessionTerminationReason reason);

  public abstract void stop();

  public abstract HubInterface getHub();

  public abstract void setHub(HubInterface hub);

  public abstract void addNewSessionRequest(RequestHandler handler);

  /**
   * Add a proxy to the list of proxy available for the grid to managed and link
   * the proxy to the registry.
   *
   * @param proxy
   *          The proxy to add
   */
  public abstract void add(RemoteProxy proxy);

  /**
   * If throwOnCapabilityNotPresent is set to true, the hub will reject test
   * request for a capability that is not on the grid. No exception will be
   * thrown if the capability is present but busy.
   * <p/>
   * If set to false, the test will be queued hoping a new proxy will register
   * later offering that capability.
   *
   * @param throwOnCapabilityNotPresent
   *          true to throw if capability not present
   */
  public abstract void setThrowOnCapabilityNotPresent(
      boolean throwOnCapabilityNotPresent);

  public abstract ProxySet getAllProxies();

  public abstract List<RemoteProxy> getUsedProxies();

  /**
   * gets the test session associated to this external key. The external key is
   * the session used by webdriver.
   *
   * @param externalKey
   *          the external session key
   * @return null if the hub doesn't have a node associated to the provided
   *         externalKey
   */
  public abstract TestSession getSession(ExternalSessionKey externalKey);

  /**
   * gets the test existing session associated to this external key. The
   * external key is the session used by webdriver.
   *
   * This method will log complaints and reasons if the key cannot be found
   *
   * @param externalKey
   *          the external session key
   * @return null if the hub doesn't have a node associated to the provided
   *         externalKey
   */
  public abstract TestSession getExistingSession(ExternalSessionKey externalKey);

  /*
   * May race.
   */
  public abstract int getNewSessionRequestCount();

  public abstract void clearNewSessionRequests();

  public abstract boolean removeNewSessionRequest(RequestHandler request);

  public abstract Iterable<DesiredCapabilities> getDesiredCapabilities();

  public abstract Set<TestSession> getActiveSessions();

  public abstract void setPrioritizer(Prioritizer prioritizer);

  public abstract Prioritizer getPrioritizer();

  public abstract RemoteProxy getProxyById(String id);

  public abstract CapabilityMatcher getCapabilityMatcher();

  public abstract HttpClientFactory getHttpClientFactory();

}