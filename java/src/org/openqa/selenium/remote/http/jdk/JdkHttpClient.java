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

package org.openqa.selenium.remote.http.jdk;

import com.google.auto.service.AutoService;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.Authenticator;
import java.net.PasswordAuthentication;
import java.net.ProtocolException;
import java.net.Proxy;
import java.net.ProxySelector;
import java.net.SocketAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpResponse.BodyHandler;
import java.net.http.HttpResponse.BodyHandlers;
import java.net.http.HttpTimeoutException;
import java.nio.ByteBuffer;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CancellationException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.Credentials;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.UsernameAndPassword;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.http.BinaryMessage;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.CloseMessage;
import org.openqa.selenium.remote.http.ConnectionFailedException;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpClientName;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Message;
import org.openqa.selenium.remote.http.TextMessage;
import org.openqa.selenium.remote.http.WebSocket;

public class JdkHttpClient implements HttpClient {
  public static final Logger LOG = Logger.getLogger(JdkHttpClient.class.getName());
  private final JdkHttpMessages messages;
  private final HttpHandler handler;
  private java.net.http.HttpClient client;
  private final List<WebSocket> websockets;
  private final ExecutorService executorService;
  private final Duration readTimeout;

  JdkHttpClient(ClientConfig config) {
    Objects.requireNonNull(config, "Client config must be set");

    this.messages = new JdkHttpMessages(config);
    this.readTimeout = config.readTimeout();
    this.websockets = new ArrayList<>();
    this.handler = config.filter().andFinally(this::execute0);

    executorService = Executors.newCachedThreadPool();

    java.net.http.HttpClient.Builder builder =
        java.net.http.HttpClient.newBuilder()
            .connectTimeout(config.connectionTimeout())
            .followRedirects(java.net.http.HttpClient.Redirect.NEVER)
            .executor(executorService);

    Credentials credentials = config.credentials();
    String info = config.baseUri().getUserInfo();
    if (info != null && !info.trim().isEmpty()) {
      String[] parts = info.split(":", 2);
      String username = parts[0];
      String password = parts.length > 1 ? parts[1] : null;

      Authenticator authenticator =
          new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
              return new PasswordAuthentication(username, password.toCharArray());
            }
          };
      builder = builder.authenticator(authenticator);
    } else if (credentials != null) {
      if (!(credentials instanceof UsernameAndPassword)) {
        throw new IllegalArgumentException(
            "Credentials must be a user name and password: " + credentials);
      }
      UsernameAndPassword uap = (UsernameAndPassword) credentials;
      Authenticator authenticator =
          new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
              return new PasswordAuthentication(uap.username(), uap.password().toCharArray());
            }
          };
      builder = builder.authenticator(authenticator);
    }

    Proxy proxy = config.proxy();
    if (proxy != null) {
      ProxySelector proxySelector =
          new ProxySelector() {
            @Override
            public List<Proxy> select(URI uri) {
              if (proxy == null) {
                return List.of();
              }
              if (uri.getScheme().toLowerCase().startsWith("http")) {
                return List.of(proxy);
              }
              return List.of();
            }

            @Override
            public void connectFailed(URI uri, SocketAddress sa, IOException ioe) {
              // Do nothing
            }
          };
      builder = builder.proxy(proxySelector);
    }

    this.client = builder.build();
  }

  @Override
  public WebSocket openSocket(HttpRequest request, WebSocket.Listener listener) {
    URI uri;

    try {
      uri = getWebSocketUri(request);
    } catch (URISyntaxException e) {
      throw new ConnectionFailedException("JdkWebSocket initial request execution error", e);
    }

    CompletableFuture<java.net.http.WebSocket> webSocketCompletableFuture =
        client
            .newWebSocketBuilder()
            .buildAsync(
                uri,
                new java.net.http.WebSocket.Listener() {
                  final StringBuilder builder = new StringBuilder();
                  final ByteArrayOutputStream buffer = new ByteArrayOutputStream();

                  @Override
                  public CompletionStage<?> onText(
                      java.net.http.WebSocket webSocket, CharSequence data, boolean last) {
                    LOG.fine("Text message received. Appending data");
                    builder.append(data);

                    if (last) {
                      LOG.fine(
                          "Final part of text message received. Calling listener with " + builder);
                      listener.onText(builder.toString());
                      builder.setLength(0);
                    }

                    webSocket.request(1);
                    return null;
                  }

                  @Override
                  public CompletionStage<?> onBinary(
                      java.net.http.WebSocket webSocket, ByteBuffer data, boolean last) {
                    LOG.fine("Binary data received. Appending data");
                    byte[] ary = new byte[8192];

                    while (data.hasRemaining()) {
                      int n = Math.min(ary.length, data.remaining());
                      data.get(ary, 0, n);
                      buffer.write(ary, 0, n);
                    }

                    if (last) {
                      LOG.fine(
                          "Final part of binary data received. Calling listener with "
                              + buffer.size()
                              + " bytes of data");
                      listener.onBinary(buffer.toByteArray());
                      buffer.reset();
                    }
                    webSocket.request(1);
                    return null;
                  }

                  @Override
                  public CompletionStage<?> onClose(
                      java.net.http.WebSocket webSocket, int statusCode, String reason) {
                    LOG.fine("Closing websocket");
                    listener.onClose(statusCode, reason);
                    return null;
                  }

                  @Override
                  public void onError(java.net.http.WebSocket webSocket, Throwable error) {
                    LOG.log(
                        Level.FINE, error, () -> "An error has occurred: " + error.getMessage());
                    listener.onError(error);
                    webSocket.request(1);
                  }
                });

    java.net.http.WebSocket underlyingSocket;

    try {
      underlyingSocket =
          webSocketCompletableFuture.get(readTimeout.toMillis(), TimeUnit.MILLISECONDS);
    } catch (CancellationException e) {
      throw new ConnectionFailedException("JdkWebSocket initial request canceled", e);
    } catch (ExecutionException e) {
      Throwable cause = e.getCause();
      throw new ConnectionFailedException(
          "JdkWebSocket initial request execution error", (cause != null) ? cause : e);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new ConnectionFailedException("JdkWebSocket initial request interrupted", e);
    } catch (java.util.concurrent.TimeoutException e) {
      webSocketCompletableFuture.cancel(true);
      throw new ConnectionFailedException("JdkWebSocket initial request timeout", e);
    }

    WebSocket websocket =
        new WebSocket() {
          @Override
          public WebSocket send(Message message) {
            Supplier<CompletableFuture<java.net.http.WebSocket>> makeCall;

            if (message instanceof BinaryMessage) {
              BinaryMessage binaryMessage = (BinaryMessage) message;
              LOG.fine("Sending binary message");
              makeCall =
                  () -> underlyingSocket.sendBinary(ByteBuffer.wrap(binaryMessage.data()), true);
            } else if (message instanceof TextMessage) {
              TextMessage textMessage = (TextMessage) message;
              LOG.fine("Sending text message: " + textMessage.text());
              makeCall = () -> underlyingSocket.sendText(textMessage.text(), true);
            } else if (message instanceof CloseMessage) {
              CloseMessage closeMessage = (CloseMessage) message;
              if (!underlyingSocket.isOutputClosed()) {
                // Sometimes the statusCode is -1, which could mean the socket is already closed.
                // We send a normal closure code in that case, though
                int statusCode = closeMessage.code() == -1 ? 1000 : closeMessage.code();
                LOG.fine(
                    () ->
                        String.format(
                            "Sending close message, statusCode %s, reason: %s",
                            statusCode, closeMessage.reason()));
                makeCall = () -> underlyingSocket.sendClose(statusCode, closeMessage.reason());
              } else {
                LOG.fine("Output is closed, not sending close message");
                return this;
              }
            } else {
              throw new IllegalArgumentException("Unsupported message type: " + message);
            }

            synchronized (underlyingSocket) {
              long start = System.currentTimeMillis();
              CompletableFuture<java.net.http.WebSocket> future = makeCall.get();
              try {
                future.get(readTimeout.toMillis(), TimeUnit.MILLISECONDS);
              } catch (CancellationException e) {
                throw new WebDriverException(e.getMessage(), e);
              } catch (ExecutionException e) {
                Throwable cause = e.getCause();
                if (cause == null) {
                  throw new WebDriverException(e);
                }
                throw new WebDriverException(cause);
              } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new WebDriverException(e.getMessage());
              } catch (java.util.concurrent.TimeoutException e) {
                throw new TimeoutException(e);
              } finally {
                LOG.fine(
                    String.format(
                        "Websocket response to %s read in %sms",
                        message, (System.currentTimeMillis() - start)));
              }
            }
            return this;
          }

          @Override
          public void close() {
            LOG.fine("Closing websocket");
            send(new CloseMessage(1000, "WebDriver closing socket"));
          }
        };
    websockets.add(websocket);
    return websocket;
  }

  private URI getWebSocketUri(HttpRequest request) throws URISyntaxException {
    URI uri = messages.getRawUri(request);
    if ("http".equalsIgnoreCase(uri.getScheme())) {
      uri =
          new URI(
              "ws",
              uri.getUserInfo(),
              uri.getHost(),
              uri.getPort(),
              uri.getPath(),
              uri.getQuery(),
              uri.getFragment());
    } else if ("https".equalsIgnoreCase(uri.getScheme())) {
      uri =
          new URI(
              "wss",
              uri.getUserInfo(),
              uri.getHost(),
              uri.getPort(),
              uri.getPath(),
              uri.getQuery(),
              uri.getFragment());
    }
    return uri;
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    return handler.execute(req);
  }

  private HttpResponse execute0(HttpRequest req) throws UncheckedIOException {
    Objects.requireNonNull(req, "Request");

    LOG.fine("Executing request: " + req);
    long start = System.currentTimeMillis();

    BodyHandler<byte[]> byteHandler = BodyHandlers.ofByteArray();
    try {
      HttpMethod method = req.getMethod();
      URI rawUri = messages.getRawUri(req);

      // We need a custom handling of redirects to:
      // - increase the maximum number of retries to 100
      // - avoid a downgrade of POST requests, see the javadoc of j.n.h.HttpClient.Redirect
      // - not run into https://bugs.openjdk.org/browse/JDK-8304701
      for (int i = 0; i < 100; i++) {
        java.net.http.HttpRequest request = messages.createRequest(req, method, rawUri);
        java.net.http.HttpResponse<byte[]> response;

        // use sendAsync to not run into https://bugs.openjdk.org/browse/JDK-8258397
        CompletableFuture<java.net.http.HttpResponse<byte[]>> future =
            client.sendAsync(request, byteHandler);

        try {
          response = future.get(readTimeout.toMillis(), TimeUnit.MILLISECONDS);
        } catch (CancellationException e) {
          throw new WebDriverException(e.getMessage(), e);
        } catch (ExecutionException e) {
          Throwable cause = e.getCause();

          if (cause instanceof HttpTimeoutException) {
            throw new TimeoutException(cause);
          } else if (cause instanceof IOException) {
            throw (IOException) cause;
          } else if (cause instanceof RuntimeException) {
            throw (RuntimeException) cause;
          }

          throw new WebDriverException((cause != null) ? cause : e);
        } catch (java.util.concurrent.TimeoutException e) {
          future.cancel(true);
          throw new TimeoutException(e);
        }

        switch (response.statusCode()) {
          case 303:
            method = HttpMethod.GET;
            // fall-through
          case 301:
          case 302:
          case 307:
          case 308:
            URI location =
                rawUri.resolve(
                    response
                        .headers()
                        .firstValue("location")
                        .orElseThrow(
                            () ->
                                new ProtocolException(
                                    "HTTP "
                                        + response.statusCode()
                                        + " without 'location' header set")));

            if ("https".equalsIgnoreCase(rawUri.getScheme())
                && !"https".equalsIgnoreCase(location.getScheme())) {
              throw new SecurityException("Downgrade from secure to insecure connection.");
            } else if ("wss".equalsIgnoreCase(rawUri.getScheme())
                && !"wss".equalsIgnoreCase(location.getScheme())) {
              throw new SecurityException("Downgrade from secure to insecure connection.");
            }

            rawUri = location;
            continue;
          default:
            return messages.createResponse(response);
        }
      }

      throw new ProtocolException("Too many redirects: 101");
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new RuntimeException(e);
    } finally {
      LOG.fine(
          String.format("Ending request %s in %sms", req, (System.currentTimeMillis() - start)));
    }
  }

  @Override
  public void close() {
    if (this.client == null) {
      return;
    }
    this.client = null;
    for (WebSocket websocket : websockets) {
      try {
        websocket.close();
      } catch (Exception e) {
        LOG.log(Level.WARNING, "failed to close the websocket: " + websocket, e);
      }
    }
    executorService.shutdownNow();
  }

  @AutoService(HttpClient.Factory.class)
  @HttpClientName("jdk-http-client")
  public static class Factory implements HttpClient.Factory {

    @Override
    public HttpClient createClient(ClientConfig config) {
      Objects.requireNonNull(config, "Client config must be set");
      return new JdkHttpClient(config);
    }
  }
}
