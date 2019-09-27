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

import io.opentracing.SpanContext;
import io.opentracing.Tracer;
import io.opentracing.propagation.Format;
import io.opentracing.propagation.TextMap;

import java.util.Iterator;
import java.util.Map;
import java.util.Objects;
import java.util.function.BiConsumer;

class OpenTracingSpan implements Span {

  private final Tracer tracer;
  private final io.opentracing.Span span;

  OpenTracingSpan(Tracer tracer, io.opentracing.Span span) {
    this.tracer = Objects.requireNonNull(tracer, "Tracer must be set.");
    this.span = Objects.requireNonNull(span, "Span must be set.");
    activate();
  }

  @Override
  public Span activate() {
    tracer.scopeManager().activate(span);
    return this;
  }

  @Override
  public Span addTag(String key, Object value) {
    Objects.requireNonNull(key, "Key must be set");
    if (value == null) {
      return this;
    }

    span.setTag(key, String.valueOf(value));
    return this;
  }

  @Override
  public Span addTag(String key, boolean value) {
    Objects.requireNonNull(key, "Key must be set");
    span.setTag(key, value);
    return this;
  }

  @Override
  public Span addTag(String key, Number value) {
    Objects.requireNonNull(key, "Key must be set");
    span.setTag(key, value);
    return this;
  }

  @Override
  public void inject(BiConsumer<String, String> forEachField) {
    TextMap maplike = new TextMap() {
      @Override
      public Iterator<Map.Entry<String, String>> iterator() {
        throw new UnsupportedOperationException("iterator");
      }

      @Override
      public void put(String key, String value) {
        if (key != null && value != null) {
          forEachField.accept(key, value);
        }
      }
    };
    tracer.inject(span.context(), Format.Builtin.HTTP_HEADERS, maplike);
  }

  @Override
  public void close() {
    span.finish();
  }

  SpanContext getContext() {
    return span.context();
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof OpenTracingSpan)) {
      return false;
    }

    OpenTracingSpan that = (OpenTracingSpan) o;
    return Objects.equals(this.tracer, that.tracer) &&
           Objects.equals(this.span, that.span);
  }

  @Override
  public int hashCode() {
    return Objects.hash(tracer, span);
  }
}
