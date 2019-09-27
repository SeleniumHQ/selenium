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

package org.openqa.selenium.remote.tracing.simple;

import com.google.common.collect.ImmutableSet;

import io.opentracing.Span;
import io.opentracing.SpanContext;
import io.opentracing.tag.Tag;

import java.util.AbstractMap;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class SimpleSpan implements Span {

  private final UUID spanId = UUID.randomUUID();
  private final Map<String, String> baggage = new HashMap<>();
  private final Map<String, Object> tags = new HashMap<>();
  private String operationName;

  @Override
  public SpanContext context() {
    return new Context();
  }

  @Override
  public Span setTag(String key, String value) {
    return setTag(key, (Object) value);
  }

  @Override
  public Span setTag(String key, boolean value) {
    return setTag(key, (Object) value);
  }

  @Override
  public Span setTag(String key, Number value) {
    return setTag(key, (Object) value);
  }

  @Override
  public <T> Span setTag(Tag<T> tag, T value) {
    return setTag(tag.getKey(), value);
  }

  private Span setTag(String key, Object value) {
    if (key == null || value == null) {
      return this;
    }

    tags.put(key, value);

    return this;
  }


  @Override
  public Span log(Map<String, ?> fields) {
    return log(System.currentTimeMillis(), fields);
  }

  @Override
  public Span log(long timestampMicroseconds, Map<String, ?> fields) {
    return log(timestampMicroseconds, null, fields);
  }

  @Override
  public Span log(String event) {
    return log(System.currentTimeMillis(), event);
  }

  @Override
  public Span log(long timestampMicroseconds, String event) {
    return log(timestampMicroseconds, event, new HashMap<>());
  }

  private Span log(long timestamp, String event, Map<String, ?> fields) {
    // no-op
    return this;
  }

  @Override
  public Span setBaggageItem(String key, String value) {
    if (key == null || value == null) {
      return this;
    }

    baggage.put(key, value);
    return this;
  }

  @Override
  public String getBaggageItem(String key) {
    return baggage.get(key);
  }

  @Override
  public Span setOperationName(String operationName) {
    if (operationName == null) {
      return this;
    }

    this.operationName = operationName;

    return this;
  }

  @Override
  public void finish() {
    finish(System.currentTimeMillis());
  }

  @Override
  public void finish(long finishMicros) {
    // no-op
  }

  private class Context implements SpanContext {

    private final String traceId = UUID.randomUUID().toString();
    private final String spanId = UUID.randomUUID().toString();

    @Override
    public String toTraceId() {
      return traceId;
    }

    @Override
    public String toSpanId() {
      return spanId;
    }

    @Override
    public Iterable<Map.Entry<String, String>> baggageItems() {
      return ImmutableSet.<Map.Entry<String, String>>builder()
          .addAll(baggage.entrySet())
          .add(new AbstractMap.SimpleImmutableEntry<>("span-id", spanId.toString()))
          .build();
    }
  }
}
