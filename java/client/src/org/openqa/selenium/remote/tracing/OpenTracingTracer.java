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

import io.opentracing.SpanContext;
import io.opentracing.Tracer;
import io.opentracing.propagation.Format;
import io.opentracing.propagation.TextMapAdapter;

import java.util.Map;
import java.util.Objects;
import java.util.function.Function;

class OpenTracingTracer implements DistributedTracer {

  private final Tracer delegate;

  public OpenTracingTracer(Tracer delegate) {
    this.delegate = Objects.requireNonNull(delegate);
  }

  @Override
  public Span createSpan(String operation, Span parent) {
    SpanContext context = null;
    if (parent instanceof OpenTracingSpan) {
      context = ((OpenTracingSpan) parent).getContext();
    }

    io.opentracing.Span span = delegate.buildSpan(operation).asChildOf(context).start();
    delegate.scopeManager().activate(span);
    OpenTracingSpan toReturn = new OpenTracingSpan(delegate, span);
    toReturn.activate();
    return toReturn;
  }

  @Override
  public <C> Span createSpan(
      String operationName,
      C carrier,
      Function<C, Map<String, String>> extractor) {
    Map<String, String> map = extractor.apply(carrier);

    SpanContext context = delegate.extract(
        Format.Builtin.HTTP_HEADERS,
        new TextMapAdapter(map));

    io.opentracing.Span span = delegate.buildSpan(operationName).asChildOf(context).start();
    delegate.scopeManager().activate(span);
    OpenTracingSpan toReturn = new OpenTracingSpan(delegate, span);
    toReturn.activate();
    return toReturn;
  }

  @Override
  public Span getActiveSpan() {
    io.opentracing.Span span = delegate.activeSpan();
    return span == null ? null : new OpenTracingSpan(delegate, span);
  }

  @Override
  public String toString() {
    return "OpenTracing(" + delegate.getClass().getSimpleName() + ")";
  }
}
