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

package org.openqa.selenium.remote;

import com.google.common.io.CountingOutputStream;
import com.google.common.io.FileBackedOutputStream;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.logging.Logger;
import java.util.stream.Stream;

import static com.google.common.net.HttpHeaders.CONTENT_LENGTH;
import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.json.Json.JSON_UTF_8;
import static org.openqa.selenium.remote.CapabilityType.PROXY;
import static org.openqa.selenium.remote.http.Contents.string;

public class ProtocolHandshake {

  private static final Logger LOG = Logger.getLogger(ProtocolHandshake.class.getName());

  public Result createSession(HttpHandler client, Command command) throws IOException {
    Capabilities desired = (Capabilities) command.getParameters().get("desiredCapabilities");
    desired = desired == null ? new ImmutableCapabilities() : desired;

    try (NewSessionPayload payload = NewSessionPayload.create(desired)) {
      Either<SessionNotCreatedException, Result> result = createSession(client, payload);

      if (result.isRight()) {
        Result toReturn = result.right();
        LOG.info(String.format("Detected dialect: %s", toReturn.dialect));
        return toReturn;
      } else {
        throw result.left();
      }
    }
  }

  public Either<SessionNotCreatedException, Result> createSession(HttpHandler client, NewSessionPayload payload) throws IOException {
    int threshold = (int) Math.min(Runtime.getRuntime().freeMemory() / 10, Integer.MAX_VALUE);
    FileBackedOutputStream os = new FileBackedOutputStream(threshold);

    try (CountingOutputStream counter = new CountingOutputStream(os);
         Writer writer = new OutputStreamWriter(counter, UTF_8)) {
      payload.writeTo(writer);

      try (InputStream rawIn = os.asByteSource().openBufferedStream();
           BufferedInputStream contentStream = new BufferedInputStream(rawIn)) {
        return createSession(client, contentStream, counter.getCount());
      }
    } finally {
      os.reset();
    }
  }

  private Either<SessionNotCreatedException, Result> createSession(HttpHandler client, InputStream newSessionBlob, long size) {
    // Create the http request and send it
    HttpRequest request = new HttpRequest(HttpMethod.POST, "/session");

    HttpResponse response;
    long start = System.currentTimeMillis();

    request.setHeader(CONTENT_LENGTH, String.valueOf(size));
    request.setHeader(CONTENT_TYPE, JSON_UTF_8);
    request.setContent(() -> newSessionBlob);

    response = client.execute(request);
    long time = System.currentTimeMillis() - start;

    // Ignore the content type. It may not have been set. Strictly speaking we're not following the
    // W3C spec properly. Oh well.
    Map<?, ?> blob;
    try {
      blob = new Json().toType(string(response), Map.class);
    } catch (JsonException e) {
      return Either.left(new SessionNotCreatedException(
        "Unable to parse remote response: " + string(response), e));
    }

    InitialHandshakeResponse initialResponse = new InitialHandshakeResponse(
      time,
      response.getStatus(),
      blob);

    if (initialResponse.getStatusCode() != 200) {
      Object rawResponseValue = initialResponse.getData().get("value");
      String responseMessage = rawResponseValue instanceof Map
                               ? ((Map<?, ?>) rawResponseValue).get("message").toString()
                               : new Json().toJson(rawResponseValue);
      return Either.left(new SessionNotCreatedException(
        String.format("Response code %s. Message: %s",
                      initialResponse.getStatusCode(), responseMessage)));
    }

    return Stream.of(
      new W3CHandshakeResponse().getResponseFunction(),
      new JsonWireProtocolResponse().getResponseFunction())
      .map(func -> func.apply(initialResponse))
      .filter(Objects::nonNull)
      .findFirst()
      .<Either<SessionNotCreatedException, Result>>map(Either::right)
      .orElseGet(() -> Either.left(
        new SessionNotCreatedException("Handshake response does not match any supported protocol")));
  }

  public static class Result {

    private static final Function<Object, Proxy> massageProxy = obj -> {
      if (obj instanceof Proxy) {
        return (Proxy) obj;
      }

      if (!(obj instanceof Map)) {
        return null;
      }

      Map<?, ?> rawMap = (Map<?, ?>) obj;
      for (Object key : rawMap.keySet()) {
        if (!(key instanceof String)) {
          return null;
        }
      }

      // This cast is now safe.
      //noinspection unchecked
      return new Proxy((Map<String, ?>) obj);
    };

    private final Dialect dialect;
    private final Map<String, ?> capabilities;
    private final SessionId sessionId;

    Result(Dialect dialect, String sessionId, Map<String, ?> capabilities) {
      this.dialect = dialect;
      this.sessionId = new SessionId(Require.nonNull("Session id", sessionId));
      this.capabilities = capabilities;

      if (capabilities.containsKey(PROXY)) {
        //noinspection unchecked
        ((Map<String, Object>) capabilities)
          .put(PROXY, massageProxy.apply(capabilities.get(PROXY)));
      }
    }

    public Dialect getDialect() {
      return dialect;
    }

    public Response createResponse() {
      Response response = new Response(sessionId);
      response.setValue(capabilities);
      response.setStatus(ErrorCodes.SUCCESS);
      response.setState(ErrorCodes.SUCCESS_STRING);
      return response;
    }

    @Override
    public String toString() {
      return String.format("%s: %s", dialect, capabilities);
    }
  }
}
