/*
Copyright 2007-2011 WebDriver committers

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

package org.openqa.grid.web.servlet.handler;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.openqa.grid.internal.GridException;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.listeners.TestSessionListener;
import org.openqa.grid.web.Hub;

/**
 * Base stuff to handle the request coming from a remote. Ideally, there should
 * be only 1 concrete class, but to support both legacy selenium1 and web
 * driver, 2 classes are needed.
 * <p/>
 * {@link Selenium1RequestHandler} for the part specific to selenium1 protocol
 * {@link WebDriverRequestHandler} for the part specific to webdriver protocol
 */
public abstract class RequestHandler implements Comparable<RequestHandler> {
  private Registry registry;


  private HttpServletRequest request;
  private HttpServletResponse response;
  private String body = null;
  private boolean bodyHasBeenRead = false;
  private Map<String, Object> desiredCapabilities = null;
  private RequestType requestType = null;
  private TestSession session = null;
  private long created;

  private boolean showWarning = true;

  private final Lock lock = new ReentrantLock();
  private final Condition sessionHasBeenAssigned = lock.newCondition();

  private static final Logger log = Logger.getLogger(RequestHandler.class.getName());

  /**
   * Detect what kind of protocol ( selenium1 vs webdriver ) is used by the
   * request and create the associated handler.
   *
   * @param request
   * @param response
   * @param registry
   * @return
   */
  public static RequestHandler createHandler(HttpServletRequest request, HttpServletResponse response, Registry registry) {
    if (isSeleniumProtocol(request)) {
      return new Selenium1RequestHandler(request, response, registry);
    } else {
      return new WebDriverRequestHandler(request, response, registry);
    }
  }

  protected RequestHandler(HttpServletRequest request, HttpServletResponse response, Registry registry) {
    this.request = request;
    this.response = response;
    this.registry = registry;
    this.created = System.currentTimeMillis();
  }

  /**
   * @return the type of the request.
   */
  public abstract RequestType extractRequestType();

  /**
   * Extract the session from the request. This only works for a request that
   * has a session already assigned. It shouldn't be called for a new session
   * request.
   *
   * @return the external session id sent by the remote. Null is the session
   *         cannot be found.
   */
  public abstract String extractSession();

  /**
   * Parse the request to extract the desiredCapabilities. For non web driver
   * protocol ( selenium1 ) some mapping will be necessary
   *
   * @return the desired capabilities requested by the client.
   */
  public abstract Map<String, Object> extractDesiredCapability();

  /**
   * Forward the new session request to the TestSession that has been
   * assigned, and parse the response to extract and return the external key
   * assigned by the remote.
   *
   * @param session
   * @return the external key sent by the remote, null is something went
   *         wrong.
   * @throws IOException
   */
  public abstract String forwardNewSessionRequest(TestSession session);

  protected void forwardRequest(TestSession session, RequestHandler handler) throws IOException {
    if (bodyHasBeenRead) {
      session.forward(request, response, getRequestBody(), false);
    } else {
      session.forward(request, response);
    }
  }

  /**
   * forwards the request to the remote, allocating / releasing the resources
   * if necessary.
   */
  public void process() {
    switch (getRequestType()) {
      case START_SESSION:
        handleNewSession();
        break;
      case REGULAR:
      case STOP_SESSION:
        session = getSession();
        if (session == null) {
          throw new GridException("Session not available - " + registry.getActiveSessions());
        }
        try {
          forwardRequest(session, this);
        } catch (Throwable t) {
          log.log(Level.WARNING, "cannot forward the request " + t.getMessage(), t);
          session.terminate();
          throw new GridException("cannot forward the request " + t.getMessage(), t);
        }

        if (getRequestType() == RequestType.STOP_SESSION) {
          session.terminate();
        }
        break;
      default:
        throw new RuntimeException("NI");

    }
  }

  /**
   * allocate a new TestSession for the test, forward the request and update
   * the resource used.
   */
  private void handleNewSession() {
    // registry.addNewSessionRequest(this);

    try {
      lock.lock();
      // in the lock on purpose. Need to be stuck on the await first, so
      // that the signal of bindSession is done AFTER await is in waiting
      // mode.
      // if addNewSessionRequest(this) is out of the lock and everythung
      // goes fast, there is a chance that bindSession get the lock first,
      // signal, and only after that await will be reached, never
      // signalled
      registry.addNewSessionRequest(this);

      // Maintain compatibility with Grid 1.x, which had the ability to
      // specify how long to wait before canceling
      // a request.
      if (registry.getNewSessionWaitTimeout() != -1) {
        long startTime = System.currentTimeMillis();
        sessionHasBeenAssigned.await(registry.getNewSessionWaitTimeout(), TimeUnit.MILLISECONDS);
        long endTime = System.currentTimeMillis();

        if ((session == null) && ((endTime - startTime) >= registry.getNewSessionWaitTimeout())) {
          throw new RuntimeException("Request timed out waiting for a node to become available.");
        }
      } else {
        // Wait until a proxy becomes available to handle the request.
        sessionHasBeenAssigned.await();
      }
    } catch (InterruptedException e) {
      e.printStackTrace();
    } finally {
      lock.unlock();
    }

    if (session == null) {
      throw new RuntimeException("implementation error or you closed the grid while some tests were still queued on it.");
    }

    // if the session is on a proxy that implements BeforeSessionListener,
    // run the listener first.
    RemoteProxy p = session.getSlot().getProxy();
    if (p instanceof TestSessionListener) {
      if (showWarning && p.getMaxNumberOfConcurrentTestSessions() != 1) {
        showWarning = false;
        log.warning("WARNING : using a beforeSession on a proxy that can support multiple tests is risky.");
      }
      try {
        ((TestSessionListener) p).beforeSession(session);
      } catch (Throwable t) {
        log.severe("Error running the beforeSessionListener : " + t.getMessage());
        t.printStackTrace();
        session.terminate();
      }
    }

    String externalKey = forwardNewSessionRequest(session);
    if (externalKey == null) {
      session.terminate();
      // TODO (kmenard 04/10/11): We should indicate what the requested
      // session type is.
      throw new GridException("Error getting a new session from the remote." + registry.getAllProxies());
    } else {
      session.setExternalKey(externalKey);
    }
  }

  /**
   * return true is the request is using the selenium1 protocol, false if
   * that's a web driver protocol.
   *
   * @param request
   * @return
   */
  private static boolean isSeleniumProtocol(HttpServletRequest request) {
    return "/selenium-server/driver".equals(request.getServletPath());
  }

  /**
   * reads the input stream of the request and returns its content.
   *
   * @return
   */
  protected String getRequestBody() {
    if (!bodyHasBeenRead) {
      bodyHasBeenRead = true;
      StringBuilder sb = new StringBuilder();
      String line;
      try {
        InputStream is = request.getInputStream();
        if (is == null) {
          return null;
        }
        BufferedReader reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
        while ((line = reader.readLine()) != null) {
          // TODO freynaud bug ?
          sb.append(line);/* .append("\n"); */

        }
        is.close();
      } catch (UnsupportedEncodingException e) {
        throw new RuntimeException(e);
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
      body = sb.toString();
    }
    return body;
  }

  /**
   * the HttpServletRequest this hanlder is processing.
   *
   * @return
   */
  public HttpServletRequest getRequest() {
    return request;
  }

  /**
   * the HttpServletResponse the handler is writing to.
   *
   * @return
   */
  public HttpServletResponse getResponse() {
    return response;
  }

  public Map<String, Object> getDesiredCapabilities() {
    if (desiredCapabilities == null) {
      desiredCapabilities = extractDesiredCapability();
    }
    return desiredCapabilities;
  }

  protected void setDesiredCapabilities(Map<String, Object> desiredCapabilities) {
    this.desiredCapabilities = desiredCapabilities;
  }

  public int compareTo(RequestHandler o) {
    Prioritizer prioritizer = registry.getPrioritizer();
    if (prioritizer != null) {
      return prioritizer.compareTo(this.getDesiredCapabilities(), o.getDesiredCapabilities());
    } else {
      return 0;
    }
  }

  protected RequestType getRequestType() {
    if (requestType == null) {
      requestType = extractRequestType();
    }
    return requestType;
  }

  protected void setRequestType(RequestType requestType) {
    this.requestType = requestType;
  }

  protected void setSession(TestSession session) {
    this.session = session;
  }

  public void bindSession(TestSession session) {
    try {
      lock.lock();
      this.session = session;
      sessionHasBeenAssigned.signalAll();
    } finally {
      lock.unlock();
    }
  }

  protected TestSession getSession() {
    if (session == null) {
      String externalKey = extractSession();
      session = registry.getSession(externalKey);
    }
    return session;
  }

  /**
   * return the session from the server ( = opaque handle used by the server
   * to determine where to route session-specific commands fro mthe JSON wire
   * protocol ). will be null until the request has been processed.
   *
   * @return
   */
  public String getServerSession() {
    if (session == null) {
      return null;
    } else {
      return session.getExternalKey();
    }
  }

  @Override
  public String toString() {
    StringBuilder b = new StringBuilder();
    b.append("session :").append(session).append(" , ");
    b.append("cap : ").append(getDesiredCapabilities());
    b.append("\n");
    return b.toString();
  }

  public String debug() {
    StringBuilder b = new StringBuilder();
    b.append("\nmethod: ").append(request.getMethod());
    b.append("\npathInfo: ").append(request.getPathInfo());
    b.append("\nuri: ").append(request.getRequestURI());
    b.append("\ncontent :").append(getRequestBody());
    return b.toString();
  }

  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result + ((session == null) ? 0 : session.hashCode());
    return result;
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj)
      return true;
    if (obj == null)
      return false;
    if (getClass() != obj.getClass())
      return false;
    RequestHandler other = (RequestHandler) obj;
    if (session == null) {
      if (other.session != null)
        return false;
    } else if (!session.equals(other.session))
      return false;
    return true;
  }

  public long getCreated() {
    return created;
  }

  public Registry getRegistry() {
    return registry;
  }
}
