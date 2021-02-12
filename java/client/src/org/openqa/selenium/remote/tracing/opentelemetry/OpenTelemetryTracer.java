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

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.trace.StatusCode;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.context.Context;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.trace.SdkTracerProvider;
import io.opentelemetry.sdk.trace.SpanProcessor;
import io.opentelemetry.sdk.trace.data.EventData;
import io.opentelemetry.sdk.trace.data.SpanData;
import io.opentelemetry.sdk.trace.data.StatusData;
import io.opentelemetry.sdk.trace.export.SimpleSpanProcessor;
import io.opentelemetry.sdk.trace.export.SpanExporter;

import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.tracing.Propagator;
import org.openqa.selenium.remote.tracing.TraceContext;

import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

public class OpenTelemetryTracer implements org.openqa.selenium.remote.tracing.Tracer {

  private static final Logger LOG = Logger.getLogger(OpenTelemetryTracer.class.getName());

  // We obtain the underlying tracer instance from the singleton instance
  // that OpenTelemetry maintains. If we blindly grabbed the tracing provider
  // and configured it, then subsequent calls would add duplicate exporters.
  // To avoid this, stash the configured tracer on a static and weep for
  // humanity. This implies that we're never going to need to configure
  // tracing more than once for the entire JVM, so we're never going to be
  // adding unit tests for this.
  private static volatile OpenTelemetryTracer singleton;

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
    List<SpanProcessor> exporters = new LinkedList<>();
    exporters.add(SimpleSpanProcessor.create(new SpanExporter() {
      @Override
      public CompletableResultCode export(Collection<SpanData> spans) {

        spans.forEach(span -> {
          LOG.fine(String.valueOf(span));

          String traceId = span.getTraceId();
          String spanId = span.getSpanId();
          StatusData status = span.getStatus();
          List<EventData> eventList = span.getEvents();
          eventList.forEach(event -> {
            Map<String, Object> map = new HashMap<>();
            map.put("eventTime", event.getEpochNanos());
            map.put("traceId", traceId);
            map.put("spanId", spanId);
            map.put("spanKind", span.getKind().toString());
            map.put("eventName", event.getName());

            Attributes attributes = event.getAttributes();
            map.put("attributes", attributes.asMap());
            String jsonString = getJsonString(map);
            if (status.getStatusCode() == StatusCode.ERROR) {
              LOG.log(Level.WARNING, jsonString);
            } else {
              LOG.log(Level.FINE, jsonString);
            }
          });
        });
        return CompletableResultCode.ofSuccess();
      }

      @Override
      public CompletableResultCode flush() {
        return CompletableResultCode.ofSuccess();
      }

      @Override
      public CompletableResultCode shutdown() {
        // no-op
        return CompletableResultCode.ofSuccess();
      }
    }));

    // The Jaeger exporter doesn't yet have a `TracerFactoryProvider`, so we
    // shall look up the class using reflection, and beg for forgiveness
    // later.
    Optional<SpanExporter> maybeJaeger = JaegerTracing.findJaegerExporter();
    maybeJaeger.ifPresent(
      exporter -> exporters.add(SimpleSpanProcessor.create(exporter)));

    // OpenTelemetry default propagators are no-op since version 0.9.0.
    // Hence, required propagators need to defined and added.
    ContextPropagators propagators =
      ContextPropagators.create((W3CTraceContextPropagator.getInstance()));

    SdkTracerProvider sdkTracerProvider = SdkTracerProvider.builder()
      .addSpanProcessor(SpanProcessor.composite(exporters))
      .build();

    OpenTelemetrySdk openTelemetrySdk = OpenTelemetrySdk.builder()
      .setTracerProvider(sdkTracerProvider)
      .setPropagators(propagators)
      .buildAndRegisterGlobal();

    Runtime.getRuntime()
      .addShutdownHook(new Thread(() -> openTelemetrySdk.getTracerManagement().shutdown()));

    return new OpenTelemetryTracer(
      openTelemetrySdk.getTracer("default"),
      propagators.getTextMapPropagator());
  }

  private static String getJsonString(Map<String, Object> map) {
    StringBuilder text = new StringBuilder();
    try (JsonOutput json = new Json().newOutput(text).setPrettyPrint(false)) {
      json.write(map);
      text.append('\n');
    }
    return text.toString();
  }

  private final Tracer tracer;
  private final OpenTelemetryPropagator telemetryPropagator;

  public OpenTelemetryTracer(Tracer tracer, TextMapPropagator textMapPropagator) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.telemetryPropagator = new OpenTelemetryPropagator(
      tracer, Require.nonNull("Formatter", textMapPropagator));
  }

  @Override
  public TraceContext getCurrentContext() {
    return new OpenTelemetryContext(tracer, Context.current());
  }

  @Override
  public Propagator getPropagator() {
    return telemetryPropagator;
  }
}
