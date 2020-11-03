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

import com.google.common.collect.ImmutableMap;
import com.google.common.primitives.Primitives;
import io.grpc.Context;
import io.opentelemetry.common.Attributes;
import io.opentelemetry.context.Scope;
import io.opentelemetry.trace.SpanContext;
import io.opentelemetry.trace.StatusCanonicalCode;
import io.opentelemetry.trace.Tracer;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;

import java.util.Map;
import java.util.Objects;

class OpenTelemetrySpan extends OpenTelemetryContext implements AutoCloseable, Span {

  private final io.opentelemetry.trace.Span span;
  private final Scope scope;

  public OpenTelemetrySpan(Tracer tracer, Context context, io.opentelemetry.trace.Span span, Scope scope) {
    super(tracer, context);
    this.span = Require.nonNull("Span", span);
    this.scope = Require.nonNull("Scope", scope);
  }

  @Override
  public Span setName(String name) {
    span.updateName(Require.nonNull("Name to update to", name));
    return this;
  }

  @Override
  public Span setAttribute(String key, boolean value) {
    span.setAttribute(Require.nonNull("Key", key), value);
    return this;
  }

  @Override
  public Span setAttribute(String key, Number value) {
    Require.nonNull("Key", key);
    Require.nonNull("Value", value);

    Class<? extends Number> unwrapped = Primitives.unwrap(value.getClass());
    if (double.class.equals(unwrapped) || float.class.equals(unwrapped)) {
      span.setAttribute(key, value.doubleValue());
    } else {
      span.setAttribute(key, value.longValue());
    }

    return this;
  }

  @Override
  public Span setAttribute(String key, String value) {
    Require.nonNull("Key", key);
    Require.nonNull("Value", value);
    span.setAttribute(key, value);
    return this;
  }

  @Override
  public Span addEvent(String name) {
    Require.nonNull("Name", name);
    span.addEvent(name);
    return this;
  }

  @Override
  public Span addEvent(String name, Map<String, EventAttributeValue> attributeMap) {
    Require.nonNull("Name", name);
    Require.nonNull("Event Attribute Map", attributeMap);
    Attributes.Builder otAttributes = Attributes.newBuilder();

    attributeMap.forEach(
        (key, value) -> {
          Require.nonNull("Event Attribute Value", value);
          switch (value.getAttributeType()) {
            case BOOLEAN:
              otAttributes.setAttribute(key, value.getBooleanValue());
              break;

            case BOOLEAN_ARRAY:
              otAttributes.setAttribute(key, value.getBooleanArrayValue());
              break;

            case DOUBLE:
              otAttributes.setAttribute(key, value.getNumberValue().doubleValue());
              break;

            case DOUBLE_ARRAY:
              otAttributes.setAttribute(key, value.getDoubleArrayValue());
              break;

            case LONG:
              otAttributes.setAttribute(key, value.getNumberValue().longValue());
              break;

            case LONG_ARRAY:
              otAttributes.setAttribute(key, value.getLongArrayValue());
              break;

            case STRING:
              otAttributes.setAttribute(key, value.getStringValue());
              break;

            case STRING_ARRAY:
              otAttributes.setAttribute(key, value.getStringArrayValue());
              break;

            default:
              throw new IllegalArgumentException(
                  "Unrecognized event attribute value type: " + value.getAttributeType());
          }
        }
    );

    span.addEvent(name, otAttributes.build());
    return this;
  }

  private static final Map<Status.Kind, StatusCanonicalCode> statuses
      = new ImmutableMap.Builder<Status.Kind, StatusCanonicalCode>()
      .put(Status.Kind.ABORTED, StatusCanonicalCode.ERROR)
      .put(Status.Kind.CANCELLED, StatusCanonicalCode.ERROR)
      .put(Status.Kind.NOT_FOUND, StatusCanonicalCode.ERROR)
      .put(Status.Kind.OK, StatusCanonicalCode.OK)
      .put(Status.Kind.RESOURCE_EXHAUSTED, StatusCanonicalCode.ERROR)
      .put(Status.Kind.UNKNOWN, StatusCanonicalCode.ERROR)
      .put(Status.Kind.INVALID_ARGUMENT, StatusCanonicalCode.ERROR)
      .put(Status.Kind.DEADLINE_EXCEEDED, StatusCanonicalCode.ERROR)
      .put(Status.Kind.ALREADY_EXISTS, StatusCanonicalCode.ERROR)
      .put(Status.Kind.PERMISSION_DENIED, StatusCanonicalCode.ERROR)
      .put(Status.Kind.OUT_OF_RANGE, StatusCanonicalCode.ERROR)
      .put(Status.Kind.UNIMPLEMENTED, StatusCanonicalCode.ERROR)
      .put(Status.Kind.INTERNAL, StatusCanonicalCode.ERROR)
      .put(Status.Kind.UNAVAILABLE, StatusCanonicalCode.ERROR)
      .put(Status.Kind.UNAUTHENTICATED, StatusCanonicalCode.ERROR)
      .build();

  @Override
  public Span setStatus(Status status) {
    Require.nonNull("Status", status);

    StatusCanonicalCode statusCanonicalCode = statuses.get(status.getKind());
    if (statusCanonicalCode == null) {
      throw new IllegalArgumentException("Unrecognized status kind: " + status.getKind());
    }

    span.setStatus(statusCanonicalCode,
                   "Kind: " + status.getKind().toString()
                   + " Description:"
                   + status.getDescription());

    return this;
  }

  @Override
  public void close() {
    scope.close();
    span.end();
  }

  @Override
  public String toString() {
    SpanContext context = span.getContext();

    return "OpenTelemetrySpan{traceId=" +
      context.getTraceIdAsHexString() +
      ",spanId=" +
      context.getSpanIdAsHexString() +
      "}";
  }

  @Override
  public boolean equals(Object o) {
    if (o instanceof OpenTelemetryContext && (!(o instanceof OpenTelemetrySpan))) {
      return false;
    }

    if (!(o instanceof OpenTelemetrySpan)) {
      return false;
    }

    OpenTelemetrySpan that = (OpenTelemetrySpan) o;
    SpanContext thisContext = this.span.getContext();
    SpanContext thatContext = that.span.getContext();

    return Objects.equals(thisContext.getSpanIdAsHexString(), thatContext.getSpanIdAsHexString()) &&
      Objects.equals(thisContext.getTraceIdAsHexString(), thatContext.getTraceIdAsHexString());
  }

  @Override
  public int hashCode() {
    return Objects.hash(span);
  }
}
