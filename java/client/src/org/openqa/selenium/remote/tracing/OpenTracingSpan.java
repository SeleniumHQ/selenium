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

import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.remote.http.HttpRequest;

import io.opentracing.SpanContext;
import io.opentracing.Tracer;
import io.opentracing.propagation.Format;
import io.opentracing.propagation.TextMap;

import java.util.AbstractMap;
import java.util.Iterator;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.StreamSupport;

class OpenTracingSpan extends Span {

  private final DistributedTracer distributedTracer;
  private final Tracer tracer;
  private final io.opentracing.Span span;

  OpenTracingSpan(
      DistributedTracer distributedTracer,
      Tracer tracer,
      io.opentracing.Span parent,
      String operation) {
    this.distributedTracer = Objects.requireNonNull(distributedTracer);
    this.tracer = Objects.requireNonNull(tracer);

    this.span = tracer.buildSpan(operation).asChildOf(parent).ignoreActiveSpan().start();
    activate();
  }

  @Override
  public Span activate() {
    tracer.scopeManager().activate(span, false);
    distributedTracer.setActiveSpan(this);
    return this;
  }

  @Override
  public Span setName(String name) {
    Objects.requireNonNull(name, "Name must be set.");
    span.setOperationName(name);
    return this;
  }

  @Override
  public Span addTraceTag(String key, String value) {
    span.setBaggageItem(Objects.requireNonNull(key), value);
    return this;
  }

  @Override
  public Span addTag(String key, String value) {
    span.setTag(key, value);
    return this;
  }

  @Override
  public Span addTag(String key, boolean value) {
    span.setTag(Objects.requireNonNull(key), value);
    return this;
  }

  @Override
  public Span addTag(String key, long value) {
    span.setTag(Objects.requireNonNull(key), value);
    return this;
  }

  @Override
  public Span createChild(String operation) {
    Span child = new OpenTracingSpan(distributedTracer, tracer, span, operation);
    return child.activate();
  }

  @Override
  void inject(HttpRequest request) {
    tracer.inject(span.context(), Format.Builtin.HTTP_HEADERS, new HttpRequestInjector(request));
  }

  @Override
  void extract(HttpRequest request) {
    SpanContext context = tracer.extract(Format.Builtin.HTTP_HEADERS, new HttpRequestInjector(request));
    for (Map.Entry<String, String> item : context.baggageItems()) {
      addTraceTag(item.getKey(), item.getValue());
    }
  }

  @Override
  public void close() {
    span.finish();
    distributedTracer.remove(this);
  }

  private class HttpRequestInjector implements TextMap {

    private final Set<String> names = ImmutableSet.<String>builder()
        .add("cache-control")
        .add("connection")
        .add("content-length")
        .add("content-type")
        .add("date")
        .add("keep-alive")
        .add("proxy-authorization")
        .add("proxy-authenticate")
        .add("proxy-connection")
        .add("referer")
        .add("te")
        .add("trailer")
        .add("transfer-encoding")
        .add("upgrade")
        .add("user-agent")
        .build();
    private final HttpRequest request;

    HttpRequestInjector(HttpRequest request) {
      this.request = request;
    }

    @Override
    public Iterator<Map.Entry<String, String>> iterator() {
      return StreamSupport.stream(request.getHeaderNames().spliterator(), false)
          .filter(name -> names.contains(name.toLowerCase(Locale.US)))
          .map(name -> (Map.Entry<String, String>) new AbstractMap.SimpleImmutableEntry<>(
              name, request.getHeader(name)))
          .iterator();
    }

    @Override
    public void put(String key, String value) {
      request.setHeader(key, value);
    }
  }
}
