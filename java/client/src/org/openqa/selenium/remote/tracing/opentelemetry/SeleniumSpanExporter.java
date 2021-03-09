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
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.trace.StatusCode;
import io.opentelemetry.sdk.autoconfigure.spi.SdkTracerProviderConfigurer;
import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.trace.SdkTracerProviderBuilder;
import io.opentelemetry.sdk.trace.data.EventData;
import io.opentelemetry.sdk.trace.data.SpanData;
import io.opentelemetry.sdk.trace.data.StatusData;
import io.opentelemetry.sdk.trace.export.SimpleSpanProcessor;
import io.opentelemetry.sdk.trace.export.SpanExporter;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@AutoService(SdkTracerProviderConfigurer.class)
public class SeleniumSpanExporter implements SdkTracerProviderConfigurer {
  private static final Logger LOG = Logger.getLogger(SeleniumSpanExporter.class.getName());

  @Override
  public void configure(SdkTracerProviderBuilder tracerProvider) {
    tracerProvider.addSpanProcessor(SimpleSpanProcessor.create(new SpanExporter() {
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
  }

  private static String getJsonString(Map<String, Object> map) {
    StringBuilder text = new StringBuilder();
    try (JsonOutput json = new Json().newOutput(text).setPrettyPrint(false)) {
      json.write(map);
      text.append('\n');
    }
    return text.toString();
  }
}
