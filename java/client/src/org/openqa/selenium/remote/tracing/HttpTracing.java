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

import com.google.common.base.Strings;

import org.openqa.selenium.remote.http.HttpRequest;

import io.opentracing.tag.Tags;

import java.util.Collections;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.function.Function;

public class HttpTracing {

  private HttpTracing() {
    // Utility classes
  }

  public static final Function<HttpRequest, Map<String, String>> AS_MAP = req -> {
    Map<String, String> builder = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
    for (String name : req.getHeaderNames()) {
      if (Strings.isNullOrEmpty(name)) {
        continue;
      }

      String value = req.getHeader(name);
      if (Strings.isNullOrEmpty(value)) {
        continue;
      }

      builder.put(name, value);
    }
    return Collections.unmodifiableMap(builder);
  };

  public static void inject(Span span, HttpRequest request) {
    Objects.requireNonNull(request, "Request must be set.");
    if (span == null) {
      return;
    }

    span.addTag(Tags.HTTP_METHOD.getKey(), request.getMethod().toString());
    span.addTag(Tags.HTTP_URL.getKey(), request.getUri());

    span.inject(request::setHeader);
  }
}
