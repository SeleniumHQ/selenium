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

import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpRequest;

public class HttpTracing {

  private static final Logger LOG = Logger.getLogger(HttpTracing.class.getName());

  private HttpTracing() {
    // Utility classes
  }

  private static TraceContext extract(Tracer tracer, HttpRequest request) {
    Require.nonNull("Tracer", tracer);
    Require.nonNull("Request", request);

    return tracer
        .getPropagator()
        .extractContext(tracer.getCurrentContext(), request, (req, key) -> req.getHeader(key));
  }

  public static Span newSpanAsChildOf(Tracer tracer, HttpRequest request, String name) {
    Require.nonNull("Tracer", tracer);
    Require.nonNull("Request", request);
    Require.nonNull("Name", name);

    TraceContext parent = extract(tracer, request);
    return parent.createSpan(name);
  }

  public static void inject(Tracer tracer, TraceContext context, HttpRequest request) {
    if (context == null) {
      // Do nothing.
      return;
    }

    Require.nonNull("Tracer", tracer);
    Require.nonNull("Request", request);

    if (LOG.isLoggable(Level.FINE)) {
      StackTraceElement caller = Thread.currentThread().getStackTrace()[2];
      LOG.log(
          Level.FINE,
          "Injecting {0} into {1} at {2}:{3}",
          new Object[] {request, context, caller.getClassName(), caller.getLineNumber()});
    }

    tracer.getPropagator().inject(context, request, (req, key, value) -> req.setHeader(key, value));
  }
}
