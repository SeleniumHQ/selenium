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

import com.google.common.net.HttpHeaders;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.AbstractMap.SimpleEntry;
import java.util.Map;
import java.util.function.BiConsumer;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

public class Tags {

  private static final Map<Integer, Status> STATUS_CODE_TO_TRACING_STATUS =
      Stream.of(
              new SimpleEntry<>(401, Status.UNAUTHENTICATED),
              new SimpleEntry<>(404, Status.NOT_FOUND),
              new SimpleEntry<>(408, Status.DEADLINE_EXCEEDED),
              new SimpleEntry<>(429, Status.RESOURCE_EXHAUSTED),
              new SimpleEntry<>(499, Status.CANCELLED),
              new SimpleEntry<>(501, Status.UNIMPLEMENTED),
              new SimpleEntry<>(503, Status.UNAVAILABLE),
              new SimpleEntry<>(504, Status.DEADLINE_EXCEEDED))
          .collect(Collectors.toMap(SimpleEntry::getKey, SimpleEntry::getValue));

  private Tags() {
    // Utility class
  }

  public static final BiConsumer<Span, Span.Kind> KIND =
      (span, kind) -> span.setAttribute(AttributeKey.SPAN_KIND.getKey(), kind.toString());

  public static final BiConsumer<Span, HttpRequest> HTTP_REQUEST =
      (span, req) -> {
        span.setAttribute(AttributeKey.HTTP_METHOD.getKey(), req.getMethod().toString());
        span.setAttribute(AttributeKey.HTTP_TARGET.getKey(), req.getUri());
      };

  public static final BiConsumer<Span, HttpResponse> HTTP_RESPONSE =
      (span, res) -> {
        int statusCode = res.getStatus();
        if (res.getTargetHost() != null) {
          span.setAttribute(AttributeKey.HTTP_TARGET_HOST.getKey(), res.getTargetHost());
        }
        span.setAttribute(AttributeKey.HTTP_STATUS_CODE.getKey(), statusCode);

        if (statusCode > 99 && statusCode < 400) {
          span.setStatus(Status.OK);
        } else if (statusCode > 399 && statusCode < 500) {
          span.setStatus(
              STATUS_CODE_TO_TRACING_STATUS.getOrDefault(statusCode, Status.INVALID_ARGUMENT));
        } else if (statusCode > 499 && statusCode < 600) {
          span.setStatus(STATUS_CODE_TO_TRACING_STATUS.getOrDefault(statusCode, Status.INTERNAL));
        } else {
          span.setStatus(Status.UNKNOWN);
        }
      };

  public static final BiConsumer<Map<String, EventAttributeValue>, HttpRequest> HTTP_REQUEST_EVENT =
      (map, req) -> {
        map.put(
            AttributeKey.HTTP_METHOD.getKey(), EventAttribute.setValue(req.getMethod().toString()));
        map.put(AttributeKey.HTTP_TARGET.getKey(), EventAttribute.setValue(req.getUri()));

        String userAgent = req.getHeader(HttpHeaders.USER_AGENT);
        if (userAgent != null) {
          map.put(AttributeKey.HTTP_USER_AGENT.getKey(), EventAttribute.setValue(userAgent));
        }

        String host = req.getHeader(HttpHeaders.HOST);
        if (host != null) {
          map.put(AttributeKey.HTTP_HOST.getKey(), EventAttribute.setValue(host));
        }

        String contentLength = req.getHeader(HttpHeaders.CONTENT_LENGTH);
        if (contentLength != null) {
          map.put(
              AttributeKey.HTTP_REQUEST_CONTENT_LENGTH.getKey(),
              EventAttribute.setValue(contentLength));
        }

        String clientIpAddress = req.getHeader(HttpHeaders.X_FORWARDED_FOR);
        if (clientIpAddress != null) {
          map.put(AttributeKey.HTTP_CLIENT_IP.getKey(), EventAttribute.setValue(clientIpAddress));
        }

        Object httpScheme = req.getAttribute(AttributeKey.HTTP_SCHEME.getKey());
        if (httpScheme != null) {
          map.put(AttributeKey.HTTP_SCHEME.getKey(), EventAttribute.setValue((String) httpScheme));
        }

        Object httpVersion = req.getAttribute(AttributeKey.HTTP_FLAVOR.getKey());
        if (httpVersion != null) {
          map.put(
              AttributeKey.HTTP_FLAVOR.getKey(), EventAttribute.setValue((Integer) httpVersion));
        }
      };

  public static final BiConsumer<Map<String, EventAttributeValue>, HttpResponse>
      HTTP_RESPONSE_EVENT =
          (map, res) -> {
            int statusCode = res.getStatus();
            if (res.getTargetHost() != null) {
              map.put(
                  AttributeKey.HTTP_TARGET_HOST.getKey(),
                  EventAttribute.setValue(res.getTargetHost()));
            }
            map.put(AttributeKey.HTTP_STATUS_CODE.getKey(), EventAttribute.setValue(statusCode));
          };

  public static final BiConsumer<Map<String, EventAttributeValue>, Throwable> EXCEPTION =
      (map, t) -> {
        StringWriter sw = new StringWriter();
        t.printStackTrace(new PrintWriter(sw));

        map.put(
            AttributeKey.EXCEPTION_TYPE.getKey(), EventAttribute.setValue(t.getClass().getName()));
        map.put(AttributeKey.EXCEPTION_STACKTRACE.getKey(), EventAttribute.setValue(sw.toString()));
      };
}
