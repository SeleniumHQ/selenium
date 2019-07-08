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

package org.openqa.selenium.remote.http;

import java.io.UncheckedIOException;
import java.util.Objects;
import java.util.function.Function;

/**
 * Can be wrapped around an {@link HttpHandler} in order to either modify incoming
 * {@link HttpRequest}s or outgoing {@link HttpResponse}s using the well-known "Filter" pattern.
 * This is very similar to the Servlet spec's {@link javax.servlet.Filter}, but takes advantage of
 * lambdas:
 * <pre>{@code
 * Filter filter = next -> {
 *   return req -> {
 *     req.addHeader("cheese", "brie");
 *     HttpResponse res = next.apply(req);
 *     res.addHeader("vegetable", "peas");
 *     return res;
 *   };
 * }
 * }</pre>
 *
 *<p>Because each filter returns an {@link HttpHandler}, it's easy to do processing before, or after
 * each request, as well as short-circuit things if necessary.
 */
@FunctionalInterface
public interface Filter extends Function<HttpHandler, HttpHandler> {

  default Filter andThen(Filter next) {
    Objects.requireNonNull(next, "Next filter must be set.");

    return req -> apply(next.apply(req));
  }

  default HttpHandler andFinally(HttpHandler end) {
    Objects.requireNonNull(end, "HTTP handler must be set.");

    return request -> Filter.this.apply(end).execute(request);
  }

  default Routable andFinally(Routable end) {
    return new Routable() {

      @Override
      public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
        return Filter.this.apply(end).execute(req);
      }

      @Override
      public boolean matches(HttpRequest req) {
        return end.matches(req);
      }
    };
  }
}
