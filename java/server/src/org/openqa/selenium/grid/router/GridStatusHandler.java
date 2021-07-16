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

package org.openqa.selenium.grid.router;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.EventAttribute;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;
import org.openqa.selenium.remote.tracing.Tracer;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeoutException;

import static java.util.concurrent.TimeUnit.SECONDS;
import static java.util.stream.Collectors.toList;
import static org.openqa.selenium.grid.data.Availability.UP;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.tracing.HttpTracing.newSpanAsChildOf;
import static org.openqa.selenium.remote.tracing.Tags.EXCEPTION;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST_EVENT;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_RESPONSE;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_RESPONSE_EVENT;

class GridStatusHandler implements HttpHandler {

  private static final ExecutorService EXECUTOR_SERVICE = Executors.newCachedThreadPool(
      r -> {
        Thread thread = new Thread(r, "Grid status executor");
        thread.setDaemon(true);
        return thread;
      });


  private final Tracer tracer;
  private final Distributor distributor;

  GridStatusHandler(Tracer tracer, Distributor distributor) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.distributor = Require.nonNull("Distributor", distributor);
  }

  @Override
  public HttpResponse execute(HttpRequest req) {

    try (Span span = newSpanAsChildOf(tracer, req, "grid.status")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(AttributeKey.LOGGER_CLASS.getKey(),
                       EventAttribute.setValue(getClass().getName()));

      HTTP_REQUEST.accept(span, req);
      HTTP_REQUEST_EVENT.accept(attributeMap, req);

      DistributorStatus status;
      try {
        status = EXECUTOR_SERVICE.submit(span.wrap(distributor::getStatus)).get(2, SECONDS);
      } catch (ExecutionException | TimeoutException e) {
        span.setAttribute("error", true);
        span.setStatus(Status.CANCELLED);
        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(),
                         EventAttribute.setValue("Error or timeout while getting Distributor "
                                                 + "status: " + e.getMessage()));
        HttpResponse response = new HttpResponse().setContent(asJson(
          ImmutableMap.of("value", ImmutableMap.of(
            "ready", false,
            "message", "Unable to read distributor status."))));

        HTTP_RESPONSE.accept(span, response);
        HTTP_RESPONSE_EVENT.accept(attributeMap, response);
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

        return response;
      } catch (InterruptedException e) {
        span.setAttribute("error", true);
        span.setStatus(Status.ABORTED);
        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(),
                         EventAttribute.setValue("Interruption while getting distributor status: "
                                                 + e.getMessage()));

        HttpResponse response = new HttpResponse().setContent(asJson(
          ImmutableMap.of("value", ImmutableMap.of(
            "ready", false,
            "message", "Reading distributor status was interrupted."))));

        HTTP_RESPONSE.accept(span, response);
        HTTP_RESPONSE_EVENT.accept(attributeMap, response);
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

        Thread.currentThread().interrupt();
        return response;
      }

      boolean ready = status.getNodes()
        .stream()
        .anyMatch(nodeStatus -> UP.equals(nodeStatus.getAvailability()));

      List<Map<String, Object>> nodeResults = status.getNodes().stream()
        .map(node -> new ImmutableMap.Builder<String, Object>()
          .put("id", node.getNodeId())
          .put("uri", node.getExternalUri())
          .put("maxSessions", node.getMaxSessionCount())
          .put("osInfo", node.getOsInfo())
          .put("heartbeatPeriod", node.getHeartbeatPeriod().toMillis())
          .put("availability", node.getAvailability())
          .put("version", node.getVersion())
          .put("slots", node.getSlots())
          .build())
        .collect(toList());

      ImmutableMap.Builder<String, Object> value = ImmutableMap.builder();
      value.put("ready", ready);
      value.put("message", ready ? "Selenium Grid ready." : "Selenium Grid not ready.");
      value.put("nodes", nodeResults);

      HttpResponse res = new HttpResponse()
        .setContent(asJson(ImmutableMap.of("value", value.build())));
      HTTP_RESPONSE.accept(span, res);
      HTTP_RESPONSE_EVENT.accept(attributeMap, res);
      attributeMap.put("grid.status", EventAttribute.setValue(ready));
      span.setStatus(Status.OK);
      span.addEvent("Computed grid status", attributeMap);
      return res;
    }
  }
}
