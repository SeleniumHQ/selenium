/*
Copyright 2011 WebDriver committers
Copyright 2011 Software Freedom Conservancy

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
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.openqa.grid.internal.*;
import org.openqa.grid.internal.exception.NewSessionException;
import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.listeners.TestSessionListener;
import org.openqa.grid.common.exception.GridException;

/**
 * Base stuff to handle the request coming from a remote. Ideally, there should be only 1 concrete
 * class, but to support both legacy selenium1 and web driver, 2 classes are needed.
 * <p/>
 * {@link Selenium1RequestHandler} for the part specific to selenium1 protocol
 * {@link WebDriverRequestHandler} for the part specific to webdriver protocol
 * 
 * Threading notes; RequestHandlers are instantiated per-request, run on the servlet container
 * thread. The instance is also accessed by the matcher thread.
 */
@SuppressWarnings("JavaDoc")
public abstract class RequestHandler implements Comparable<RequestHandler> {

  private final Registry registry;
  private final HttpServletRequest request;
  private final HttpServletResponse response;

  private String body = null;
  private boolean bodyHasBeenRead = false;
  private volatile Map<String, Object> desiredCapabilities = null;
  private RequestType requestType = null;
  private volatile TestSession session = null;


  private final CountDownLatch sessionAssigned = new CountDownLatch(1);

  private static final Logger log = Logger.getLogger(RequestHandler.class.getName());
  private final Thread waitingThread;

  /**
   * Detect what kind of protocol ( selenium1 vs webdriver ) is used by the request and create the
   * associated handler.
   */
  public static RequestHandler createHandler(HttpServletRequest request,
      HttpServletResponse response, Registry registry) {
    if (isSeleniumProtocol(request)) {
      return new Selenium1RequestHandler(request, response, registry);
    } else {
      return new WebDriverRequestHandler(request, response, registry);
    }
  }

  protected RequestHandler(HttpServletRequest request, HttpServletResponse response,
      Registry registry) {
    this.request = request;
    this.response = response;
    this.registry = registry;
    this.waitingThread = Thread.currentThread();
  }

  /**
   * @return the type of the request.
   */
  public abstract RequestType extractRequestType();

  /**
   * Extract the session from the request. This only works for a request that has a session already
   * assigned. It shouldn't be called for a new session request.
   * 
   * @return the external session id sent by the remote. Null is the session cannot be found.
   */
  public abstract ExternalSessionKey extractSession();

  /**
   * Parse the request to extract the desiredCapabilities. For non web driver protocol ( selenium1 )
   * some mapping will be necessary
   * 
   * @return the desired capabilities requested by the client.
   */
  public abstract Map<String, Object> extractDesiredCapability();

  /**
   * Forward the new session request to the TestSession that has been assigned, and parse the
   * response to extract and return the external key assigned by the remote.
   * 
   * @return the external key sent by the remote.
   * @throws NewSessionException in case anything wrong happens during the new session process.
   */
  public abstract ExternalSessionKey forwardNewSessionRequest(TestSession session)
      throws NewSessionException;

  protected void forwardRequest(TestSession session, RequestHandler handler) throws IOException {
    if (bodyHasBeenRead) {
      session.forward(request, response, getRequestBody(), false);
    } else {
      session.forward(request, response);
    }
  }

  /**
   * forwards the request to the remote, allocating / releasing the resources if necessary.
   */
  public void process() {
    switch (getRequestType()) {
      case START_SESSION:
        try {
          registry.addNewSessionRequest(this);
          waitForSessionBound();
          beforeSessionEvent();
          forwardAndGetRemoteKey();
        } catch (Exception e) {
          cleanup();
          throw new GridException("Error forwarding the new session " + e.getMessage(), e);
        }
        break;
      case REGULAR:
      case STOP_SESSION:
        session = getSession();
        if (session == null) {
          ExternalSessionKey sessionKey = null;
          try {
            sessionKey = extractSession();
          } catch (RuntimeException ignore) {}
          throw new GridException("Session [" + sessionKey + "] not available - "
              + registry.getActiveSessions());
        }
        try {
          forwardRequest(session, this);
        } catch (Throwable t) {
          log.log(Level.SEVERE, "cannot forward the request " + t.getMessage(), t);
          registry.terminate(session, SessionTerminationReason.FORWARDINGFAILED);
          throw new GridException("cannot forward the request " + t.getMessage(), t);
        }

        if (getRequestType() == RequestType.STOP_SESSION) {
          registry.terminate(session, SessionTerminationReason.CLIENT_STOPPED_SESSION);
        }
        break;
      default:
        throw new RuntimeException("NI");

    }
  }



  private void cleanup() {
    registry.removeNewSessionRequest(this);
    if (session != null) {
      registry.terminate(session, SessionTerminationReason.CREATIONFAILED);
    }
  }

  /**
   * allocate a new TestSession for the test, forward the request and update the resource used.
   * 
   * @throws NewSessionException in case anything bad happens during the new session process.
   */
  private void forwardAndGetRemoteKey() throws NewSessionException {
    ExternalSessionKey externalKey = forwardNewSessionRequest(session);
    if (externalKey != null) {
      session.setExternalKey(externalKey);
    } else {
      throw new NewSessionException(
          "Error forwarding the new session request.external key should never be null");
    }
  }

  /**
   * calls the TestSessionListener is the proxy for that node has one specified.
   * 
   * @throws NewSessionException in case anything goes wrong with the listener.
   */
  private void beforeSessionEvent() throws NewSessionException {
    RemoteProxy p = session.getSlot().getProxy();
    if (p instanceof TestSessionListener) {
      try {
        ((TestSessionListener) p).beforeSession(session);
      } catch (Exception e) {
        log.severe("Error running the beforeSessionListener : " + e.getMessage());
        e.printStackTrace();
        throw new NewSessionException("The listener threw an exception ( listener bug )", e);
      }
    }
  }

  /**
   * wait for the registry to match the request with a TestSlot.
   * 
   * @throws InterruptedException
   * @throws TimeoutException if the request reaches the new session wait timeout before being
   *         assigned.
   */
  public void waitForSessionBound() throws InterruptedException, TimeoutException {
    // Maintain compatibility with Grid 1.x, which had the ability to
    // specify how long to wait before canceling
    // a request.
    if (registry.getNewSessionWaitTimeout() != -1) {
      if (!sessionAssigned.await(registry.getNewSessionWaitTimeout(), TimeUnit.MILLISECONDS)) {
        throw new TimeoutException("Request timed out waiting for a node to become available.");
      }
    } else {
      // Wait until a proxy becomes available to handle the request.
      sessionAssigned.await();
    }
  }

  /**
   * return true is the request is using the selenium1 protocol, false if that's a web driver
   * protocol.
   */
  private static boolean isSeleniumProtocol(HttpServletRequest request) {
    return "/selenium-server/driver".equals(request.getServletPath());
  }

  /**
   * reads the input stream of the request and returns its content.
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
   */
  public HttpServletRequest getRequest() {
    return request;
  }

  /**
   * the HttpServletResponse the handler is writing to.
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
    this.session = session;
    sessionAssigned.countDown();
  }

  protected TestSession getSession() {
    if (session == null) {
      ExternalSessionKey externalKey = extractSession();
      session = registry.getExistingSession(externalKey);
      if (session == null) {
        log.warning("Cannot find session " + externalKey + " in the registry.");
      }
    }
    return session;
  }

  /**
   * return the session from the server ( = opaque handle used by the server to determine where to
   * route session-specific commands fro mthe JSON wire protocol ). will be null until the request
   * has been processed.
   */
  public ExternalSessionKey getServerSession() {
    if (session == null) {
      return null;
    } else {
      return session.getExternalKey();
    }
  }

  public void stop() {
    waitingThread.interrupt();
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
    if (this == obj) {
      return true;
    }
    if (obj == null) {
      return false;
    }
    if (getClass() != obj.getClass()) {
      return false;
    }
    RequestHandler other = (RequestHandler) obj;
    if (session == null) {
      if (other.session != null) {
        return false;
      }
    } else if (!session.equals(other.session)) {
      return false;
    }
    return true;
  }

  public Registry getRegistry() {
    return registry;
  }
}
