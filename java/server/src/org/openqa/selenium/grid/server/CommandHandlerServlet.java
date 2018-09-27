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

import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.ErrorHandler;
import org.openqa.selenium.injector.Injector;
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

  private final Map<Predicate<HttpRequest>, BiFunction<Injector, HttpRequest, CommandHandler>>
      handlers;
  private final Injector injector;

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

    handlers.entrySet().stream()
        .filter(entry -> entry.getKey().test(request))
        .map(Map.Entry::getValue)
        .findFirst()
        .orElseGet(() -> (i, r) -> {
          Injector child = Injector.builder()
              .parent(i)
              .register(new UnsupportedCommandException(
                  String.format("Unable to find command matching (%s) %s",
                                r.getMethod(),
                                r.getUri())))
              .build();
          return child.newInstance(ErrorHandler.class);
        })
        .apply(injector, request)
        .execute(request, response);
  }
}
