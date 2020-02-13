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
import io.opentelemetry.context.Scope;
import io.opentelemetry.trace.Span;
import io.opentelemetry.trace.Tracer;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.HttpTracing;
import org.openqa.selenium.remote.tracing.TracedCallable;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeoutException;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static java.util.concurrent.TimeUnit.SECONDS;
import static java.util.stream.Collectors.toList;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.tracing.HttpTags.HTTP_RESPONSE;
import static org.openqa.selenium.remote.tracing.HttpTracing.newSpanAsChildOf;

class GridStatusHandler implements HttpHandler {

  private static final ScheduledExecutorService
      SCHEDULED_SERVICE =
      Executors.newScheduledThreadPool(
          1,
          r -> {
            Thread thread = new Thread(r, "Scheduled grid status executor");
            thread.setDaemon(true);
            return thread;
          });


  private static final ExecutorService EXECUTOR_SERVICE = Executors.newCachedThreadPool(
      r -> {
        Thread thread = new Thread(r, "Grid status executor");
        thread.setDaemon(true);
        return thread;
      });


  private final Json json;
  private final Tracer tracer;
  private final HttpClient.Factory clientFactory;
  private final Distributor distributor;

  public GridStatusHandler(Json json, Tracer tracer, HttpClient.Factory clientFactory, Distributor distributor) {
    this.json = Objects.requireNonNull(json, "JSON encoder must be set.");
    this.tracer = Objects.requireNonNull(tracer, "Tracer must be set.");
    this.clientFactory = Objects.requireNonNull(clientFactory, "HTTP client factory must be set.");
    this.distributor = Objects.requireNonNull(distributor, "Distributor must be set.");
  }

  @Override
  public HttpResponse execute(HttpRequest req) {
    long start = System.currentTimeMillis();

    Span span = newSpanAsChildOf(tracer, req, "router.status").startSpan();

    try (Scope scope = tracer.withSpan(span)) {
      DistributorStatus status;
      try {
        status = EXECUTOR_SERVICE.submit(new TracedCallable<>(tracer, span, distributor::getStatus)).get(2, SECONDS);
      } catch (ExecutionException | InterruptedException | TimeoutException e) {
        return new HttpResponse().setContent(utf8String(json.toJson(
          ImmutableMap.of("value", ImmutableMap.of(
            "ready", false,
            "message", "Unable to read distributor status.")))));
      }

      boolean ready = status.hasCapacity();
      String message = ready ? "Selenium Grid ready." : "Selenium Grid not ready.";

      long remaining = System.currentTimeMillis() + 2000 - start;
      List<Future<Map<String, Object>>> nodeResults = status.getNodes().stream()
        .map(summary -> {
          ImmutableMap<String, Object> defaultResponse = ImmutableMap.of(
            "id", summary.getNodeId(),
            "uri", summary.getUri(),
            "maxSessions", summary.getMaxSessionCount(),
            "stereotypes", summary.getStereotypes(),
            "warning", "Unable to read data from node.");

          CompletableFuture<Map<String, Object>> toReturn = new CompletableFuture<>();

          Future<?> future = EXECUTOR_SERVICE.submit(
            () -> {
              try {
                HttpClient client = clientFactory.createClient(summary.getUri().toURL());
                HttpRequest nodeStatusReq = new HttpRequest(GET, "/se/grid/node/status");
                HttpTracing.inject(tracer, span, nodeStatusReq);
                HttpResponse res = client.execute(nodeStatusReq);

                if (res.getStatus() == 200) {
                  toReturn.complete(json.toType(string(res), MAP_TYPE));
                } else {
                  toReturn.complete(defaultResponse);
                }
              } catch (IOException e) {
                e.printStackTrace();
                toReturn.complete(defaultResponse);
              }
            });

          SCHEDULED_SERVICE.schedule(
            () -> {
              if (!toReturn.isDone()) {
                toReturn.complete(defaultResponse);
                future.cancel(true);
              }
            },
            remaining,
            MILLISECONDS);

          return toReturn;
        })
        .collect(toList());

      ImmutableMap.Builder<String, Object> value = ImmutableMap.builder();
      value.put("ready", ready);
      value.put("message", message);

      value.put("nodes", nodeResults.stream()
        .map(summary -> {
          try {
            return summary.get();
          } catch (ExecutionException | InterruptedException e) {
            throw wrap(e);
          }
        })
        .collect(toList()));

      HttpResponse res = new HttpResponse().setContent(utf8String(json.toJson(ImmutableMap.of("value", value.build()))));
      HTTP_RESPONSE.accept(span, res);
      return res;
    } finally {
      span.end();
    }
  }

  private RuntimeException wrap(Exception e) {
    if (e instanceof InterruptedException) {
      Thread.currentThread().interrupt();
      return new RuntimeException(e);
    }

    Throwable cause = e.getCause();
    if (cause == null) {
      return e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
    }
    return cause instanceof RuntimeException ? (RuntimeException) cause
                                             : new RuntimeException(cause);
  }
}
