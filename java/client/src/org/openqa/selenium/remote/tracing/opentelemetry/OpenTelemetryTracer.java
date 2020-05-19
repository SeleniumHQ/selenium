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
import io.opentelemetry.trace.Tracer;

import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.tracing.Propagator;
import org.openqa.selenium.remote.tracing.TraceContext;

public class OpenTelemetryTracer implements org.openqa.selenium.remote.tracing.Tracer {
  private final Tracer tracer;
  private final OpenTelemetryPropagator telemetryFormat;

  public OpenTelemetryTracer(Tracer tracer, HttpTextFormat httpTextFormat) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.telemetryFormat = new OpenTelemetryPropagator(
        tracer, Require.nonNull("Formatter", httpTextFormat));
  }

  @Override
  public TraceContext getCurrentContext() {
    return new OpenTelemetryContext(tracer, Context.current());
  }

  @Override
  public Propagator getPropagator() {
    return telemetryFormat;
  }
}
