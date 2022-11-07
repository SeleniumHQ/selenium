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

package org.openqa.selenium.grid;

import java.util.Optional;
import java.util.function.Supplier;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Tracer;

/**
 * Represents custom routes that can be wired in by a user to customise some aspects of the Grid. A
 * custom route can be wired in via a service loader by doing the following:
 * <ol>
 *   <li>Create a folder named <code>META-INF/services</code></li>
 *   <li>Within the aforementioned folder create a file named
 *   <code>org.openqa.selenium.grid.UserDefinedRoute</code></li>
 *   <li>Add references to fully qualified class names of all classes that implement this interface</li>
 * </ol>
 *
 * The added custom routes would be available in the Grid ecosystem under
 * <code>/admin/</code> URI path.
 */
public interface UserDefinedRoute {

  /**
   * @param config - A {@link Config} object to be injected and which can be used by the custom
   *               route to interact with the configuration.
   */
  void setConfig(Config config);

  /**
   * @param supplier - A {@link Supplier} that can optionally provide a reference to a
   *                 {@link Tracer} instance to perform/integrate tracing aspects to custom routes
   *                 built by the user.
   */
  void setTracer(Supplier<Optional<Tracer>> supplier);

  /**
   * A route that handles <code>GET</code> requests.
   *
   * @param request - A {@link HttpRequest} that represents the input request.
   * @return - A {@link HttpResponse} that represents the response.
   */
  HttpResponse get(HttpRequest request);

  /**
   * A route that handles <code>POST</code> requests.
   *
   * @param request - A {@link HttpRequest} that represents the input request.
   * @return - A {@link HttpResponse} that represents the response.
   */
  HttpResponse post(HttpRequest request);

  /**
   * A route that handles <code>DELETE</code> requests.
   *
   * @param request - A {@link HttpRequest} that represents the input request.
   * @return - A {@link HttpResponse} that represents the response.
   */
  HttpResponse delete(HttpRequest request);

  /**
   * A route that handles <code>OPTIONS</code> requests.
   *
   * @param request - A {@link HttpRequest} that represents the input request.
   * @return - A {@link HttpResponse} that represents the response.
   */
  HttpResponse options(HttpRequest request);

  /**
   * @return - The URL for which the current route is applicable.
   */
  String url();
}
