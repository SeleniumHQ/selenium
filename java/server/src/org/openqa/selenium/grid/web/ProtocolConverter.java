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

package org.openqa.selenium.grid.web;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.net.MediaType;

import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandCodec;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.JsonToWebElementConverter;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.ResponseCodec;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.codec.jwp.JsonHttpCommandCodec;
import org.openqa.selenium.remote.codec.jwp.JsonHttpResponseCodec;
import org.openqa.selenium.remote.codec.w3c.W3CHttpCommandCodec;
import org.openqa.selenium.remote.codec.w3c.W3CHttpResponseCodec;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.EventAttribute;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.HttpTracing;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.UncheckedIOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;

import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.Dialect.W3C;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID_EVENT;
import static org.openqa.selenium.remote.http.Contents.bytes;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.tracing.HttpTracing.newSpanAsChildOf;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST_EVENT;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_RESPONSE;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_RESPONSE_EVENT;
import static org.openqa.selenium.remote.tracing.Tags.KIND;

public class ProtocolConverter implements HttpHandler {

  private static final Json JSON = new Json();
  private static final ImmutableSet<String> IGNORED_REQ_HEADERS = ImmutableSet.<String>builder()
    .add("connection")
    .add("content-length")
    .add("content-type")
    .add("keep-alive")
    .add("proxy-authorization")
    .add("proxy-authenticate")
    .add("proxy-connection")
    .add("te")
    .add("trailer")
    .add("transfer-encoding")
    .add("upgrade")
    .build();

  private final Tracer tracer;
  private final HttpClient client;
  private final CommandCodec<HttpRequest> downstream;
  private final CommandCodec<HttpRequest> upstream;
  private final ResponseCodec<HttpResponse> downstreamResponse;
  private final ResponseCodec<HttpResponse> upstreamResponse;
  private final JsonToWebElementConverter converter;
  private final Function<HttpResponse, HttpResponse> newSessionConverter;

  public ProtocolConverter(
    Tracer tracer,
    HttpClient client,
    Dialect downstream,
    Dialect upstream) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.client = Require.nonNull("HTTP client", client);

    this.downstream = getCommandCodec(Require.nonNull("Downstream dialect", downstream));
    this.downstreamResponse = getResponseCodec(downstream);

    this.upstream = getCommandCodec(Require.nonNull("Upstream dialect", upstream));
    this.upstreamResponse = getResponseCodec(upstream);

    converter = new JsonToWebElementConverter(null);

    newSessionConverter = downstream == W3C ? this::createW3CNewSessionResponse : this::createJwpNewSessionResponse;
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    try (Span span = newSpanAsChildOf(tracer, req, "protocol_converter")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(AttributeKey.HTTP_HANDLER_CLASS.getKey(),
                       EventAttribute.setValue(getClass().getName()));
      Command command = downstream.decode(req);
      KIND.accept(span, Span.Kind.SERVER);
      HTTP_REQUEST.accept(span, req);
      HTTP_REQUEST_EVENT.accept(attributeMap, req);
      SessionId sessionId = command.getSessionId();
      SESSION_ID.accept(span, sessionId);
      SESSION_ID_EVENT.accept(attributeMap, sessionId);
      String commandName = command.getName();
      span.setAttribute("command.name", commandName);
      attributeMap.put("command.name", EventAttribute.setValue(commandName));
      attributeMap.put("downstream.command.parameters", EventAttribute.setValue(command.getParameters().toString()));

      // Massage the webelements
      @SuppressWarnings("unchecked")
      Map<String, ?> parameters = (Map<String, ?>) converter.apply(command.getParameters());
      command = new Command(
        command.getSessionId(),
        command.getName(),
        parameters);

      attributeMap.put("upstream.command.parameters", EventAttribute.setValue(command.getParameters().toString()));
      HttpRequest request = upstream.encode(command);

      HttpTracing.inject(tracer, span, request);
      HttpResponse res = makeRequest(request);
      if(!res.isSuccessful()) {
        span.setAttribute("error", true);
        span.setStatus(Status.UNKNOWN);
      }
      HTTP_RESPONSE.accept(span, res);
      HTTP_RESPONSE_EVENT.accept(attributeMap, res);

      HttpResponse toReturn;
      if (DriverCommand.NEW_SESSION.equals(command.getName()) && res.getStatus() == HTTP_OK) {
        toReturn = newSessionConverter.apply(res);
      } else {
        Response decoded = upstreamResponse.decode(res);
        toReturn = downstreamResponse.encode(HttpResponse::new, decoded);
      }

      res.getHeaderNames().forEach(name -> {
        if (!IGNORED_REQ_HEADERS.contains(name)) {
          res.getHeaders(name).forEach(value -> toReturn.addHeader(name, value));
        }
      });

      span.addEvent("Protocol conversion completed", attributeMap);
      return toReturn;
    }
  }

  @VisibleForTesting
  HttpResponse makeRequest(HttpRequest request) {
    return client.execute(request);
  }

  private CommandCodec<HttpRequest> getCommandCodec(Dialect dialect) {
    switch (dialect) {
      case OSS:
        return new JsonHttpCommandCodec();

      case W3C:
        return new W3CHttpCommandCodec();

      default:
        throw new IllegalStateException("Unknown dialect: " + dialect);
    }
  }

  private ResponseCodec<HttpResponse> getResponseCodec(Dialect dialect) {
    switch (dialect) {
      case OSS:
        return new JsonHttpResponseCodec();

      case W3C:
        return new W3CHttpResponseCodec();

      default:
        throw new IllegalStateException("Unknown dialect: " + dialect);
    }
  }

  private HttpResponse createW3CNewSessionResponse(HttpResponse response) {
    Map<String, Object> value = JSON.toType(string(response), MAP_TYPE);

    Require.state("Session id", value.get("sessionId")).nonNull();
    Require.state("Response payload", value.get("value")).instanceOf(Map.class);

    return createResponse(ImmutableMap.of(
      "value", ImmutableMap.of(
        "sessionId", value.get("sessionId"),
        "capabilities", value.get("value"))));
  }

  private HttpResponse createJwpNewSessionResponse(HttpResponse response) {
    Map<String, Object> value = Objects.requireNonNull(Values.get(response, MAP_TYPE));

    // Check to see if the values we need are set
    Require.state("Session id", value.get("sessionId")).nonNull();
    Require.state("Response payload", value.get("capabilities")).instanceOf(Map.class);

    return createResponse(ImmutableMap.of(
      "status", 0,
      "sessionId", value.get("sessionId"),
      "value", value.get("capabilities")));
  }


  private HttpResponse createResponse(ImmutableMap<String, Object> toSend) {
    byte[] bytes = JSON.toJson(toSend).getBytes(UTF_8);

    return new HttpResponse()
      .setHeader("Content-Type", MediaType.JSON_UTF_8.toString())
      .setHeader("Content-Length", String.valueOf(bytes.length))
      .setContent(bytes(bytes));
  }

}
