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

package org.openqa.selenium.grid.server;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.openqa.selenium.UnableToSetCookieException;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.injector.Injector;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.ErrorHandler;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.testing.FakeHttpServletRequest;
import org.openqa.testing.FakeHttpServletResponse;
import org.openqa.testing.UrlInfo;

import java.io.IOException;
import java.util.function.Function;

import javax.servlet.http.HttpServletRequest;

public class CommandHandlerServletTest {

  private final Function<HttpRequest, HttpServletRequest> requestConverter =
      req -> {
        FakeHttpServletRequest servletRequest = new FakeHttpServletRequest(
            req.getMethod().name(),
            new UrlInfo("http://localhost:4444", "/", req.getUri()));
        if (req.getContentString() != null) {
          servletRequest.setBody(req.getContentString());
        }
        return servletRequest;
      };

  private final Function<FakeHttpServletResponse, Throwable> extractThrowable =
      res -> {
        Response response = new Json().toType(res.getBody(), Response.class);
        try {
          new ErrorHandler(true).throwIfResponseFailed(response, 100);
        } catch (Throwable thrown) {
          return thrown;
        }
        fail("Apparently the command succeeded" + res.getBody());
        return null;
      };

  @Test
  public void shouldReturnValueFromHandlerIfUrlMatches() throws IOException {
    String cheerfulGreeting = "Hello, world!";

    Injector injector = Injector.builder().register(new Json()).build();

    CommandHandlerServlet servlet = new CommandHandlerServlet(
        injector,
        ImmutableMap.of(
            (req) -> true, (inj, ingored) ->
                (req, res) -> res.setContent(cheerfulGreeting.getBytes(UTF_8))));

    HttpServletRequest request = requestConverter.apply(new HttpRequest(GET, "/hello-world"));
    FakeHttpServletResponse response = new FakeHttpServletResponse();

    servlet.service(request, response);

    assertThat(response.getStatus()).isEqualTo(HTTP_OK);
    assertThat(response.getBody()).isEqualTo(cheerfulGreeting);
  }

  @Test
  public void shouldCorrectlyReturnAnUnknownCommandExceptionForUnmappableUrls() throws IOException {
    Injector injector = Injector.builder().register(new Json()).build();

    CommandHandlerServlet servlet = new CommandHandlerServlet(injector, ImmutableMap.of());

    HttpServletRequest request = requestConverter.apply(new HttpRequest(GET, "/missing"));
    FakeHttpServletResponse response = new FakeHttpServletResponse();

    servlet.service(request, response);

    Throwable thrown = extractThrowable.apply(response);
    assertThat(thrown).isInstanceOf(UnsupportedCommandException.class);
  }

  @Test
  public void exceptionsThrownByHandlersAreConvertedToAProperPayload() throws IOException {
    Injector injector = Injector.builder().register(new Json()).build();

    CommandHandlerServlet servlet = new CommandHandlerServlet(
        injector,
        ImmutableMap.of(
            req -> true,
            (inj, ignored) -> (req, res) -> {
              throw new UnableToSetCookieException("Yowza");
            }));

    HttpServletRequest request = requestConverter.apply(new HttpRequest(GET, "/exceptional"));
    FakeHttpServletResponse response = new FakeHttpServletResponse();

    servlet.service(request, response);

    assertThat(response.getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);
    Throwable thrown = extractThrowable.apply(response);
    assertThat(thrown).isInstanceOf(UnableToSetCookieException.class);
    assertThat(thrown.getMessage()).startsWith("Yowza");
  }

}