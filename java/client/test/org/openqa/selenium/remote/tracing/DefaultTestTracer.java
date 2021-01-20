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

import io.opentelemetry.api.DefaultOpenTelemetry;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.context.propagation.TextMapPropagator;
import org.openqa.selenium.remote.tracing.opentelemetry.OpenTelemetryTracer;

public class DefaultTestTracer {

  public static Tracer createTracer() {
    ContextPropagators propagators = ContextPropagators.create(
      TextMapPropagator.composite(W3CTraceContextPropagator.getInstance()));

    return new OpenTelemetryTracer(
      DefaultOpenTelemetry.builder().build().getTracer("default"),
      propagators.getTextMapPropagator());
  }
}
