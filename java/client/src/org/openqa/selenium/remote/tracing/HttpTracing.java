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

package org.openqa.selenium.remote.tracing;

import org.openqa.selenium.remote.http.HttpRequest;

import java.util.Objects;
import java.util.logging.Logger;

public class HttpTracing {

  private static final Logger LOG = Logger.getLogger(HttpTracing.class.getName());

  private HttpTracing() {
    // Utility classes
  }

  private static TraceContext extract(Tracer tracer, HttpRequest request) {
    Objects.requireNonNull(tracer, "Tracer to use must be set.");
    Objects.requireNonNull(request, "Request must be set.");

    return tracer.getPropagator().extractContext(tracer.getCurrentContext(), request, (req, key) -> req.getHeader(key));
  }

  public static Span newSpanAsChildOf(Tracer tracer, HttpRequest request, String name) {
    Objects.requireNonNull(tracer, "Tracer to use must be set.");
    Objects.requireNonNull(request, "Request must be set.");
    Objects.requireNonNull(name, "Name to use must be set.");

    TraceContext parent = extract(tracer, request);
    return parent.createSpan(name);
  }

  public static void inject(Tracer tracer, TraceContext context, HttpRequest request) {
    if (context == null) {
      // Do nothing.
      return;
    }

    Objects.requireNonNull(tracer, "Tracer to use must be set.");
    Objects.requireNonNull(request, "Request must be set.");

    StackTraceElement caller = Thread.currentThread().getStackTrace()[2];
    LOG.fine(String.format("Injecting %s into %s at %s:%d", request, context, caller.getClassName(), caller.getLineNumber()));

    tracer.getPropagator().inject(context, request, (req, key, value) -> req.setHeader(key, value));
  }
}
