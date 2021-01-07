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

package org.openqa.selenium.grid.log;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.trace.SpanProcessor;
import io.opentelemetry.sdk.trace.TracerSdkManagement;
import io.opentelemetry.sdk.trace.data.SpanData;
import io.opentelemetry.sdk.trace.data.SpanData.Event;
import io.opentelemetry.sdk.trace.export.SimpleSpanProcessor;
import io.opentelemetry.sdk.trace.export.SpanExporter;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.remote.tracing.empty.NullTracer;
import org.openqa.selenium.remote.tracing.opentelemetry.OpenTelemetryTracer;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.io.UnsupportedEncodingException;
import java.util.Arrays;
import java.util.Collection;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogManager;
import java.util.logging.Logger;

public class LoggingOptions {

  private static final Logger LOG = Logger.getLogger(LoggingOptions.class.getName());
  private static final String LOGGING_SECTION = "logging";

  // We obtain the underlying tracer instance from the singleton instance
  // that OpenTelemetry maintains. If we blindly grabbed the tracing provider
  // and configured it, then subsequent calls would add duplicate exporters.
  // To avoid this, stash the configured tracer on a static and weep for
  // humanity. This implies that we're never going to need to configure
  // tracing more than once for the entire JVM, so we're never going to be
  // adding unit tests for this.
  private static volatile Tracer tracer;

  public static final Json JSON = new Json();

  private Level level = Level.INFO;

  private final Config config;

  public LoggingOptions(Config config) {
    this.config = Require.nonNull("Config", config);
  }

  public boolean isUsingStructuredLogging() {
    return config.getBool(LOGGING_SECTION, "structured-logs").orElse(false);
  }

  public boolean isUsingPlainLogs() {
    return config.getBool(LOGGING_SECTION, "plain-logs").orElse(true);
  }

  public String getLogEncoding() {
    return config.get(LOGGING_SECTION, "log-encoding").orElse(null);
  }

  public void setLoggingLevel() {
    String configLevel = config.get(LOGGING_SECTION, "log-level").orElse(Level.INFO.getName());

    if (Level.ALL.getName().equalsIgnoreCase(configLevel)) {
      level = Level.ALL;
    } else if (Level.CONFIG.getName().equalsIgnoreCase(configLevel)) {
      level = Level.CONFIG;
    } else if (Level.FINE.getName().equalsIgnoreCase(configLevel)) {
      level = Level.FINE;
    } else if (Level.FINER.getName().equalsIgnoreCase(configLevel)) {
      level = Level.FINER;
    } else if (Level.FINEST.getName().equalsIgnoreCase(configLevel)) {
      level = Level.FINEST;
    } else if (Level.OFF.getName().equalsIgnoreCase(configLevel)) {
      level = Level.OFF;
    } else if (Level.SEVERE.getName().equalsIgnoreCase(configLevel)) {
      level = Level.SEVERE;
    } else if (Level.WARNING.getName().equalsIgnoreCase(configLevel)) {
      level = Level.WARNING;
    }
  }

  public Tracer getTracer() {
    boolean tracingEnabled = config.getBool(LOGGING_SECTION, "tracing").orElse(true);
    if (!tracingEnabled) {
      LOG.info("Using null tracer");
      return new NullTracer();
    }

    Tracer localTracer = tracer;
    if (localTracer == null) {
      synchronized (LoggingOptions.class) {
        localTracer = tracer;
        if (localTracer == null) {
          localTracer = createTracer();
          tracer = localTracer;
        }
      }
    }
    return localTracer;
  }

  private Tracer createTracer() {
    LOG.info("Using OpenTelemetry for tracing");
    TracerSdkManagement tracerManagement = OpenTelemetrySdk.getGlobalTracerManagement();

    List<SpanProcessor> exporters = new LinkedList<>();
    exporters.add(SimpleSpanProcessor.builder(new SpanExporter() {
      @Override
      public CompletableResultCode export(Collection<SpanData> spans) {

        spans.forEach(span -> {
          LOG.fine(String.valueOf(span));

          String traceId = span.getTraceId();
          String spanId = span.getSpanId();
          SpanData.Status status = span.getStatus();
          List<Event> eventList = span.getEvents();
          eventList.forEach(event -> {
            Map<String, Object> map = new HashMap<>();
            map.put("eventTime", event.getEpochNanos());
            map.put("traceId", traceId);
            map.put("spanId", spanId);
            map.put("spanKind", span.getKind().toString());
            map.put("eventName", event.getName());

            Attributes attributes = event.getAttributes();
            Map<String, Object> attributeMap = new HashMap<>();

            attributes.forEach(
              (attributeKey, value) -> attributeMap.put(attributeKey.getKey(), value));
            map.put("attributes", attributeMap);
            String jsonString = getJsonString(map);
            if (status.isOk()) {
              LOG.log(Level.INFO, jsonString);
            } else {
              LOG.log(Level.WARNING, jsonString);
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
    }).build());

    // The Jaeger exporter doesn't yet have a `TracerFactoryProvider`, so we
    //shall look up the class using reflection, and beg for forgiveness
    // later.
    Optional<SpanExporter> maybeJaeger = JaegerTracing.findJaegerExporter();
    maybeJaeger.ifPresent(
      exporter -> exporters.add(SimpleSpanProcessor.builder(exporter).build()));
    tracerManagement.addSpanProcessor(SpanProcessor.composite(exporters));

    // OpenTelemetry default propagators are no-op since version 0.9.0.
    // Hence, required propagators need to defined and added.
    ContextPropagators propagators = ContextPropagators.create(
      TextMapPropagator.composite(W3CTraceContextPropagator.getInstance()));

    return new OpenTelemetryTracer(
      OpenTelemetry.getGlobalTracer("default"),
      propagators.getTextMapPropagator());
  }

  public void configureLogging() {
    if (!config.getBool(LOGGING_SECTION, "enable").orElse(true)) {
      return;
    }

    // Remove all handlers from existing loggers
    LogManager logManager = LogManager.getLogManager();
    Enumeration<String> names = logManager.getLoggerNames();
    while (names.hasMoreElements()) {
      Logger logger = logManager.getLogger(names.nextElement());
      if (logger == null) {
        continue;
      }

      Arrays.stream(logger.getHandlers()).forEach(logger::removeHandler);
    }

    // Now configure the root logger, since everything should flow up to that
    Logger logger = logManager.getLogger("");
    setLoggingLevel();
    logger.setLevel(level);
    OutputStream out = getOutputStream();
    String encoding = getLogEncoding();

    if (isUsingPlainLogs()) {
      Handler handler = new FlushingHandler(out);
      handler.setFormatter(new TerseFormatter());
      handler.setLevel(level);
      configureLogEncoding(logger, encoding, handler);
    }

    if (isUsingStructuredLogging()) {
      Handler handler = new FlushingHandler(out);
      handler.setFormatter(new JsonFormatter());
      handler.setLevel(level);
      configureLogEncoding(logger, encoding, handler);
    }
  }

  private void configureLogEncoding(Logger logger, String encoding, Handler handler) {
    String message;
    try {
      if (encoding != null) {
        handler.setEncoding(encoding);
        message = String.format("Using encoding %s", encoding);
      } else {
        message = "Using the system default encoding";
      }
    } catch (UnsupportedEncodingException e) {
      message =
          String.format("Using the system default encoding. Unsupported encoding %s", encoding);
    }
    logger.addHandler(handler);
    logger.log(Level.INFO, message);
  }

  private OutputStream getOutputStream() {
    return config.get(LOGGING_SECTION, "log-file")
        .map(fileName -> {
          try {
            return (OutputStream) new FileOutputStream(fileName);
          } catch (FileNotFoundException e) {
            throw new UncheckedIOException(e);
          }
        })
        .orElse(System.out);
  }

  private String getJsonString(Map<String, Object> map) {
    StringBuilder text = new StringBuilder();
    try (JsonOutput json = JSON.newOutput(text).setPrettyPrint(false)) {
      json.write(map);
      text.append('\n');
    }
    return text.toString();
  }
}
