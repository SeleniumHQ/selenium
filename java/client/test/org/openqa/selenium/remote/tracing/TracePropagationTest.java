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

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import org.junit.Test;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.JreAppServer;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.tracing.simple.SimpleTracer;

import java.io.IOException;
import java.net.URL;

public class TracePropagationTest {

  private final DistributedTracer tracer = DistributedTracer.builder()
      .register(new SimpleTracer())
      .build();

  @Test
  public void decoratedHttpClientShouldForwardTagsWithoutUserIntervention()
      throws IOException {
    AppServer server = new JreAppServer().addHandler(GET, "/one", (req, res) -> {
      try (Span parent = HttpTracing.extract(tracer, "test", req)) {
        res.setContent("".getBytes(UTF_8));

        assertThat(parent).isNotNull();
        assertThat(parent.getTraceTag("cheese")).isEqualTo("gouda");
      }
    });
    server.start();

    try (Span span = tracer.createSpan("one-hop", null)) {
      span.addTraceTag("cheese", "gouda");

      URL url = new URL(server.whereIs("/"));
      HttpClient client = HttpClient.Factory.createDefault().createClient(url);
      client = HttpTracing.decorate(client);

      client.execute(new HttpRequest(GET, "/one"));
    }
  }
}
