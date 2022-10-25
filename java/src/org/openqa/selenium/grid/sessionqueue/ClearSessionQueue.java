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

package org.openqa.selenium.grid.sessionqueue;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.tracing.HttpTracing.newSpanAsChildOf;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_RESPONSE;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;
import org.openqa.selenium.remote.tracing.Tracer;

public class ClearSessionQueue implements HttpHandler {

  private final Tracer tracer;
  private final NewSessionQueue newSessionQueue;

  ClearSessionQueue(Tracer tracer, NewSessionQueue newSessionQueue) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.newSessionQueue = Require.nonNull("New Session Queue", newSessionQueue);
  }

  @Override
  public HttpResponse execute(HttpRequest req) {
    Span span = newSpanAsChildOf(tracer, req, "sessionqueue.clear");
    HTTP_REQUEST.accept(span, req);

    try {
      int value = newSessionQueue.clearQueue();
      span.setAttribute("cleared", value);

      HttpResponse response = new HttpResponse();
      if (value != 0) {
        response.setContent(
          asJson(ImmutableMap.of(
            "value", value,
            "message", "Cleared the new session request queue",
            "cleared_requests", value)));
      } else {
        response.setContent(
          asJson(ImmutableMap.of(
            "value", value,
            "message",
            "New session request queue empty. Nothing to clear.")));
      }

      span.setAttribute("requests.cleared", value);
      HTTP_RESPONSE.accept(span, response);
      return response;
    } catch (Exception e) {
      span.setAttribute(AttributeKey.ERROR.getKey(), true);
      span.setStatus(Status.INTERNAL);
      HttpResponse response = new HttpResponse().setStatus((HTTP_INTERNAL_ERROR)).setContent(
        asJson(ImmutableMap.of(
          "value", 0,
          "message", "Error while clearing the queue. Full queue may not have been cleared.")));

      HTTP_RESPONSE.accept(span, response);
      return response;
    } finally {
      span.close();
    }
  }
}
