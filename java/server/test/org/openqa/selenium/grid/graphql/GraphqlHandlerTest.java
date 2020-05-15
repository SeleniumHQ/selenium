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

package org.openqa.selenium.grid.graphql;

import org.junit.Test;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class GraphqlHandlerTest {

  @Test
  public void bootstrap() {
    Tracer tracer = DefaultTestTracer.createTracer();
    EventBus events = new GuavaEventBus();
    HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();

    SessionMap sessions = new LocalSessionMap(tracer, events);
    Distributor distributor = new LocalDistributor(tracer, events, clientFactory, sessions, null);
    String publicUrl = "http://example.com/grid-o-matic";

    GraphqlHandler handler = new GraphqlHandler(distributor, publicUrl);

    HttpResponse res = handler.execute(
      new HttpRequest(GET, "/graphql")
        .setContent(Contents.utf8String("query { grid { url } }")));

    Object url = get(res, "grid", "url");

    assertThat(url).isEqualTo(publicUrl);
  }

  private Object get(HttpResponse input, String... path) {
    Map<String, Object> value = new Json().toType(Contents.string(input), MAP_TYPE);
    Map<?, ?> current = (Map<?, ?>) value.get("data");

    for (int i = 0; i < path.length -1; i++) {
      current = (Map<?, ?>) current.get(path[i]);
    }

    return current.get(path[path.length - 1]);
  }
}
