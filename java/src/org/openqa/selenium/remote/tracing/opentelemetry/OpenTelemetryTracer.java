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

import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Context;
import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk;
import java.util.logging.Logger;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.tracing.Propagator;
import org.openqa.selenium.remote.tracing.TraceContext;

public class OpenTelemetryTracer implements org.openqa.selenium.remote.tracing.Tracer {

  private static final Logger LOG = Logger.getLogger(OpenTelemetryTracer.class.getName());
  private static boolean HTTP_LOGS;

  // We obtain the underlying tracer instance from the singleton instance
  // that OpenTelemetry maintains. If we blindly grabbed the tracing provider
  // and configured it, then subsequent calls would add duplicate exporters.
  // To avoid this, stash the configured tracer on a static and weep for
  // humanity. This implies that we're never going to need to configure
  // tracing more than once for the entire JVM, so we're never going to be
  // adding unit tests for this.
  private static volatile OpenTelemetryTracer singleton;

  public static void setHttpLogs(boolean value) {
    HTTP_LOGS = value;
  }

  public static boolean getHttpLogs() {
    return HTTP_LOGS;
  }

  public static OpenTelemetryTracer getInstance() {
    OpenTelemetryTracer localTracer = singleton;
    if (localTracer == null) {
      synchronized (OpenTelemetryTracer.class) {
        localTracer = singleton;
        if (localTracer == null) {
          localTracer = createTracer();
          singleton = localTracer;
        }
      }
    }
    return localTracer;
  }

  private static OpenTelemetryTracer createTracer() {
    LOG.info("Using OpenTelemetry for tracing");

    // Default exporter for traces and metrics is OTLP 0.17.0 onwards.
    // If the metrics exporter property is not set to none, external dependency is required.
    System.setProperty("otel.metrics.exporter", "none");
    String exporter = System.getProperty("otel.traces.exporter");
    if (exporter == null) {
      System.setProperty("otel.traces.exporter", "none");
    }
    OpenTelemetrySdk autoConfiguredSdk =
        AutoConfiguredOpenTelemetrySdk.builder()
            .addTracerProviderCustomizer(
                ((sdkTracerProviderBuilder, configProperties) ->
                    sdkTracerProviderBuilder.addSpanProcessor(
                        SeleniumSpanExporter.getSpanProcessor())))
            .build()
            .getOpenTelemetrySdk();

    return new OpenTelemetryTracer(
        autoConfiguredSdk.getTracer("default"),
        autoConfiguredSdk.getPropagators().getTextMapPropagator());
  }

  private final Tracer tracer;
  private final OpenTelemetryPropagator telemetryPropagator;
  private Context context;

  public OpenTelemetryTracer(Tracer tracer, TextMapPropagator propagator) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.telemetryPropagator =
        new OpenTelemetryPropagator(tracer, Require.nonNull("Formatter", propagator));
  }

  @Override
  public TraceContext getCurrentContext() {
    return new OpenTelemetryContext(tracer, context != null ? context : Context.current());
  }

  @Override
  public Propagator getPropagator() {
    return telemetryPropagator;
  }

  public void setOpenTelemetryContext(Context context) {
    this.context = context;
  }
}
