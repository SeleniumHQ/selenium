package org.openqa.selenium.remote.http.jdk;

import com.google.auto.service.AutoService;
import org.openqa.selenium.Credentials;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.UsernameAndPassword;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.http.BinaryMessage;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.CloseMessage;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpClientName;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Message;
import org.openqa.selenium.remote.http.TextMessage;
import org.openqa.selenium.remote.http.WebSocket;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.net.Authenticator;
import java.net.PasswordAuthentication;
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
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CancellationException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

import static java.net.http.HttpClient.Redirect.ALWAYS;

public class JdkHttpClient implements HttpClient {
  private final JdkHttpMessages messages;
  private final java.net.http.HttpClient client;
  private final Duration readTimeout;

  JdkHttpClient(ClientConfig config) {
    Objects.requireNonNull(config, "Client config must be set");

    this.messages = new JdkHttpMessages(config);
    this.readTimeout = config.readTimeout();

    java.net.http.HttpClient.Builder builder = java.net.http.HttpClient.newBuilder()
      .connectTimeout(config.connectionTimeout())
      .followRedirects(ALWAYS);

    Credentials credentials = config.credentials();
    if (credentials != null) {
      if (!(credentials instanceof UsernameAndPassword)) {
        throw new IllegalArgumentException("Credentials must be a user name and password: " + credentials);
      }
      UsernameAndPassword uap = (UsernameAndPassword) credentials;
      Authenticator authenticator = new Authenticator() {
        @Override
        protected PasswordAuthentication getPasswordAuthentication() {
          return new PasswordAuthentication(uap.username(), uap.password().toCharArray());
        }
      };
      builder = builder.authenticator(authenticator);
    }

    Proxy proxy = config.proxy();
    if (proxy != null) {
      ProxySelector proxySelector = new ProxySelector() {
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
    URI uri = getWebSocketUri(request);

    CompletableFuture<java.net.http.WebSocket> webSocketCompletableFuture =
      client.newWebSocketBuilder().buildAsync(
        uri,
        new java.net.http.WebSocket.Listener() {

          @Override
          public CompletionStage<?> onText(java.net.http.WebSocket webSocket, CharSequence data, boolean last) {
            listener.onText(data);
            return null;
          }

          @Override
          public CompletionStage<?> onBinary(java.net.http.WebSocket webSocket, ByteBuffer data, boolean last) {
            byte[] ary = new byte[data.remaining()];
            data.get(ary, 0, ary.length);

            listener.onBinary(ary);
            return null;
          }

          @Override
          public CompletionStage<?> onClose(java.net.http.WebSocket webSocket, int statusCode, String reason) {
            listener.onClose(statusCode, reason);
            return null;
          }

          @Override
          public void onError(java.net.http.WebSocket webSocket, Throwable error) {
            listener.onError(error);
          }
        });

    java.net.http.WebSocket underlyingSocket = webSocketCompletableFuture.join();

    return new WebSocket() {
      @Override
      public WebSocket send(Message message) {
        Supplier<CompletableFuture<java.net.http.WebSocket>> makeCall;

        if (message instanceof BinaryMessage) {
          BinaryMessage binaryMessage = (BinaryMessage) message;
          makeCall = () -> underlyingSocket.sendBinary(ByteBuffer.wrap(binaryMessage.data()), true);
        } else if (message instanceof TextMessage) {
          TextMessage textMessage = (TextMessage) message;
          makeCall = () -> underlyingSocket.sendText(textMessage.text(), true);
        } else if (message instanceof CloseMessage) {
          CloseMessage closeMessage = (CloseMessage) message;
          makeCall = () -> underlyingSocket.sendClose(closeMessage.code(), closeMessage.reason());
        } else {
          throw new IllegalArgumentException("Unsupport message type: " + message);
        }

        synchronized (underlyingSocket) {
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
          }
        }
        return this;
      }

      @Override
      public void close() {
        underlyingSocket.sendClose(1000, "WebDriver closing socket");
      }
    };
  }

  private URI getWebSocketUri(HttpRequest request) {
    URI uri = messages.createRequest(request).uri();
    if ("http".equalsIgnoreCase(uri.getScheme())) {
      try {
        uri = new URI("ws", uri.getUserInfo(), uri.getHost(), uri.getPort(), uri.getPath(), uri.getQuery(), uri.getFragment());
      } catch (URISyntaxException e) {
        throw new RuntimeException(e);
      }
    } else if ("https".equalsIgnoreCase(uri.getScheme())) {
      try {
        uri = new URI("wss", uri.getUserInfo(), uri.getHost(), uri.getPort(), uri.getPath(), uri.getQuery(), uri.getFragment());
      } catch (URISyntaxException e) {
        throw new RuntimeException(e);
      }
    }
    return uri;
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    Objects.requireNonNull(req, "Request");
    BodyHandler<InputStream> streamHandler = BodyHandlers.ofInputStream();
    try {
      return messages.createResponse(client.send(messages.createRequest(req), streamHandler));
    } catch (HttpTimeoutException e) {
      throw new TimeoutException(e);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new RuntimeException(e);
    }
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
