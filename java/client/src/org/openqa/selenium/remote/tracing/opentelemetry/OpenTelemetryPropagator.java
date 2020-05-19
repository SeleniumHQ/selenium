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

import io.grpc.Context;
import io.opentelemetry.context.propagation.HttpTextFormat;
import io.opentelemetry.trace.DefaultSpan;
import io.opentelemetry.trace.SpanId;
import io.opentelemetry.trace.Tracer;
import io.opentelemetry.trace.TracingContextUtils;

import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.tracing.Propagator;
import org.openqa.selenium.remote.tracing.TraceContext;

import java.util.function.BiFunction;

class OpenTelemetryPropagator implements Propagator {

  private final Tracer tracer;
  private final HttpTextFormat httpTextFormat;

  OpenTelemetryPropagator(Tracer tracer, HttpTextFormat httpTextFormat) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.httpTextFormat = Require.nonNull("HTTP text injector/extractor", httpTextFormat);
  }

  @Override
  public <C> void inject(TraceContext toInject, C carrier, Setter<C> setter) {
    Require.nonNull("Trace context to inject to", toInject);
    Require.nonNull("Carrier", carrier);
    Require.nonNull("Setter", setter);
    Require.argument("Trace context", toInject).instanceOf(OpenTelemetryContext.class);

    httpTextFormat.inject(
      ((OpenTelemetryContext) toInject).getContext(), carrier, setter::set);
  }

  @Override
  public <C> OpenTelemetryContext extractContext(
    TraceContext existing, C carrier, BiFunction<C, String, String> getter) {
    Require.nonNull("Trace context to extract from", existing);
    Require.nonNull("Carrier", carrier);
    Require.nonNull("Getter", getter);
    Require.argument("Trace context", existing).instanceOf(OpenTelemetryContext.class);

    Context extracted =
      httpTextFormat.extract(
        ((OpenTelemetryContext) existing).getContext(), carrier, getter::apply);

    // If the extracted context is the root context, then we continue to be a
    // child span of the existing context.
    SpanId id = TracingContextUtils.getSpan(extracted).getContext().getSpanId();
    if (DefaultSpan.getInvalid().getContext().getSpanId().equals(id)) {
      return (OpenTelemetryContext) existing;
    }

    return new OpenTelemetryContext(tracer, extracted);
  }
}
