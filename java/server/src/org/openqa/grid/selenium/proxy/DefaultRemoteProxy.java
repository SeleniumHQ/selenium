package org.openqa.grid.selenium.proxy;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.message.BasicHttpRequest;
import org.apache.http.util.EntityUtils;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.RemoteException;
import org.openqa.grid.common.exception.RemoteNotReachableException;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.listeners.CommandListener;
import org.openqa.grid.internal.listeners.SelfHealingProxy;
import org.openqa.grid.internal.listeners.TimeoutListener;
import org.openqa.grid.internal.utils.HtmlRenderer;
import org.openqa.grid.selenium.utils.WebProxyHtmlRenderer;

/**
 * default remote proxy for selenium, handling both selenium1 and webdriver requests.
 * 
 * @author freynaud
 * 
 */
public class DefaultRemoteProxy extends RemoteProxy
    implements
      TimeoutListener,
      SelfHealingProxy,
      CommandListener {
  
  private static final Logger log = Logger.getLogger(DefaultRemoteProxy.class.getName());


  private long pollingInterval = 10000;

  public DefaultRemoteProxy(RegistrationRequest request, Registry registry) {
    super(request, registry);

    try {
      Integer p = (Integer) request.getConfiguration().get(RegistrationRequest.NODE_POLLING);
      if (p != null) {
        pollingInterval = p.intValue();
      }
    } catch (NumberFormatException e) {
      // TODO freynaud log config error.

    }
  }

  public void beforeRelease(TestSession session) {
    // release the resources remotly.
    if (session.getExternalKey() == null) {
      throw new IllegalStateException(
          "cannot release the resources, they haven't been reserved properly.");
    }
    boolean ok = session.sendDeleteSessionRequest();
    if (!ok) {
      log.warning("Error releasing the resources on timeout for session " + session);
    }
  }

  public void afterCommand(TestSession session, HttpServletRequest request,
      HttpServletResponse response) {
    session.put("lastCommand", request.getMethod() + " - " + request.getPathInfo()
        + " executing ...");
  }

  public void beforeCommand(TestSession session, HttpServletRequest request,
      HttpServletResponse response) {
    session.put("lastCommand", request.getMethod() + " - " + request.getPathInfo() + " executed.");
  }

  private final HtmlRenderer renderer = new WebProxyHtmlRenderer(this);

  @Override
  public HtmlRenderer getHtmlRender() {
    return renderer;
  }

  /*
   * Self Healing part.Polls the remote, and marks it down if it cannot be reached twice in a row.
   */
  private volatile boolean down = false;
  private volatile boolean poll = true;
  // TODO freynaud
  private List<RemoteException> errors = new CopyOnWriteArrayList<RemoteException>();
  private Thread pollingThread = null;

  public boolean isAlive() {
    String url = getRemoteHost().toExternalForm() + "/wd/hub/status";
    BasicHttpRequest r = new BasicHttpRequest("GET", url);
    HttpClient client = getHttpClientFactory().getHttpClient();
    HttpHost host = new HttpHost(getRemoteHost().getHost(), getRemoteHost().getPort());
    HttpResponse response;
    try {
      response = client.execute(host, r);
      EntityUtils.consume(response.getEntity());
    } catch (ClientProtocolException e) {
      return false;
    } catch (IOException e) {
      return false;
    }
    int code = response.getStatusLine().getStatusCode();
    // webdriver returns a 200 on /status. selenium RC returns a 404
    return code == 200 || code == 404;
  }

  public void startPolling() {
    pollingThread = new Thread(new Runnable() { // Thread safety reviewed
          int nbFailedPoll = 0;

          public void run() {
            while (poll) {
              try {
                Thread.sleep(pollingInterval);
                if (!isAlive()) {
                  if (!down) {
                    nbFailedPoll++;
                    if (nbFailedPoll >= 2) {
                      addNewEvent(new RemoteNotReachableException("Cannot reach the remote."));
                    }
                  }
                } else {
                  down = false;
                  nbFailedPoll = 0;
                }
              } catch (InterruptedException e) {
                return;
              }
            }
          }
        });
    pollingThread.start();
  }

  public void stopPolling() {
    poll = false;
    pollingThread.interrupt();
  }

  public void addNewEvent(RemoteException event) {
    errors.add(event);
    onEvent(errors, event);

  }

  public void onEvent(List<RemoteException> events, RemoteException lastInserted) {
    for (RemoteException e : events) {
      if (e instanceof RemoteNotReachableException) {
        down = true;
        this.errors.clear();
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

  public boolean isDown() {
    return down;
  }
}
