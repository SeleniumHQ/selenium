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

package org.openqa.selenium.jetty.server;

import org.junit.Test;
import org.openqa.selenium.grid.web.ErrorCodec;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;
import org.openqa.testing.FakeHttpServletRequest;
import org.openqa.testing.FakeHttpServletResponse;
import org.openqa.testing.UrlInfo;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Map;
import java.util.function.Function;

import static java.net.HttpURLConnection.HTTP_OK;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class HttpHandlerServletTest {

  private final Function<HttpRequest, HttpServletRequest> requestConverter =
      req -> {
        FakeHttpServletRequest servletRequest = new FakeHttpServletRequest(
            req.getMethod().name(),
            new UrlInfo("http://localhost:4444", "/", req.getUri()));
        servletRequest.setBody(string(req));
        return servletRequest;
      };

  private final Function<FakeHttpServletResponse, Throwable> extractThrowable =
      res -> {
        Map<String, Object> response = new Json().toType(res.getBody(), MAP_TYPE);
        try {
          return ErrorCodec.createDefault().decode(response);
        } catch (IllegalArgumentException ignored) {
          fail("Apparently the command succeeded" + res.getBody());
          return null;
        }
      };

  @Test
  public void shouldReturnValueFromHandlerIfUrlMatches() throws IOException {
    String cheerfulGreeting = "Hello, world!";

    HttpHandlerServlet servlet = new HttpHandlerServlet(
        Route.matching(req -> true)
            .to(() -> req -> new HttpResponse().setContent(utf8String(cheerfulGreeting))));

    HttpServletRequest request = requestConverter.apply(new HttpRequest(GET, "/hello-world"));
    FakeHttpServletResponse response = new FakeHttpServletResponse();

    servlet.service(request, response);

    assertThat(response.getStatus()).isEqualTo(HTTP_OK);
    assertThat(response.getBody()).isEqualTo(cheerfulGreeting);
  }
}
