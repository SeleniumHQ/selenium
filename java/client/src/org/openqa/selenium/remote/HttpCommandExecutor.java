/*
Copyright 2007-2014 Software Freedom Conservancy

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

package org.openqa.selenium.remote;

import static org.apache.http.protocol.ExecutionContext.HTTP_TARGET_HOST;
import static org.openqa.selenium.remote.DriverCommand.GET_ALL_SESSIONS;
import static org.openqa.selenium.remote.DriverCommand.NEW_SESSION;
import static org.openqa.selenium.remote.DriverCommand.QUIT;

import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableMap;

import org.apache.http.Header;
import org.apache.http.HeaderElement;
import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.NoHttpResponseException;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.logging.LocalLogs;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.NeedsLocalLogs;
import org.openqa.selenium.logging.profiler.HttpProfilerLogEntry;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.JsonHttpCommandCodec;
import org.openqa.selenium.remote.http.JsonHttpResponseCodec;
import org.openqa.selenium.remote.internal.HttpClientFactory;

import java.io.IOException;
import java.net.BindException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Map;

public class HttpCommandExecutor implements CommandExecutor, NeedsLocalLogs {

  private static final int MAX_REDIRECTS = 10;

  private final HttpHost targetHost;
  private final URL remoteServer;
  private final HttpClient client;
  private final JsonHttpCommandCodec commandCodec;
  private final JsonHttpResponseCodec responseCodec;

  private static HttpClientFactory httpClientFactory;

  private LocalLogs logs = LocalLogs.getNullLogger();

  public HttpCommandExecutor(URL addressOfRemoteServer) {
    this(ImmutableMap.<String, CommandInfo>of(), addressOfRemoteServer);
  }

  public HttpCommandExecutor(Map<String, CommandInfo> additionalCommands, URL addressOfRemoteServer) {
    try {
      remoteServer = addressOfRemoteServer == null ?
                     new URL(System.getProperty("webdriver.remote.server", "http://localhost:4444/wd/hub")) :
                     addressOfRemoteServer;
    } catch (MalformedURLException e) {
      throw new WebDriverException(e);
    }

    commandCodec = new JsonHttpCommandCodec();
    responseCodec = new JsonHttpResponseCodec();

    synchronized (HttpCommandExecutor.class) {
      if (httpClientFactory == null) {
        httpClientFactory = new HttpClientFactory();
      }
    }

    if (addressOfRemoteServer != null && addressOfRemoteServer.getUserInfo() != null) {
      // Use HTTP Basic auth
      UsernamePasswordCredentials credentials = new
          UsernamePasswordCredentials(addressOfRemoteServer.getUserInfo());
      client = httpClientFactory.createHttpClient(credentials);
    } else {
      client = httpClientFactory.getHttpClient();
    }

    // Some machines claim "localhost.localdomain" is the same as "localhost".
    // This assumption is not always true.

    String host = remoteServer.getHost().replace(".localdomain", "");

    targetHost = new HttpHost(
        host, remoteServer.getPort(), remoteServer.getProtocol());

    for (Map.Entry<String, CommandInfo> entry : additionalCommands.entrySet()) {
      CommandInfo info = entry.getValue();
      commandCodec.defineCommand(entry.getKey(), info.getMethod(), info.getUrl());
    }
  }

  public void setLocalLogs(LocalLogs logs) {
    this.logs = logs;
  }

  private void log(String logType, LogEntry entry) {
    logs.addEntry(logType, entry);
  }

  public URL getAddressOfRemoteServer() {
    return remoteServer;
  }

  public Response execute(Command command) throws IOException {
    HttpContext context = new BasicHttpContext();

    if (command.getSessionId() == null) {
      if (QUIT.equals(command.getName())) {
        return new Response();
      }
      if (!GET_ALL_SESSIONS.equals(command.getName())
          && !NEW_SESSION.equals(command.getName())) {
        throw new SessionNotFoundException(
            "Session ID is null. Using WebDriver after calling quit()?");
      }
    }

    HttpRequest request = commandCodec.encode(command);

    String requestUrl = remoteServer.toExternalForm().replaceAll("/$", "")
        + request.getUri();

    HttpUriRequest httpMethod = createHttpUriRequest(request.getMethod(), requestUrl);
    for (String name : request.getHeaderNames()) {
      // Skip content length as it is implicitly set when the message entity is set below.
      if (!"Content-Length".equalsIgnoreCase(name)) {
        for (String value : request.getHeaders(name)) {
          httpMethod.addHeader(name, value);
        }
      }
    }

    if (httpMethod instanceof HttpPost) {
      ((HttpPost) httpMethod).setEntity(new ByteArrayEntity(request.getContent()));
    }

    try {
      log(LogType.PROFILER, new HttpProfilerLogEntry(command.getName(), true));
      HttpResponse response = fallBackExecute(context, httpMethod);
      log(LogType.PROFILER, new HttpProfilerLogEntry(command.getName(), false));

      response = followRedirects(client, context, response, /* redirect count */0);

      return createResponse(response, context);
    } catch (UnsupportedCommandException e) {
      if (e.getMessage() == null || "".equals(e.getMessage())) {
        throw new UnsupportedOperationException(
            "No information from server. Command name was: " + command.getName(),
            e.getCause());
      }
      throw e;
    }
  }

  private static HttpUriRequest createHttpUriRequest(HttpMethod method, String url) {
    switch (method) {
      case DELETE:
        return new HttpDelete(url);
      case GET:
        return new HttpGet(url);
      case POST:
        return new HttpPost(url);
    }
    throw new AssertionError("Unsupported method: " + method);
  }

  private HttpResponse fallBackExecute(HttpContext context, HttpUriRequest httpMethod)
      throws IOException {
    try {
      return client.execute(targetHost, httpMethod, context);
    } catch (BindException e) {
      // If we get this, there's a chance we've used all the local ephemeral sockets
      // Sleep for a bit to let the OS reclaim them, then try the request again.
      try {
        Thread.sleep(2000);
      } catch (InterruptedException ie) {
        throw Throwables.propagate(ie);
      }
    } catch (NoHttpResponseException e) {
      // If we get this, there's a chance we've used all the remote ephemeral sockets
      // Sleep for a bit to let the OS reclaim them, then try the request again.
      try {
        Thread.sleep(2000);
      } catch (InterruptedException ie) {
        throw Throwables.propagate(ie);
      }
    }
    return client.execute(targetHost, httpMethod, context);
  }

  private HttpResponse followRedirects(
      HttpClient client, HttpContext context, HttpResponse response, int redirectCount) {
    if (!isRedirect(response)) {
      return response;
    }

    try {
      // Make sure that the previous connection is freed.
      HttpEntity httpEntity = response.getEntity();
      if (httpEntity != null) {
        EntityUtils.consume(httpEntity);
      }
    } catch (IOException e) {
      throw new WebDriverException(e);
    }

    if (redirectCount > MAX_REDIRECTS) {
      throw new WebDriverException("Maximum number of redirects exceeded. Aborting");
    }

    String location = response.getFirstHeader("location").getValue();
    URI uri;
    try {
      uri = buildUri(context, location);

      HttpGet get = new HttpGet(uri);
      get.setHeader("Accept", "application/json; charset=utf-8");
      HttpResponse newResponse = client.execute(targetHost, get, context);
      return followRedirects(client, context, newResponse, redirectCount + 1);
    } catch (URISyntaxException e) {
      throw new WebDriverException(e);
    } catch (ClientProtocolException e) {
      throw new WebDriverException(e);
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }

  private URI buildUri(HttpContext context, String location) throws URISyntaxException {
    URI uri;
    uri = new URI(location);
    if (!uri.isAbsolute()) {
      HttpHost host = (HttpHost) context.getAttribute(HTTP_TARGET_HOST);
      uri = new URI(host.toURI() + location);
    }
    return uri;
  }

  private boolean isRedirect(HttpResponse response) {
    int code = response.getStatusLine().getStatusCode();

    return (code == 301 || code == 302 || code == 303 || code == 307)
           && response.containsHeader("location");
  }

  private Response createResponse(HttpResponse httpResponse, HttpContext context)
      throws IOException {
    org.openqa.selenium.remote.http.HttpResponse internalResponse =
        new org.openqa.selenium.remote.http.HttpResponse();

    internalResponse.setStatus(httpResponse.getStatusLine().getStatusCode());
    for (Header header : httpResponse.getAllHeaders()) {
      for (HeaderElement headerElement : header.getElements()) {
        internalResponse.addHeader(header.getName(), headerElement.getValue());
      }
    }

    HttpEntity entity = httpResponse.getEntity();
    if (entity != null) {
      try {
        internalResponse.setContent(EntityUtils.toByteArray(entity));
      } finally {
        EntityUtils.consume(entity);
      }
    }

    Response response = responseCodec.decode(internalResponse);
    if (response.getSessionId() == null) {
      HttpHost finalHost = (HttpHost) context.getAttribute(HTTP_TARGET_HOST);
      String uri = finalHost.toURI();
      String sessionId = HttpSessionId.getSessionId(uri);
      response.setSessionId(sessionId);
    }

    return response;
  }
}
