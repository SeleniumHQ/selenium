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

import com.google.common.base.Preconditions;
import io.opentelemetry.context.propagation.HttpTextFormat;
import io.opentelemetry.trace.SpanContext;
import io.opentelemetry.trace.Tracer;
import io.opentelemetry.trace.TracingContextUtils;
import org.openqa.selenium.remote.tracing.Propagator;
import org.openqa.selenium.remote.tracing.TraceContext;

import java.util.Objects;
import java.util.function.BiFunction;

class OpenTelemetryPropagator implements Propagator {

  private final Tracer tracer;
  private final HttpTextFormat<SpanContext> httpTextFormat;

  OpenTelemetryPropagator(Tracer tracer, HttpTextFormat<SpanContext> httpTextFormat) {
    this.tracer = Objects.requireNonNull(tracer);
    this.httpTextFormat = Objects.requireNonNull(httpTextFormat);
  }

  @Override
  public <C> void inject(TraceContext toInject, C carrier, Setter<C> setter) {
    Objects.requireNonNull(toInject);
    Objects.requireNonNull(carrier);
    Objects.requireNonNull(setter);

    Preconditions.checkArgument(
      toInject instanceof OpenTelemetryContext, "Expected OpenTelemetry to be used: " + toInject);

    httpTextFormat.inject(
      ((OpenTelemetryContext) toInject).getContext(), carrier, setter::set);
  }

  @Override
  public <C> OpenTelemetryContext extractContext(
    TraceContext existing, C carrier, BiFunction<C, String, String> getter) {
    Objects.requireNonNull(existing);
    Objects.requireNonNull(carrier);
    Objects.requireNonNull(getter);

    Preconditions.checkArgument(
      existing instanceof OpenTelemetryContext, "Expected OpenTelemetry to be used: " + existing);

    SpanContext extracted = httpTextFormat.extract(carrier, getter::apply);

    // If the extracted context is the root context, then we continue to be a
    // child span of the existing context.
    if (extracted == null || SpanContext.getInvalid().getSpanId().equals(extracted.getSpanId())) {
      return (OpenTelemetryContext) existing;
    }

    return new OpenTelemetryContext(tracer, extracted);
  }
}
