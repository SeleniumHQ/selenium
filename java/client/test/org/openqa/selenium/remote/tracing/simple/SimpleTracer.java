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

package org.openqa.selenium.remote.tracing.simple;

import io.opentracing.Scope;
import io.opentracing.ScopeManager;
import io.opentracing.Span;
import io.opentracing.SpanContext;
import io.opentracing.Tracer;
import io.opentracing.propagation.Format;
import io.opentracing.propagation.TextMap;
import io.opentracing.util.ThreadLocalScopeManager;

import java.util.Map;
import java.util.UUID;

/**
 * Unlike the default no-op {@link Tracer} that ships with opentracing's apis, this implementation
 * has lightweight implementations of the basic functionality. This allows us to actually write
 * meaningful unit tests of tracing functionality without requiring us to have an implementation
 * available.
 */
public class SimpleTracer implements Tracer {

  private final UUID traceId = UUID.randomUUID();
  private final ScopeManager scopeManager = new ThreadLocalScopeManager();

  @Override
  public ScopeManager scopeManager() {
    return scopeManager;
  }

  @Override
  public Span activeSpan() {
    return scopeManager().activeSpan();
  }

  @Override
  public Scope activateSpan(Span span) {
    return scopeManager().activate(span);
  }

  @Override
  public SpanBuilder buildSpan(String operationName) {
    return new SimpleSpanBuilder(scopeManager(), operationName);
  }

  @Override
  public <C> void inject(SpanContext spanContext, Format<C> format, C carrier) {
    if (!(Format.Builtin.HTTP_HEADERS.equals(format) ||
        Format.Builtin.TEXT_MAP.equals(format))) {
      throw new UnsupportedOperationException("Unknown format: " + format);
    }

    TextMap map = (TextMap) carrier;
    spanContext.baggageItems().forEach(entry -> map.put(entry.getKey(), entry.getValue()));
    map.put("trace-id", traceId.toString());
  }

  @Override
  public <C> SpanContext extract(Format<C> format, C carrier) {
    if (!(Format.Builtin.HTTP_HEADERS.equals(format) ||
          Format.Builtin.TEXT_MAP.equals(format))) {
      throw new UnsupportedOperationException("Unknown format: " + format);
    }

    TextMap map = (TextMap) carrier;

    Span span = buildSpan("unknown").start();
    for (Map.Entry<String, String> entry : map) {
      span.setBaggageItem(entry.getKey(), entry.getValue());
    }
    span.setBaggageItem("trace-id", traceId.toString());

    return span.context();
  }

  @Override
  public void close() {
  }
}
