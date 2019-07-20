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

package org.openqa.selenium.remote.tracing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;

import org.junit.Test;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.JreAppServer;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.remote.tracing.simple.SimpleTracer;

import java.io.IOException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class TracePropagationTest {

  private DistributedTracer tracer = DistributedTracer.builder().use(new SimpleTracer()).build();

  @Test
  public void decoratedHttpClientShouldForwardTagsWithoutUserIntervention()
      throws IOException {
    // The only way we can test trace propagation is to check for the trace id. Sadly, we can't
    // know the traceid, since opentracing doesn't expose it. That's okay. We'll do something
    // tricksy, since we're going to force all our injections to also inject in b3 mode.

    Map<String, String> seen = new HashMap<>();

    AppServer server = new JreAppServer().setHandler(Route.get("/one").to(() -> req -> {
      try (Span span  = tracer.createSpan("child", req, HttpTracing.AS_MAP)) {
        span.inject((key, value) -> seen.put(key.toLowerCase(), value));
        assertThat(span).isNotNull();
      }
      return new HttpResponse().setContent(utf8String("Hello, World!"));
    }));
    server.start();

    Map<String, String> sent = new HashMap<>();
    try (Span span = tracer.createSpan("one-hop", null)) {
      span.inject((key, value) -> sent.put(key.toLowerCase(), value));

      URL url = new URL(server.whereIs("/"));
      HttpClient client = HttpClient.Factory.createDefault().createClient(url);

      HttpRequest request = new HttpRequest(GET, "/one");
      span.inject(request::setHeader);
      HttpResponse response = client.execute(request);

      assertThat(string(response)).isEqualTo("Hello, World!");
    }

    Set<String> possibleTraceIdKeys = ImmutableSet.of(
        // B3 encoding (used by opencensus)
        "b3",
        "x-b3-traceid",

        // W3C trace context draft
        "traceparent",
        "tracestate",

        // SimpleTracer
        "trace-id");

    Set<String> sentKeys = Sets.intersection(possibleTraceIdKeys, sent.keySet());
    Set<String> seenKeys = Sets.intersection(possibleTraceIdKeys, seen.keySet());

    Set<String> bothSeenAndSent = Sets.intersection(sentKeys, seenKeys);
    assertThat(bothSeenAndSent.isEmpty()).isFalse();

    bothSeenAndSent.forEach(key -> {
      assertThat(sent.get(key)).isEqualTo(seen.get(key));
    });
  }
}
