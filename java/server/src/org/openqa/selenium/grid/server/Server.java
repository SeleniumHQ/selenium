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

import static org.openqa.selenium.remote.http.HttpMethod.DELETE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import org.openqa.selenium.grid.component.HasLifecycle;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.UrlTemplate;
import org.openqa.selenium.injector.Injector;
import org.openqa.selenium.remote.http.HttpRequest;

import java.net.URL;
import java.util.function.BiFunction;
import java.util.function.Predicate;

import javax.servlet.Servlet;

public interface Server<T extends Server> extends HasLifecycle<T> {

  /**
   * Until we can migrate to {@link CommandHandler}s for everything, we leave this escape hatch.
   *
   * @deprecated
   */
  @Deprecated
  void addServlet(Class<? extends Servlet> servlet, String pathSpec);

  /**
   * Until we can migrate to {@link CommandHandler}s for everything, we leave this escape hatch.
   *
   * @deprecated
   */
  @Deprecated
  void addServlet(Servlet servlet, String pathSpec);

  void addHandler(
      Predicate<HttpRequest> selector,
      BiFunction<Injector, HttpRequest, CommandHandler> handler);

  URL getUrl();

  static Predicate<HttpRequest> delete(String template) {
    UrlTemplate urlTemplate = new UrlTemplate(template);
    return req -> DELETE == req.getMethod() && urlTemplate.match(req.getUri()) != null;
  }

  static Predicate<HttpRequest> get(String template) {
    UrlTemplate urlTemplate = new UrlTemplate(template);
    return req -> GET == req.getMethod() && urlTemplate.match(req.getUri()) != null;
  }

  static Predicate<HttpRequest> post(String template) {
    UrlTemplate urlTemplate = new UrlTemplate(template);
    return req -> POST == req.getMethod() && urlTemplate.match(req.getUri()) != null;
  }
}
