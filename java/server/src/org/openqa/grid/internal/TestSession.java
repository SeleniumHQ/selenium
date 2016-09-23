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

import com.google.common.base.Charsets;
import com.google.common.io.ByteStreams;
import com.google.common.net.MediaType;

import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.entity.InputStreamEntity;
import org.apache.http.message.BasicHttpEntityEnclosingRequest;
import org.apache.http.message.BasicHttpRequest;
import org.apache.http.util.EntityUtils;
import org.openqa.grid.common.exception.ClientGoneException;
import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.listeners.CommandListener;
import org.openqa.grid.web.Hub;
import org.openqa.grid.web.servlet.handler.LegacySeleniumRequest;
import org.openqa.grid.web.servlet.handler.RequestType;
import org.openqa.grid.web.servlet.handler.SeleniumBasedRequest;
import org.openqa.grid.web.servlet.handler.SeleniumBasedResponse;
import org.openqa.grid.web.servlet.handler.WebDriverRequest;
import org.openqa.selenium.io.IOUtils;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.DateFormat;
import java.util.Calendar;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Represent a running test for the hub/registry. A test session is created when a TestSlot becomes
 * available for a test. <p> The session is destroyed when the test ends ( ended by the client or
 * timed out)
 */
@SuppressWarnings("JavaDoc")
public class TestSession {

  private static final Logger log = Logger.getLogger(TestSession.class.getName());
  static final int MAX_IDLE_TIME_BEFORE_CONSIDERED_ORPHANED = 5000;

  private final String internalKey;
  private final TestSlot slot;
  private volatile ExternalSessionKey externalKey = null;
  private volatile long sessionCreatedAt;
  private volatile long lastActivity;
  private final Map<String, Object> requestedCapabilities;
  private Map<String, Object> objects = Collections.synchronizedMap(new HashMap<String, Object>());
  private volatile boolean ignoreTimeout = false;
  private final TimeSource timeSource;
  private volatile boolean forwardingRequest;
  private final int MAX_NETWORK_LATENCY = 1000;

  public String getInternalKey() {
    return internalKey;
  }

  /*
   * Creates a test session on the specified testSlot.
   */
  public TestSession(TestSlot slot, Map<String, Object> requestedCapabilities,
                     TimeSource timeSource) {
    internalKey = UUID.randomUUID().toString();
    this.slot = slot;
    this.requestedCapabilities = requestedCapabilities;
    this.timeSource = timeSource;
    lastActivity = this.timeSource.currentTimeInMillis();
  }

  /**
   * @return the capabilities the client requested. It will match the TestSlot capabilities, but is not
   * equals.
   */
  public Map<String, Object> getRequestedCapabilities() {
    return requestedCapabilities;
  }

  /**
   * Get the session key from the remote. It's up to the remote to guarantee the key is unique. If 2
   * remotes return the same session key, the tests will overwrite each other.
   *
   * @return the key that was provided by the remote when the POST /session command was sent.
   */
  public ExternalSessionKey getExternalKey() {
    return externalKey;
  }

  /**
   * associate this session to the session provided by the remote.
   * @param externalKey external session key
   */
  public void setExternalKey(ExternalSessionKey externalKey) {
    this.externalKey = externalKey;
    sessionCreatedAt = lastActivity;
  }

  /**
   * give the time in milliseconds since the last access to this test session, or 0 is ignore time
   * out has been set to true.
   *
   * @return time in millis
   * @see TestSession#setIgnoreTimeout(boolean)
   */
  public long getInactivityTime() {
    if (ignoreTimeout) {
      return 0;
    }
    return timeSource.currentTimeInMillis() - lastActivity;
  }

  public boolean isOrphaned() {
    final long elapsedSinceCreation = timeSource.currentTimeInMillis() - sessionCreatedAt;

    // The session needs to have been open for at least the time interval and we need to have not
    // seen any new commands during that time frame.
    return slot.getProtocol().isSelenium()
           && elapsedSinceCreation > MAX_IDLE_TIME_BEFORE_CONSIDERED_ORPHANED
           && sessionCreatedAt == lastActivity;
  }

  /**
   * @return the TestSlot this session is executed against.
   */
  public TestSlot getSlot() {
    return slot;
  }

  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result + ((internalKey == null) ? 0 : internalKey.hashCode());
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
    TestSession other = (TestSession) obj;
    return internalKey.equals(other.internalKey);
  }

  @Override
  public String toString() {
    return externalKey != null ? "ext. key " + externalKey : internalKey
                                                             + " (int. key, remote not contacted yet.)";
  }


  private HttpClient getClient() {
    Registry reg = slot.getProxy().getRegistry();
    long browserTimeout = TimeUnit.SECONDS.toMillis(reg.getConfiguration().browserTimeout);
    if (browserTimeout > 0) {
      final long selenium_server_cleanup_cycle = browserTimeout / 10;
      browserTimeout += (selenium_server_cleanup_cycle + MAX_NETWORK_LATENCY);
      browserTimeout *=2; // Lets not let this happen too often
    }
    return slot.getProxy().getHttpClientFactory().getGridHttpClient((int)browserTimeout, (int)browserTimeout);
  }

  /*
   * forwards the request to the node.
   */
  public String forward(SeleniumBasedRequest request, HttpServletResponse response,
                        boolean newSessionRequest)
      throws IOException {
    String res = null;

    String currentThreadName = Thread.currentThread().getName();
    setThreadDisplayName();
    forwardingRequest = true;

    try {
      if (slot.getProxy() instanceof CommandListener) {
        ((CommandListener) slot.getProxy()).beforeCommand(this, request, response);
      }

      lastActivity = timeSource.currentTimeInMillis();

      HttpRequest proxyRequest = prepareProxyRequest(request/*, config*/);

      HttpResponse proxyResponse = sendRequestToNode(proxyRequest);
      lastActivity = timeSource.currentTimeInMillis();
      HttpEntity responseBody = proxyResponse.getEntity();
      try {
        final int statusCode = proxyResponse.getStatusLine().getStatusCode();
        response.setStatus(statusCode);
        processResponseHeaders(request, response, slot.getRemoteURL(), proxyResponse);

        byte[] consumedNewWebDriverSessionBody = null;
        if (statusCode != HttpServletResponse.SC_INTERNAL_SERVER_ERROR &&
            statusCode != HttpServletResponse.SC_NOT_FOUND &&
            statusCode != HttpServletResponse.SC_BAD_REQUEST &&
            statusCode != HttpServletResponse.SC_UNAUTHORIZED) {
          consumedNewWebDriverSessionBody = updateHubIfNewWebDriverSession(request, proxyResponse);
        }
        if (newSessionRequest &&
            (statusCode == HttpServletResponse.SC_INTERNAL_SERVER_ERROR ||
            statusCode == HttpServletResponse.SC_BAD_REQUEST ||
            statusCode == HttpServletResponse.SC_UNAUTHORIZED)) {
          removeIncompleteNewSessionRequest();
        }
        if (statusCode == HttpServletResponse.SC_NOT_FOUND) {
          removeSessionBrowserTimeout();
        }

        byte[] contentBeingForwarded = null;
        if (responseBody != null) {
          InputStream in;
          if (consumedNewWebDriverSessionBody == null) {
            in = responseBody.getContent();
            if (request.getRequestType() == RequestType.START_SESSION && request instanceof LegacySeleniumRequest) {
              res = getResponseUtf8Content(in);

              updateHubNewSeleniumSession(res);

              in = new ByteArrayInputStream(res.getBytes("UTF-8"));
            }
          } else {
            in = new ByteArrayInputStream(consumedNewWebDriverSessionBody);
          }

          final byte[] bytes = drainInputStream(in);
          contentBeingForwarded = bytes;
        }

        if (slot.getProxy() instanceof CommandListener) {
          SeleniumBasedResponse wrappedResponse = new SeleniumBasedResponse(response);
          wrappedResponse.setForwardedContent(contentBeingForwarded);
          ((CommandListener) slot.getProxy()).afterCommand(this, request, wrappedResponse);
          contentBeingForwarded = wrappedResponse.getForwardedContentAsByteArray();
        }

        if (contentBeingForwarded != null) {
          writeRawBody(response, contentBeingForwarded);
        }
        response.flushBuffer();
      } finally {
        EntityUtils.consume(responseBody);
      }
      response.flushBuffer();

      return res;
    } finally {
      forwardingRequest = false;
      Thread.currentThread().setName(currentThreadName);
    }
  }

  private void setThreadDisplayName() {
    DateFormat dfmt = DateFormat.getTimeInstance();
    String name = "Forwarding " + this + " to " + slot.getRemoteURL() + " at " +
                  dfmt.format(Calendar.getInstance().getTime());
    Thread.currentThread().setName(name);
  }

  private void removeIncompleteNewSessionRequest() {
    RemoteProxy proxy = slot.getProxy();
    proxy.getRegistry().terminate(this, SessionTerminationReason.CREATIONFAILED);
  }

  private void removeSessionBrowserTimeout() {
    RemoteProxy proxy = slot.getProxy();
    proxy.getRegistry().terminate(this, SessionTerminationReason.BROWSER_TIMEOUT);
  }

  private void updateHubNewSeleniumSession(String content) {
    ExternalSessionKey key = ExternalSessionKey.fromResponseBody(content);
    setExternalKey(key);
  }

  private byte[] updateHubIfNewWebDriverSession(
      SeleniumBasedRequest request, HttpResponse proxyResponse) throws IOException {
    byte[] consumedData = null;
    if (request.getRequestType() == RequestType.START_SESSION
        && request instanceof WebDriverRequest) {
      Header h = proxyResponse.getFirstHeader("Location");
      if (h == null) {
        if (isSuccessJsonResponse(proxyResponse) && proxyResponse.getEntity() != null) {
          InputStream stream = proxyResponse.getEntity().getContent();
          consumedData = ByteStreams.toByteArray(stream);
          stream.close();

          String contentString = new String(consumedData, Charsets.UTF_8);
          ExternalSessionKey key = ExternalSessionKey.fromJsonResponseBody(contentString);
          if (key == null) {
            throw new GridException(
                "webdriver new session JSON response body did not contain a session ID");
          }
          setExternalKey(key);
          return consumedData;
        }
        throw new GridException(
            "new session request for webdriver should contain a location header "
            + "or an 'application/json;charset=UTF-8' response body with the session ID.");
      }
      ExternalSessionKey key = ExternalSessionKey.fromWebDriverRequest(h.getValue());
      setExternalKey(key);
    }
    return consumedData;
  }

  private static boolean isSuccessJsonResponse(HttpResponse response) {
    if (response.getStatusLine().getStatusCode() == HttpServletResponse.SC_OK) {
      for (Header header : response.getHeaders("Content-Type")) {
        MediaType type;
        try {
          type = MediaType.parse(header.getValue());
        } catch (IllegalArgumentException ignored) {
          continue;
        }

        if (MediaType.JSON_UTF_8.is(type)) {
          return true;
        }
      }
    }
    return false;
  }

  private HttpResponse sendRequestToNode(HttpRequest proxyRequest) throws ClientProtocolException,
                                                                          IOException {
    HttpClient client = getClient();
    URL remoteURL = slot.getRemoteURL();
    HttpHost host = new HttpHost(remoteURL.getHost(), remoteURL.getPort(), remoteURL.getProtocol());

    return client.execute(host, proxyRequest);
  }

  private HttpRequest prepareProxyRequest(HttpServletRequest request
/*, ForwardConfiguration config*/)
      throws IOException {
    URL remoteURL = slot.getRemoteURL();

    String pathSpec = request.getServletPath() + request.getContextPath();
    String path = request.getRequestURI();
    if (!path.startsWith(pathSpec)) {
      throw new IllegalStateException("Expected path " + path + " to start with pathSpec "
                                      + pathSpec);
    }
    String end = path.substring(pathSpec.length());
    String ok = remoteURL + end;
    if (request.getQueryString() != null) {
      ok += "?" + request.getQueryString();
    }
    String uri = new URL(remoteURL, ok).toExternalForm();

    InputStream body = null;
    if (request.getContentLength() > 0 || request.getHeader("Transfer-Encoding") != null) {
      body = request.getInputStream();
    }

    HttpRequest proxyRequest;

    if (body != null) {
      BasicHttpEntityEnclosingRequest r =
          new BasicHttpEntityEnclosingRequest(request.getMethod(), uri);
      r.setEntity(new InputStreamEntity(body, request.getContentLength()));
      proxyRequest = r;
    } else {
      proxyRequest = new BasicHttpRequest(request.getMethod(), uri);
    }

    for (Enumeration<?> e = request.getHeaderNames(); e.hasMoreElements(); ) {
      String headerName = (String) e.nextElement();

      if ("Content-Length".equalsIgnoreCase(headerName)) {
        continue; // already set
      }

      proxyRequest.setHeader(headerName, request.getHeader(headerName));
    }
    return proxyRequest;
  }

  private void writeRawBody(HttpServletResponse response, byte[] rawBody) throws IOException {
    OutputStream out = response.getOutputStream();
    try {
      // We need to set the Content-Length header before we write to the output stream. Usually
      // the
      // Content-Length header is already set because we take it from the proxied request. But, it
      // won't
      // be set when we consume chunked content, since that doesn't use Content-Length. As we're
      // not
      // going to send a chunked response, we need to set the Content-Length in order for the
      // response
      // to be valid.
      if (!response.containsHeader("Content-Length")) {
        response.setIntHeader("Content-Length", rawBody.length);
      }

      out.write(rawBody);
    } catch (IOException e) {
      throw new ClientGoneException(e);
    } finally {
      IOUtils.closeQuietly(out);
    }
  }

  private byte[] drainInputStream(InputStream in) throws IOException {
    try {
      return ByteStreams.toByteArray(in);
    } finally {
      in.close();
    }
  }

  private String getResponseUtf8Content(InputStream in) {
    String res;
    StringBuilder sb = new StringBuilder();
    String line;
    try {
      BufferedReader reader = new BufferedReader(new InputStreamReader(in, "UTF-8"));
      while ((line = reader.readLine()) != null) {
        // TODO freynaud bug ?
        sb.append(line);/* .append("\n") */
      }
      in.close();
    } catch (UnsupportedEncodingException e) {
      throw new RuntimeException(e);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
    res = sb.toString();
    return res;
  }

  private void processResponseHeaders(HttpServletRequest request, HttpServletResponse response,
                                      URL remoteURL, HttpResponse proxyResponse)
      throws MalformedURLException {
    String pathSpec = request.getServletPath() + request.getContextPath();
    for (Header header : proxyResponse.getAllHeaders()) {
      String name = header.getName();
      String value = header.getValue();

      // HttpEntity#getContent() chews up the chunk-size octet (i.e., the InputStream does not
      // actually map 1:1 to the underlying response body). This breaks any client expecting the
      // chunk size. We could
      // try to recreate it, but since the chunks are already read in and decoded, you'd end up with
      // a
      // single chunk, which isn't all that useful. So, we return the response as a traditional
      // response with a
      // Content-Length header, obviating the need for the Transfer-Encoding header.
      if (name.equalsIgnoreCase("Transfer-Encoding") && value.equalsIgnoreCase("chunked")) {
        continue;
      }

      // the location needs to point to the hub that will proxy
      // everything.
      if (name.equalsIgnoreCase("Location")) {
        URL returnedLocation = new URL(remoteURL, value);
        String driverPath = remoteURL.getPath();
        String wrongPath = returnedLocation.getPath();
        String correctPath = wrongPath.replace(driverPath, "");
        Hub hub = slot.getProxy().getRegistry().getHub();
        response.setHeader(name, hub.getUrl(pathSpec + correctPath).toString());
      } else {
        response.setHeader(name, value);
      }
    }
  }

  /**
   * Allow you to retrieve an object previously stored on the test session.
   *
   * @param key key
   * @return the object you stored
   */
  public Object get(String key) {
    return objects.get(key);
  }

  /**
   * Allows you to store an object on the test session.
   *
   * @param key a non-null string
   * @param value value object
   */
  public void put(String key, Object value) {
    objects.put(key, value);
  }


  /**
   * Sends a DELETE/testComplete (webdriver/selenium) session command to the remote, following web
   * driver protocol.
   *
   * @return true is the remote replied successfully to the request.
   */
  public boolean sendDeleteSessionRequest() {
    URL remoteURL = slot.getRemoteURL();

    HttpRequest request;
    switch (slot.getProtocol()) {
      case Selenium:
        request =
            new BasicHttpRequest("POST", remoteURL.toExternalForm()
                                         + "/?cmd=testComplete&sessionId=" + getExternalKey()
                .getKey());
        break;
      case WebDriver:
        String uri = remoteURL.toString() + "/session/" + externalKey;
        request = new BasicHttpRequest("DELETE", uri);
        break;
      default:
        throw new GridException("Error, protocol not implemented.");
    }

    HttpHost host = new HttpHost(remoteURL.getHost(), remoteURL.getPort());
    HttpEntity responseBody = null;
    boolean ok;
    try {
      HttpClient client = getClient();
      HttpResponse response = client.execute(host, request);
      responseBody = response.getEntity();
      int code = response.getStatusLine().getStatusCode();
      ok = (code >= 200) && (code <= 299);
    } catch (Throwable e) {
      ok = false;
      // corrupted or the something else already sent the DELETE.
      log.severe("Unable to send DELETE request for the current session " + e.getMessage());
    } finally {
      try {
        EntityUtils.consume(responseBody);
      } catch (IOException e) {
        log.warning("Consuming the response body when DELETE to the node " + e.getMessage());
      }
    }
    return ok;
  }


  /**
   * allow to bypass time out for this session. ignore = true =&gt; the session will not time out.
   * setIgnoreTimeout(true) also update the lastActivity to now.
   *
   * @param ignore true to ignore the timeout
   */
  public void setIgnoreTimeout(boolean ignore) {
    if (!ignore) {
      lastActivity = timeSource.currentTimeInMillis();
    }
    this.ignoreTimeout = ignore;

  }

  public boolean isForwardingRequest() {
    return forwardingRequest;
  }
}
