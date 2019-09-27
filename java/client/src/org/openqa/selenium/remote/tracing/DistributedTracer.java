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

import io.opentracing.contrib.tracerresolver.TracerResolver;
import io.opentracing.noop.NoopTracerFactory;

import java.util.Map;
import java.util.Objects;
import java.util.function.Function;

/**
 * Represents an entry point for accessing all aspects of distributed tracing.
 */
public interface DistributedTracer {

  static Builder builder() {
    return new Builder();
  }

  /**
   * A distributed trace is made of a series of {@link Span}s, which are either
   * independent or have a parent/child relationship. Creating a span will make
   * it the currently active {@code Span}, as returned by
   * {@link #getActiveSpan()}.
   *
   * @param parent The parent span. If this is {@code null}, then the span is
   *               assumed to be independent.
   */
  Span createSpan(String operation, Span parent);

  /**
   * Create a span from a remote context of some type, which will generally be
   * an {@link org.openqa.selenium.remote.http.HttpRequest}.
   */
  <C> Span createSpan(String operationName, C carrier, Function<C, Map<String, String>> extractor);

  /**
   * Get the currently active span, which may be {@code null}.
   */
  Span getActiveSpan();


  class Builder {

    private DistributedTracer tracer;

    private Builder() {
      // Only accessible through the parent class

      this.tracer = new OpenTracingTracer(NoopTracerFactory.create());
    }

    public Builder use(io.opentracing.Tracer openTracingTracer) {
      Objects.requireNonNull(openTracingTracer, "Tracer must be set.");
      tracer = new OpenTracingTracer(openTracingTracer);
      return this;
    }

    public Builder detect() {
      // Checking the global tracer is futile --- it defaults to a no-op instance.
      try {
        this.tracer = new OpenTracingTracer(TracerResolver.resolveTracer());
      } catch (Throwable e) {
        // Fine. Leave the tracer as it is.
      }

      return this;
    }

    public DistributedTracer build() {
      return tracer;
    }
  }
}
