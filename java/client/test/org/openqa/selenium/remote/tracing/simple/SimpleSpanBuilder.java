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

import static io.opentracing.References.CHILD_OF;

import io.opentracing.ScopeManager;
import io.opentracing.Span;
import io.opentracing.SpanContext;
import io.opentracing.Tracer;
import io.opentracing.tag.Tag;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class SimpleSpanBuilder implements Tracer.SpanBuilder {

  private final ScopeManager scopeManager;
  private final String operationName;
  private final Map<String, Object> tags = new HashMap<>();
  private final Map<String, SpanContext> references = new HashMap<>();
  private boolean ignoreActiveSpan = false;
  private long timestamp;

  public SimpleSpanBuilder(ScopeManager scopeManager, String operationName) {
    this.scopeManager = Objects.requireNonNull(scopeManager);
    this.operationName = Objects.requireNonNull(operationName);
  }

  @Override
  public Tracer.SpanBuilder asChildOf(SpanContext parent) {
    return addReference(CHILD_OF, parent);
  }

  @Override
  public Tracer.SpanBuilder asChildOf(Span parent) {
    return addReference(CHILD_OF, parent == null ? null : parent.context());
  }

  @Override
  public Tracer.SpanBuilder addReference(String referenceType, SpanContext referencedContext) {
    if (referenceType == null || referencedContext == null) {
      return this;
    }
    references.put(referenceType, referencedContext);
    return this;
  }

  @Override
  public Tracer.SpanBuilder ignoreActiveSpan() {
    ignoreActiveSpan = true;
    return this;
  }

  @Override
  public Tracer.SpanBuilder withTag(String key, String value) {
    return withTag(key, (Object) value);
  }

  @Override
  public Tracer.SpanBuilder withTag(String key, boolean value) {
    return withTag(key, (Object) value);
  }

  @Override
  public Tracer.SpanBuilder withTag(String key, Number value) {
    return withTag(key, (Object) value);
  }

  @Override
  public <T> Tracer.SpanBuilder withTag(Tag<T> tag, T value) {
    return withTag(tag.getKey(), value);
  }

  private Tracer.SpanBuilder withTag(String key, Object value) {
    if (key == null || value == null) {
      return this;
    }

    tags.put(key, value);

    return this;
  }

  @Override
  public Tracer.SpanBuilder withStartTimestamp(long microseconds) {
    this.timestamp = microseconds;
    return this;
  }

  @Override
  public Span start() {
    return new SimpleSpan().setOperationName(operationName);
  }
}
