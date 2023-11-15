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

package org.openqa.selenium.remote.tracing.opentelemetry;

import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Context;
import io.opentelemetry.context.propagation.TextMapGetter;
import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.context.propagation.TextMapSetter;
import java.util.function.BiFunction;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.tracing.Propagator;
import org.openqa.selenium.remote.tracing.TraceContext;

class OpenTelemetryPropagator implements Propagator {

  private final Tracer tracer;
  private final TextMapPropagator httpTextFormat;

  OpenTelemetryPropagator(Tracer tracer, TextMapPropagator httpTextFormat) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.httpTextFormat = Require.nonNull("HTTP text injector/extractor", httpTextFormat);
  }

  @Override
  public <C> void inject(TraceContext toInject, C carrier, Setter<C> setter) {
    Require.nonNull("Trace context to inject to", toInject);
    Require.nonNull("Carrier", carrier);
    Require.nonNull("Setter", setter);
    Require.argument("Trace context", toInject).instanceOf(OpenTelemetryContext.class);

    TextMapSetter<C> propagatorSetter = setter::set;

    httpTextFormat.inject(
        ((OpenTelemetryContext) toInject).getContext(), carrier, propagatorSetter);
  }

  @Override
  public <C> OpenTelemetryContext extractContext(
      TraceContext existing, C carrier, BiFunction<C, String, String> getter) {
    Require.nonNull("Trace context to extract from", existing);
    Require.nonNull("Carrier", carrier);
    Require.nonNull("Getter", getter);
    Require.argument("Trace context", existing).instanceOf(OpenTelemetryContext.class);

    TextMapGetter<C> propagatorGetter =
        new TextMapGetter<C>() {

          @Override
          public Iterable<String> keys(C carrier) {
            return null;
          }

          @Override
          public String get(C carrier, String key) {
            return getter.apply(carrier, key);
          }
        };

    Context extracted =
        httpTextFormat.extract(
            ((OpenTelemetryContext) existing).getContext(), carrier, propagatorGetter);

    // If the extracted context is the root context, then we continue to be a
    // child span of the existing context.
    String id = Span.fromContext(extracted).getSpanContext().getSpanId();
    if (Span.getInvalid().getSpanContext().getSpanId().equals(id)) {
      return (OpenTelemetryContext) existing;
    }

    return new OpenTelemetryContext(tracer, extracted);
  }
}
