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

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.grid.server.Server.get;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.openqa.selenium.injector.Injector;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;

public class CompoundHandlerTest {

  @Test
  public void ifTwoHandlersRespondToTheSameRequestTheLastOneAddedWillBeUsed() throws IOException {
    CommandHandler handler = new CompoundHandler(
        Injector.builder().build(),
        // Insertion order is preserved with an ImmutableMap
        ImmutableMap.of(
            get("/status"), (inj, ignored) -> (req, res) -> res.setContent("one".getBytes(UTF_8)),
            get("/status"), (inj, ignored) -> (req, res) -> res.setContent("two".getBytes(UTF_8))));

    HttpRequest request = new HttpRequest(GET, "/status");
    HttpResponse response = new HttpResponse();

    handler.execute(request, response);

    assertThat(response.getContentString()).isEqualTo("two");
  }
}