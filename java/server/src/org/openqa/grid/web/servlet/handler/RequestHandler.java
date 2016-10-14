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

package org.openqa.grid.web.servlet.handler;

import org.openqa.grid.common.exception.ClientGoneException;
import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.ExternalSessionKey;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.SessionTerminationReason;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.exception.NewSessionException;
import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.listeners.TestSessionListener;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.IOException;
import java.net.SocketTimeoutException;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletResponse;


/**
 * Base stuff to handle the request coming from a remote.
 *
 * Threading notes; RequestHandlers are instantiated per-request, run on the servlet container
 * thread. The instance is also accessed by the matcher thread.
 */
@SuppressWarnings("JavaDoc")
public class RequestHandler implements Comparable<RequestHandler> {

  private final Registry registry;
  private final SeleniumBasedRequest request;
  private final HttpServletResponse response;

  private volatile TestSession session = null;


  private final CountDownLatch sessionAssigned = new CountDownLatch(1);

  private static final Logger log = Logger.getLogger(RequestHandler.class.getName());
  private final Thread waitingThread;




  public  RequestHandler(SeleniumBasedRequest request, HttpServletResponse response,
      Registry registry) {
    this.request = request;
    this.response = response;
    this.registry = registry;
    this.waitingThread = Thread.currentThread();
  }



  /**
   * Forward the new session request to the TestSession that has been assigned, and parse the
   * response to extract and return the external key assigned by the remote.
   *
   * @param session session
   * @throws NewSessionException in case anything wrong happens during the new session process.
   */
  public void forwardNewSessionRequestAndUpdateRegistry(TestSession session)
      throws NewSessionException {
    try {
      session.forward(getRequest(), getResponse(), true);
    } catch (IOException e) {
      //log.warning("Error forwarding the request " + e.getMessage());
      throw new NewSessionException("Error forwarding the request " + e.getMessage(), e);
    }
  }

  protected void forwardRequest(TestSession session, RequestHandler handler) throws IOException {
    session.forward(request, response, false);
  }

  /**
   * forwards the request to the remote, allocating / releasing the resources if necessary.
   */
  public void process() {
    switch (request.getRequestType()) {
      case START_SESSION:
        log.info("Got a request to create a new session: "
                 + new DesiredCapabilities(request.getDesiredCapabilities()));
        try {
          registry.addNewSessionRequest(this);
          waitForSessionBound();
          beforeSessionEvent();
          forwardNewSessionRequestAndUpdateRegistry(session);
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
            sessionKey = request.extractSession();
          } catch (RuntimeException ignore) {}
          throw new GridException("Session [" + sessionKey + "] not available - "
              + registry.getActiveSessions());
        }
        try {
          forwardRequest(session, this);
        } catch (ClientGoneException e) {
          log.log(Level.WARNING, "The client is gone for session " + session + ", terminating");
          registry.terminate(session, SessionTerminationReason.CLIENT_GONE);
        } catch (SocketTimeoutException e) {
          log.log(Level.SEVERE, "Socket timed out for session " + session + ", " + e.getMessage());
          registry.terminate(session, SessionTerminationReason.SO_TIMEOUT);
        } catch (Throwable t) {
          log.log(Level.SEVERE, "cannot forward the request " + t.getMessage(), t);
          registry.terminate(session, SessionTerminationReason.FORWARDING_TO_NODE_FAILED);
          throw new GridException("cannot forward the request " + t.getMessage(), t);
        }

        if (request.getRequestType() == RequestType.STOP_SESSION) {
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
   * @throws InterruptedException Interrupted exception
   * @throws TimeoutException if the request reaches the new session wait timeout before being
   *                          assigned.
   */
  public void waitForSessionBound() throws InterruptedException, TimeoutException {
    // Maintain compatibility with Grid 1.x, which had the ability to
    // specify how long to wait before canceling
    // a request.
    if (registry.getConfiguration().newSessionWaitTimeout > 0) {
      if (!sessionAssigned.await(registry.getConfiguration().newSessionWaitTimeout, TimeUnit.MILLISECONDS)) {
        throw new TimeoutException("Request timed out waiting for a node to become available.");
      }
    } else {
      // Wait until a proxy becomes available to handle the request.
      sessionAssigned.await();
    }
  }

  /**
   * @return the SeleniumBasedRequest this handler is processing.
   */
  public SeleniumBasedRequest getRequest() {
    return request;
  }

  /**
   * @return the HttpServletResponse the handler is writing to.
   */
  public HttpServletResponse getResponse() {
    return response;
  }

  public int compareTo(RequestHandler o) {
    if (registry.getConfiguration().prioritizer != null) {
      return registry.getConfiguration().prioritizer.compareTo(this.getRequest().getDesiredCapabilities(), o.getRequest()
          .getDesiredCapabilities());
    }
    return 0;
  }

  protected void setSession(TestSession session) {
    this.session = session;
  }

  public void bindSession(TestSession session) {
    this.session = session;
    sessionAssigned.countDown();
  }

  public TestSession getSession() {
    if (session == null) {
      ExternalSessionKey externalKey = request.extractSession();
      session = registry.getExistingSession(externalKey);
    }
    return session;
  }

  /**
   * @return the session from the server ( = opaque handle used by the server to determine where to
   * route session-specific commands from the JSON wire protocol ). will be null until the request
   * has been processed.
   */
  public ExternalSessionKey getServerSession() {
    if (session == null) {
      return null;
    }
    return session.getExternalKey();
  }

  public void stop() {
    waitingThread.interrupt();
  }

  @Override
  public String toString() {
    StringBuilder b = new StringBuilder();
    b.append("session:").append(session).append(", ");
    b.append("caps: ").append(request.getDesiredCapabilities());
    b.append("\n");
    return b.toString();
  }

  public String debug() {
    StringBuilder b = new StringBuilder();
    b.append("\nmethod: ").append(request.getMethod());
    b.append("\npathInfo: ").append(request.getPathInfo());
    b.append("\nuri: ").append(request.getRequestURI());
    b.append("\ncontent :").append(request.getBody());
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
