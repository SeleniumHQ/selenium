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

import io.opentracing.Span;
import io.opentracing.SpanContext;
import io.opentracing.Tracer;
import io.opentracing.propagation.Format;
import io.opentracing.propagation.TextMapAdapter;
import io.opentracing.tag.Tags;
import org.openqa.selenium.remote.http.HttpRequest;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

public class HttpTracing {

  private HttpTracing() {
    // Utility classes
  }

  public static SpanContext extract(Tracer tracer, HttpRequest request) {
    return tracer.extract(Format.Builtin.HTTP_HEADERS, new HttpRequestAdapter(request));
  }

  public static void inject(Tracer tracer, Span span, HttpRequest request) {
    Objects.requireNonNull(request, "Request must be set.");
    if (span == null) {
      return;
    }

    span.setTag(Tags.HTTP_METHOD.getKey(), request.getMethod().toString());
    span.setTag(Tags.HTTP_URL.getKey(), request.getUri());

    tracer.inject(span.context(), Format.Builtin.HTTP_HEADERS, new HttpRequestAdapter(request));
  }

  private static class HttpRequestAdapter extends TextMapAdapter {

    public HttpRequestAdapter(HttpRequest request) {
      super(asMap(request));
    }

    private static Map<String, String> asMap(HttpRequest request) {
      Map<String, String> entries = new LinkedHashMap<>();
      request.getHeaderNames().forEach(name ->
        request.getHeaders(name).forEach(value -> {
          if (value != null) {
            entries.put(name, value);
          }
        })
      );
      return Collections.unmodifiableMap(entries);
    }

    @Override
    public void put(String key, String value) {
      super.put(key, value);
    }
  }
}
