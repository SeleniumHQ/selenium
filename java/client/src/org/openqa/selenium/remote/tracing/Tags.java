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
import org.openqa.selenium.remote.http.HttpResponse;

import java.util.Map;
import java.util.function.BiConsumer;

public class Tags {

  private final static Map<Integer, Status> STATUS_CODE_TO_TRACING_STATUS = Map.of(
      401, Status.UNAUTHENTICATED,
      404, Status.NOT_FOUND,
      408, Status.DEADLINE_EXCEEDED,
      429, Status.RESOURCE_EXHAUSTED,
      499, Status.CANCELLED,
      501, Status.UNIMPLEMENTED,
      503, Status.UNAVAILABLE,
      504, Status.DEADLINE_EXCEEDED);

  private Tags() {
    // Utility class
  }

  public static final BiConsumer<Span, Span.Kind> KIND =
    (span, kind) -> span.setAttribute("span.kind", kind.toString());

  public static final BiConsumer<Span, HttpRequest> HTTP_REQUEST = (span, req) -> {
    span.setAttribute("http.method", req.getMethod().toString());
    span.setAttribute("http.url", req.getUri());
  };

  public static final BiConsumer<Span, HttpResponse> HTTP_RESPONSE = (span, res) -> {
    int statusCode = res.getStatus();
    if (res.getTargetHost() != null) {
      span.setAttribute("http.target_host", res.getTargetHost());
    }
    span.setAttribute("http.status_code", statusCode);

    if (statusCode > 99 && statusCode < 400) {
      span.setStatus(Status.OK);
    } else if (statusCode > 399 && statusCode < 500) {
      span.setStatus(STATUS_CODE_TO_TRACING_STATUS.getOrDefault(statusCode, Status.INVALID_ARGUMENT));
    } else if (statusCode > 499 && statusCode < 600) {
      span.setStatus(STATUS_CODE_TO_TRACING_STATUS.getOrDefault(statusCode, Status.INTERNAL));
    } else {
      span.setStatus(Status.UNKNOWN);
    }
  };
}
