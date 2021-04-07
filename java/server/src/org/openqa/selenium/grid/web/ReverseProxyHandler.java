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

import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.EventAttribute;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.UncheckedIOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import static org.openqa.selenium.remote.tracing.HttpTracing.newSpanAsChildOf;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST_EVENT;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_RESPONSE;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_RESPONSE_EVENT;
import static org.openqa.selenium.remote.tracing.Tags.KIND;

public class ReverseProxyHandler implements HttpHandler {

  private static final Logger LOG = Logger.getLogger(ReverseProxyHandler.class.getName());

  private static final ImmutableSet<String> IGNORED_REQ_HEADERS = ImmutableSet.<String>builder()
      .add("connection")
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
  private final HttpClient upstream;

  public ReverseProxyHandler(Tracer tracer, HttpClient httpClient) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.upstream = Require.nonNull("HTTP client", httpClient);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    try (Span span = newSpanAsChildOf(tracer, req, "reverse_proxy")) {

      HTTP_REQUEST.accept(span, req);

      HttpRequest toUpstream = new HttpRequest(req.getMethod(), req.getUri());

      for(String attributeName: req.getAttributeNames()) {
        toUpstream.setAttribute(attributeName, req.getAttribute(attributeName));
      }

      for (String name : req.getQueryParameterNames()) {
        for (String value : req.getQueryParameters(name)) {
          toUpstream.addQueryParameter(name, value);
        }
      }

      for (String name : req.getHeaderNames()) {
        if (IGNORED_REQ_HEADERS.contains(name.toLowerCase())) {
          continue;
        }

        for (String value : req.getHeaders(name)) {
          toUpstream.addHeader(name, value);
        }
      }
      // None of this "keep alive" nonsense.
      toUpstream.setHeader("Connection", "keep-alive");

      toUpstream.setContent(req.getContent());
      HttpResponse resp = upstream.execute(toUpstream);

      HTTP_RESPONSE.accept(span,resp);

      // clear response defaults.
      resp.removeHeader("Date");
      resp.removeHeader("Server");

      IGNORED_REQ_HEADERS.forEach(resp::removeHeader);

      return resp;
    }
  }
}
