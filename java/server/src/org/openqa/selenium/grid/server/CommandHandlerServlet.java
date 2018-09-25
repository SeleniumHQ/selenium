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

import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.nio.charset.StandardCharsets.UTF_8;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.injector.Injector;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Predicate;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

class CommandHandlerServlet extends HttpServlet {

  private final static Json JSON = new Json();
  private final Map<Predicate<HttpRequest>, BiFunction<Injector, HttpRequest, CommandHandler>>
      handlers;
  private final Injector injector;
  private final ErrorCodes errors = new ErrorCodes();

  public CommandHandlerServlet(
      Injector injector,
      Map<Predicate<HttpRequest>, BiFunction<Injector, HttpRequest, CommandHandler>> handlers) {
    this.injector = Objects.requireNonNull(injector);
    this.handlers = Objects.requireNonNull(handlers);
  }

  @Override
  protected void service(HttpServletRequest req, HttpServletResponse resp) throws IOException {

    HttpRequest request = new ServletRequestWrappingHttpRequest(req);
    HttpResponse response = new ServletResponseWrappingHttpResponse(resp);

    BiFunction<Injector, HttpRequest, CommandHandler> generator = handlers.entrySet().stream()
        .filter(entry -> entry.getKey().test(request))
        .map(Map.Entry::getValue)
        .findFirst()
        .orElse((inj, ignored) -> (in, out) -> {
          throw new UnsupportedCommandException(
              String.format("Unable to find command matching (%s) %s",
                            request.getMethod(),
                            request.getUri()));
        });

    try {
      generator.apply(injector, request).execute(request, response);
    } catch (Throwable e) {
      // Fair enough. Attempt to convert the exception to something useful.
      response.setStatus(errors.getHttpStatusCode(e));

      response.setHeader("Content-Type", JSON_UTF_8.toString());
      response.setHeader("Cache-Control", "none");

      response.setContent(
          JSON.toJson(ImmutableMap.of("status", errors.toStatusCode(e), "value", e))
              .getBytes(UTF_8));
    }
  }
}
