/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.selenium.server;


import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.BrowserLauncher;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.server.browserlaunchers.BrowserLauncherFactory;
import org.openqa.selenium.server.browserlaunchers.InvalidBrowserExecutableException;
import org.openqa.selenium.server.log.LoggingManager;
import org.openqa.selenium.server.log.PerSessionLogHandler;

import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Manages browser sessions, their creation, and their closure.
 * <p/>
 * Maintains a cache of unused and available browser sessions in case the server is reusing
 * sessions. Also manages the creation and finalization of all browser sessions.
 * 
 * @author jbevan@google.com (Jennifer Bevan)
 */
public class BrowserSessionFactory {

  private static final long DEFAULT_CLEANUP_INTERVAL = 300000; // 5 minutes.
  private static final long DEFAULT_MAX_IDLE_SESSION_TIME = 600000; // 10 minutes

  private static Logger log = Logger.getLogger(BrowserSessionFactory.class.getName());

  // cached, unused, already-launched browser sessions.
  protected final Set<BrowserSessionInfo> availableSessions =
      Collections.synchronizedSet(new HashSet<BrowserSessionInfo>());

  // active browser sessions.
  protected final Set<BrowserSessionInfo> activeSessions =
      Collections.synchronizedSet(new HashSet<BrowserSessionInfo>());

  private final BrowserLauncherFactory browserLauncherFactory;
  private final Timer cleanupTimer;
  private final long maxIdleSessionTime;
  private final boolean doCleanup;

  public BrowserSessionFactory(BrowserLauncherFactory blf) {
    this(blf, DEFAULT_CLEANUP_INTERVAL, DEFAULT_MAX_IDLE_SESSION_TIME, true);
  }

  /**
   * Constructor for testing purposes.
   * 
   * @param blf an injected BrowserLauncherFactory.
   * @param cleanupInterval the time between idle available session cleaning sweeps.
   * @param maxIdleSessionTime the max time in ms for an available session to be idle.
   * @param doCleanup whether or not the idle session cleanup thread should run.
   */
  protected BrowserSessionFactory(BrowserLauncherFactory blf,
      long cleanupInterval, long maxIdleSessionTime, boolean doCleanup) {
    browserLauncherFactory = blf;
    this.maxIdleSessionTime = maxIdleSessionTime;
    this.doCleanup = doCleanup;
    cleanupTimer = new Timer(/* daemon= */true);
    if (doCleanup) {
      cleanupTimer.schedule(new CleanupTask(), 0, cleanupInterval);
    }
  }

  /**
   * Gets a new browser session, using the SeleniumServer static fields to populate parameters.
   * 
   * @param browserString
   * @param startURL
   * @param extensionJs per-session user extension Javascript
   * @param configuration Remote Control configuration. Cannot be null.
   * @return the BrowserSessionInfo for the new browser session.
   * @throws RemoteCommandException
   */
  public BrowserSessionInfo getNewBrowserSession(String browserString, String startURL,
      String extensionJs, Capabilities browserConfigurations,
      RemoteControlConfiguration configuration)
      throws RemoteCommandException {
    return getNewBrowserSession(browserString, startURL, extensionJs,
        browserConfigurations,
        configuration.reuseBrowserSessions(),
        configuration.isEnsureCleanSession(), configuration);
  }

  /**
   * Gets a new browser session
   * 
   * @param browserString
   * @param startURL
   * @param extensionJs per-session user extension Javascript
   * @param configuration Remote Control configuration. Cannot be null.
   * @param useCached if a cached session should be used if one is available
   * @param ensureClean if a clean session (e.g. no previous cookies) is required.
   * @return the BrowserSessionInfo for the new browser session.
   * @throws RemoteCommandException
   */
  protected BrowserSessionInfo getNewBrowserSession(String browserString, String startURL,
      String extensionJs, Capabilities browserConfigurations,
      boolean useCached, boolean ensureClean, RemoteControlConfiguration configuration)
      throws RemoteCommandException {

    BrowserSessionInfo sessionInfo = null;
    browserString = validateBrowserString(browserString, configuration);

    if (configuration.getProxyInjectionModeArg()) {
      InjectionHelper.setBrowserSideLogEnabled(configuration.isBrowserSideLogEnabled());
      InjectionHelper.init();
    }

    if (useCached) {
      log.info("grabbing available session...");
      sessionInfo = grabAvailableSession(browserString, startURL);
    }

    // couldn't find one in the cache, or not reusing sessions.
    if (null == sessionInfo) {
      log.info("creating new remote session");
      sessionInfo = createNewRemoteSession(browserString, startURL, extensionJs,
          browserConfigurations, ensureClean, configuration);
    }

    assert null != sessionInfo;
    if (false/* ensureClean */) {
      // need to add this to the launcher API.
      // sessionInfo.launcher.hideCurrentSessionData();
    }
    return sessionInfo;
  }

  /**
   * Ends all browser sessions.
   * <p/>
   * Active and available but inactive sessions are ended.
   */
  protected void endAllBrowserSessions(RemoteControlConfiguration configuration) {
    boolean done = false;
    Set<BrowserSessionInfo> allSessions = new HashSet<BrowserSessionInfo>();
    while (!done) {
      // to avoid concurrent modification exceptions...
      synchronized (activeSessions) {
        for (BrowserSessionInfo sessionInfo : activeSessions) {
          allSessions.add(sessionInfo);
        }
      }
      synchronized (availableSessions) {
        for (BrowserSessionInfo sessionInfo : availableSessions) {
          allSessions.add(sessionInfo);
        }
      }
      for (BrowserSessionInfo sessionInfo : allSessions) {
        endBrowserSession(true, sessionInfo.sessionId, configuration);
      }
      done = (0 == activeSessions.size() && 0 == availableSessions.size());
      allSessions.clear();
      if (doCleanup) {
        cleanupTimer.cancel();
      }
    }
  }

  /**
   * Ends a browser session, using SeleniumServer static fields to populate parameters.
   * 
   * @param sessionId the id of the session to be ended
   * @param configuration Remote Control configuration. Cannot be null.
   */
  public void endBrowserSession(String sessionId, RemoteControlConfiguration configuration) {
    endBrowserSession(false, sessionId, configuration, configuration.isEnsureCleanSession());
  }

  /**
   * Ends a browser session, using SeleniumServer static fields to populate parameters.
   * 
   * @param sessionId the id of the session to be ended
   * @param configuration Remote Control configuration. Cannot be null.
   */
  public void endBrowserSession(boolean forceClose, String sessionId,
      RemoteControlConfiguration configuration) {
    endBrowserSession(forceClose, sessionId, configuration, configuration.isEnsureCleanSession());
  }

  /**
   * Ends a browser session.
   * 
   * @param sessionId the id of the session to be ended
   * @param configuration Remote Control configuration. Cannot be null.
   * @param ensureClean if clean sessions (e.g. no leftover cookies) are required.
   */
  protected void endBrowserSession(boolean forceClose, String sessionId,
      RemoteControlConfiguration configuration,
      boolean ensureClean) {
    BrowserSessionInfo sessionInfo = lookupInfoBySessionId(sessionId, activeSessions);
    if (null != sessionInfo) {
      activeSessions.remove(sessionInfo);
      try {
        if (forceClose || !configuration.reuseBrowserSessions()) {
          shutdownBrowserAndClearSessionData(sessionInfo);
        } else {
          if (null != sessionInfo.session) { // optional field
            sessionInfo.session.reset(sessionInfo.baseUrl);
          }
          // mark what time this session was ended
          sessionInfo.lastClosedAt = System.currentTimeMillis();
          availableSessions.add(sessionInfo);
        }
      } finally {
        LoggingManager.perSessionLogHandler().removeSessionLogs(new SessionId(sessionId));
        if (ensureClean) {
          // need to add this to the launcher API.
          // sessionInfo.launcher.restoreOriginalSessionData();
        }
      }
    } else {
      // look for it in the available sessions.
      sessionInfo = lookupInfoBySessionId(sessionId, availableSessions);
      if (null != sessionInfo && (forceClose || !configuration.reuseBrowserSessions())) {
        try {
          availableSessions.remove(sessionInfo);
          shutdownBrowserAndClearSessionData(sessionInfo);
        } finally {
          LoggingManager.perSessionLogHandler().removeSessionLogs(new SessionId(sessionId));
          if (ensureClean) {
            // sessionInfo.launcher.restoreOriginalSessionData();
          }
        }
      }
    }
  }

  /**
   * Shuts down this browser session's launcher and clears out its session data (if session is not
   * null).
   * 
   * @param sessionInfo the browser session to end.
   */
  protected void shutdownBrowserAndClearSessionData(BrowserSessionInfo sessionInfo) {
    try {
      sessionInfo.launcher.close(); // can throw RuntimeException
    } finally {
      if (null != sessionInfo.session) {
        FrameGroupCommandQueueSet.clearQueueSet(sessionInfo.sessionId);
      }
    }
  }

  /**
   * Rewrites the given browser string based on server settings.
   * 
   * @param inputString the input browser string
   * @return a possibly-modified browser string.
   * @throws IllegalArgumentException if inputString is null.
   */
  private String validateBrowserString(String inputString, RemoteControlConfiguration configuration)
      throws IllegalArgumentException {
    String browserString = inputString;
    if (configuration.getForcedBrowserMode() != null) {
      browserString = configuration.getForcedBrowserMode();
      log.info("overriding browser mode w/ forced browser mode setting: " + browserString);
    }
    if (configuration.getProxyInjectionModeArg() && browserString.equals("*iexplore")) {
      log.warning("running in proxy injection mode, but you used a *iexplore browser string; this is "
          +
          "almost surely inappropriate, so I'm changing it to *piiexplore...");
      browserString = "*piiexplore";
    } else if (configuration.getProxyInjectionModeArg() && (browserString.equals("*firefox")
        || browserString.equals("*firefox2") || browserString.equals("*firefox3"))) {
      log.warning("running in proxy injection mode, but you used a " + browserString +
          " browser string; this is " +
          "almost surely inappropriate, so I'm changing it to *pifirefox...");
      browserString = "*pifirefox";
    }

    if (null == browserString) {
      throw new IllegalArgumentException("browser string may not be null");
    }
    return browserString;
  }

  /**
   * Retrieves an available, unused session from the cache.
   * 
   * @param browserString the necessary browser for a suitable session
   * @param baseUrl the necessary baseUrl for a suitable session
   * @return the session info of the cached session, null if none found.
   */
  protected BrowserSessionInfo grabAvailableSession(String browserString,
      String baseUrl) {
    BrowserSessionInfo sessionInfo = null;
    synchronized (availableSessions) {
      sessionInfo = lookupInfoByBrowserAndUrl(browserString, baseUrl,
          availableSessions);
      if (null != sessionInfo) {
        availableSessions.remove(sessionInfo);
      }
    }
    if (null != sessionInfo) {
      activeSessions.add(sessionInfo);
    }
    return sessionInfo;
  }

  /**
   * Isolated dependency
   * 
   * @param sessionId
   * @param port
   * @param configuration
   * @return a new FrameGroupCommandQueueSet instance
   */
  protected FrameGroupCommandQueueSet makeQueueSet(String sessionId, int port,
      RemoteControlConfiguration configuration) {
    return FrameGroupCommandQueueSet.makeQueueSet(sessionId,
        configuration.getPortDriversShouldContact(), configuration);
  }

  /**
   * Isolated dependency
   * 
   * @param sessionId
   * @return an existing FrameGroupCommandQueueSet instance
   */
  protected FrameGroupCommandQueueSet getQueueSet(String sessionId) {
    return FrameGroupCommandQueueSet.getQueueSet(sessionId);
  }

  /**
   * Creates and tries to open a new session.
   * 
   * @param browserString
   * @param startURL
   * @param extensionJs
   * @param configuration Remote Control configuration. Cannot be null.
   * @param ensureClean if a clean session is required
   * @return the BrowserSessionInfo of the new session.
   * @throws RemoteCommandException if the browser failed to launch and request work in the required
   *         amount of time.
   */
  protected BrowserSessionInfo createNewRemoteSession(String browserString, String startURL,
      String extensionJs, Capabilities browserConfiguration, boolean ensureClean,
      RemoteControlConfiguration configuration)
      throws RemoteCommandException {

    final FrameGroupCommandQueueSet queueSet;
    final BrowserSessionInfo sessionInfo;
    final BrowserLauncher launcher;
    String sessionId;

    sessionId = UUID.randomUUID().toString().replace("-", "");
    if ("*webdriver".equals(browserString) && browserConfiguration != null) {
      Object id = browserConfiguration.getCapability("webdriver.remote.sessionid");
      if (id != null && id instanceof String) {
        sessionId = (String) id;
      }
    }

    queueSet = makeQueueSet(sessionId, configuration.getPortDriversShouldContact(), configuration);
    queueSet.setExtensionJs(extensionJs);

    try {
      launcher =
          browserLauncherFactory.getBrowserLauncher(browserString, sessionId, configuration,
              browserConfiguration);
    } catch (InvalidBrowserExecutableException e) {
      throw new RemoteCommandException(e.getMessage(), "");
    }

    sessionInfo = new BrowserSessionInfo(sessionId, browserString, startURL, launcher, queueSet);
    SessionIdTracker.setLastSessionId(sessionId);
    log.info("Allocated session " + sessionId + " for " + startURL + ", launching...");

    final PerSessionLogHandler perSessionLogHandler = LoggingManager.perSessionLogHandler();
    perSessionLogHandler.attachToCurrentThread(new SessionId(sessionId));
    try {
      launcher.launchRemoteSession(startURL);
      queueSet.waitForLoad(configuration.getTimeoutInSeconds() * 1000l);

      // TODO DGF log4j only
      // NDC.push("sessionId="+sessionId);
      FrameGroupCommandQueueSet queue = getQueueSet(sessionId);
      queue.doCommand("setContext", sessionId, "");

      activeSessions.add(sessionInfo);
      return sessionInfo;
    } catch (Exception e) {
      /*
       * At this point the session might not have been added to neither available nor active
       * sessions. This session is unlikely to be of any practical use so we need to make sure we
       * close the browser and clear all session data.
       */
      log.log(Level.SEVERE,
          "Failed to start new browser session, shutdown browser and clear all session data", e);
      shutdownBrowserAndClearSessionData(sessionInfo);
      throw new RemoteCommandException("Error while launching browser", "", e);
    } finally {
      perSessionLogHandler.detachFromCurrentThread();
    }
  }

  /**
   * Adds a browser session that was not created by this factory to the set of active sessions.
   * <p/>
   * Allows for creation of unmanaged sessions (i.e. no FrameGroupCommandQueueSet) for task such as
   * running the HTML tests (see HTMLLauncher.java). All fields other than session are required to
   * be non-null.
   * 
   * @param sessionInfo the session info to register.
   */
  protected boolean registerExternalSession(BrowserSessionInfo sessionInfo) {
    boolean result = false;
    if (BrowserSessionInfo.isValid(sessionInfo)) {
      activeSessions.add(sessionInfo);
      result = true;
    }
    return result;
  }

  /**
   * Removes a previously registered external browser session from the list of active sessions.
   * 
   * @param sessionInfo the session to remove.
   */
  protected void deregisterExternalSession(BrowserSessionInfo sessionInfo) {
    activeSessions.remove(sessionInfo);
  }

  /**
   * Looks up a session in the named set by session id
   * 
   * @param sessionId the session id to find
   * @param set the Set to inspect
   * @return the matching BrowserSessionInfo or null if not found.
   */
  protected BrowserSessionInfo lookupInfoBySessionId(String sessionId,
      Set<BrowserSessionInfo> set) {
    BrowserSessionInfo result = null;
    synchronized (set) {
      for (BrowserSessionInfo info : set) {
        if (info.sessionId.equals(sessionId)) {
          result = info;
          break;
        }
      }
    }
    return result;
  }

  /**
   * Looks up a session in the named set by browser string and base URL
   * 
   * @param browserString the browser string to match
   * @param baseUrl the base URL to match.
   * @param set the Set to inspect
   * @return the matching BrowserSessionInfo or null if not found.
   */
  protected BrowserSessionInfo lookupInfoByBrowserAndUrl(String browserString,
      String baseUrl, Set<BrowserSessionInfo> set) {
    BrowserSessionInfo result = null;
    synchronized (set) {
      for (BrowserSessionInfo info : set) {
        if (info.browserString.equals(browserString)
            && info.baseUrl.equals(baseUrl)) {
          result = info;
          break;
        }
      }
    }
    return result;
  }

  protected void removeIdleAvailableSessions() {
    long now = System.currentTimeMillis();
    synchronized (availableSessions) {
      Iterator<BrowserSessionInfo> iter = availableSessions.iterator();
      while (iter.hasNext()) {
        BrowserSessionInfo info = iter.next();
        if (now - info.lastClosedAt > maxIdleSessionTime) {
          iter.remove();
          shutdownBrowserAndClearSessionData(info);
        }
      }
    }
  }

  /**
   * for testing only
   */
  protected boolean hasActiveSession(String sessionId) {
    BrowserSessionInfo info = lookupInfoBySessionId(sessionId, activeSessions);
    return (null != info);
  }

  /**
   * for testing only
   */
  protected boolean hasAvailableSession(String sessionId) {
    BrowserSessionInfo info = lookupInfoBySessionId(sessionId, availableSessions);
    return (null != info);
  }

  /**
   * for testing only
   */
  protected void addToAvailableSessions(BrowserSessionInfo sessionInfo) {
    availableSessions.add(sessionInfo);
  }

  /**
   * Collection class to hold the objects associated with a browser session.
   * 
   * @author jbevan@google.com (Jennifer Bevan)
   */
  public static class BrowserSessionInfo {

    public BrowserSessionInfo(String sessionId, String browserString,
        String baseUrl, BrowserLauncher launcher,
        FrameGroupCommandQueueSet session) {
      this.sessionId = sessionId;
      this.browserString = browserString;
      this.baseUrl = baseUrl;
      this.launcher = launcher;
      this.session = session; // optional field; may be null.
      lastClosedAt = 0;
    }

    public final String sessionId;
    public final String browserString;
    public final String baseUrl;
    public final BrowserLauncher launcher;
    public final FrameGroupCommandQueueSet session;
    public long lastClosedAt;

    /**
     * Browser sessions require the session id, the browser, the base URL, and the launcher. They
     * don't actually require the session to be set up as a FrameGroupCommandQueueSet.
     * 
     * @param sessionInfo the sessionInfo to validate.
     * @return true if all fields excepting session are non-null.
     */
    protected static boolean isValid(BrowserSessionInfo sessionInfo) {
      boolean result = (null != sessionInfo.sessionId
          && null != sessionInfo.browserString
          && null != sessionInfo.baseUrl
          && null != sessionInfo.launcher);
      return result;
    }
  }

  /**
   * TimerTask that looks for unused sessions in the availableSessions collection.
   * 
   * @author jbevan@google.com (Jennifer Bevan)
   */
  protected class CleanupTask extends TimerTask {
    @Override
    public void run() {
      removeIdleAvailableSessions();
    }
  }

}
