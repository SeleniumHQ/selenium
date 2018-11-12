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

import org.openqa.selenium.remote.http.HttpRequest;

import io.opencensus.trace.AttributeValue;
import io.opencensus.trace.Tracer;

import java.util.Objects;

class OpenCensusSpan extends Span {

  private final io.opencensus.trace.Span span;
  private final DistributedTracer distributedTracer;
  private final Tracer tracer;

  OpenCensusSpan(
      DistributedTracer distributedTracer,
      Tracer tracer,
      io.opencensus.trace.Span parent,
      String operation) {
    this.distributedTracer = Objects.requireNonNull(distributedTracer);
    this.tracer = Objects.requireNonNull(tracer);
    this.span = tracer.spanBuilderWithExplicitParent(operation, parent).startSpan();
    activate();
  }

  @Override
  public Span activate() {
    tracer.withSpan(span);
    distributedTracer.setActiveSpan(this);
    return this;
  }

  @Override
  public Span setName(String name) {
    Objects.requireNonNull(name, "Name must be set.");

    // TODO: Actually change the name of the span

    return this;
  }

  @Override
  public Span addTraceTag(String key, String value) {
    span.putAttribute(Objects.requireNonNull(key), AttributeValue.stringAttributeValue(value));
    return this;
  }

  @Override
  public String getTraceTag(String key) {
    return span.getContext().getTracestate().get(key);
  }

  @Override
  public Span addTag(String key, String value) {
    span.putAttribute(Objects.requireNonNull(key), AttributeValue.stringAttributeValue(value));
    return this;
  }

  @Override
  public Span addTag(String key, boolean value) {
    span.putAttribute(Objects.requireNonNull(key), AttributeValue.booleanAttributeValue(value));
    return this;
  }

  @Override
  public Span addTag(String key, long value) {
    span.putAttribute(Objects.requireNonNull(key), AttributeValue.longAttributeValue(value));
    return this;
  }

  @Override
  public Span createChild(String operation) {
    Span child = new OpenCensusSpan(distributedTracer, tracer, span, operation);
    return child.activate();
  }

  @Override
  void inject(HttpRequest request) {
    throw new UnsupportedOperationException("inject");
  }

  @Override
  public void close() {
    span.end();
    distributedTracer.remove(this);
  }

}
