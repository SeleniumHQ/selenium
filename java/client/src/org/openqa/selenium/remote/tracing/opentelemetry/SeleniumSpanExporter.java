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

import com.google.auto.service.AutoService;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.trace.StatusCode;
import io.opentelemetry.sdk.autoconfigure.spi.SdkTracerProviderConfigurer;
import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.trace.SdkTracerProviderBuilder;
import io.opentelemetry.sdk.trace.data.EventData;
import io.opentelemetry.sdk.trace.data.SpanData;
import io.opentelemetry.sdk.trace.export.SimpleSpanProcessor;
import io.opentelemetry.sdk.trace.export.SpanExporter;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.tracing.Span;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

@AutoService(SdkTracerProviderConfigurer.class)
public class SeleniumSpanExporter implements SdkTracerProviderConfigurer {
  private static final Logger LOG = Logger.getLogger(SeleniumSpanExporter.class.getName());
  private final boolean httpLogs = OpenTelemetryTracer.getHttpLogs();

  @Override
  public void configure(SdkTracerProviderBuilder tracerProvider) {
    tracerProvider.addSpanProcessor(SimpleSpanProcessor.create(new SpanExporter() {
      @Override
      public CompletableResultCode export(Collection<SpanData> spans) {
        spans.forEach(span -> {
          LOG.fine(String.valueOf(span));

          String traceId = span.getTraceId();
          List<EventData> eventList = span.getEvents();

          Level logLevel = getLogLevel(span);

          eventList.forEach(event -> {
            Map<String, Object> map = new HashMap<>();
            map.put("eventTime", event.getEpochNanos());
            map.put("traceId", traceId);
            map.put("eventName", event.getName());

            Attributes attributes = event.getAttributes();
            map.put("attributes", attributes.asMap());
            String jsonString = getJsonString(map);
            LOG.log(logLevel, jsonString);
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
  }

  private static String getJsonString(Map<String, Object> map) {
    StringBuilder text = new StringBuilder();
    try (JsonOutput json = new Json().newOutput(text).setPrettyPrint(false)) {
      json.write(map);
      text.append('\n');
    }
    return text.toString();
  }

  private Level getLogLevel(SpanData span) {
    Level level = Level.FINE;

    Optional<String> kind = Optional.ofNullable(span
      .getAttributes()
      .get(AttributeKey.stringKey(org.openqa.selenium.remote.tracing.AttributeKey.SPAN_KIND.getKey())));

    if (span.getStatus().getStatusCode() == StatusCode.ERROR) {
      level = Level.WARNING;
    } else {
      if (httpLogs && kind.isPresent()) {
        String kindValue = kind.get();
        if (Span.Kind.SERVER.name().equalsIgnoreCase(kindValue) ||
          Span.Kind.CLIENT.name().equalsIgnoreCase(kindValue)) {
          level = Level.INFO;
        }
      }
    }
    return level;
  }
}
