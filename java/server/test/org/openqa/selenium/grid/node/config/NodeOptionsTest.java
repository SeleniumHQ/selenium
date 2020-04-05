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

package org.openqa.selenium.grid.node.config;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import com.google.common.collect.ImmutableMap;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.remote.http.HttpClient;

import io.opentelemetry.OpenTelemetry;
import io.opentelemetry.trace.Tracer;

import java.net.URI;
import java.net.URISyntaxException;

public class NodeOptionsTest {

  private Tracer tracer;
  private HttpClient.Factory clientFactory;
  private LocalNode.Builder builderSpy;

  @Before
  public void setUp() throws URISyntaxException {
    tracer = OpenTelemetry.getTracerProvider().get("default");
    EventBus bus = new GuavaEventBus();
    clientFactory = HttpClient.Factory.createDefault();
    URI uri = new URI("http://localhost:1234");
    LocalNode.Builder builder = LocalNode.builder(tracer, bus, clientFactory, uri, null);
    builderSpy = spy(builder);
  }

  @Test
  public void canConfigureNodeWithDriverDetection() {
    Config config = new MapConfig(ImmutableMap.of(
        "node", ImmutableMap.of("detect-drivers", "true")));
    new NodeOptions(config).configure(tracer, clientFactory, builderSpy);

    verify(builderSpy, atLeastOnce()).add(any(Capabilities.class), any(SessionFactory.class));
  }

  @Test
  public void canConfigureNodeWithoutDriverDetection() {
    Config config = new MapConfig(ImmutableMap.of(
        "node", ImmutableMap.of("detect-drivers", "false")));
    new NodeOptions(config).configure(tracer, clientFactory, builderSpy);

    verifyNoInteractions(builderSpy);
  }

  @Test
  public void doNotDetectDriversByDefault() {
    Config config = new MapConfig(ImmutableMap.of());
    new NodeOptions(config).configure(tracer, clientFactory, builderSpy);

    verifyNoInteractions(builderSpy);
  }
}
