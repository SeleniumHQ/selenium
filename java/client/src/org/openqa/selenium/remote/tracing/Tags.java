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

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Map;
import java.util.function.BiConsumer;

public class Tags {
  private static final Map<Integer, Status> STATUS_CODE_TO_TRACING_STATUS = Map.of(
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
    (span, kind) -> span.setAttribute(AttributeKey.SPAN_KIND.toString(), kind.toString());

  public static final BiConsumer<Span, HttpRequest> HTTP_REQUEST = (span, req) -> {
    span.setAttribute(AttributeKey.HTTP_METHOD.toString(), req.getMethod().toString());
    span.setAttribute(AttributeKey.HTTP_URL.toString(), req.getUri());
  };

  public static final BiConsumer<Span, HttpResponse> HTTP_RESPONSE = (span, res) -> {
    int statusCode = res.getStatus();
    if (res.getTargetHost() != null) {
      span.setAttribute(AttributeKey.HTTP_TARGET_HOST.toString(), res.getTargetHost());
    }
    span.setAttribute(AttributeKey.HTTP_STATUS_CODE.toString(), statusCode);

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

  public static final BiConsumer<Map<String, EventAttributeValue>, HttpRequest>
      HTTP_REQUEST_EVENT =
      (map, req) -> {
        map.put(AttributeKey.HTTP_METHOD.toString(),
                EventAttribute.setValue(req.getMethod().toString()));
        map.put(AttributeKey.HTTP_URL.toString(), EventAttribute.setValue(req.getUri()));
      };

  public static final BiConsumer<Map<String, EventAttributeValue>, HttpResponse>
      HTTP_RESPONSE_EVENT =
      (map, res) -> {
        int statusCode = res.getStatus();
        if (res.getTargetHost() != null) {
          map.put(AttributeKey.HTTP_TARGET_HOST.toString(),
                  EventAttribute.setValue(res.getTargetHost()));
        }
        map.put(AttributeKey.HTTP_STATUS_CODE.toString(), EventAttribute.setValue(statusCode));
      };

  public static final BiConsumer<Map<String, EventAttributeValue>, Throwable>
      EXCEPTION =
      (map, t) -> {
        StringWriter sw = new StringWriter();
        t.printStackTrace(new PrintWriter(sw));

        map.put(AttributeKey.EXCEPTION_TYPE.toString(),
                EventAttribute.setValue(t.getClass().getName()));
        map.put(AttributeKey.EXCEPTION_STACKTRACE.toString(),
                EventAttribute.setValue(sw.toString()));

      };

}
