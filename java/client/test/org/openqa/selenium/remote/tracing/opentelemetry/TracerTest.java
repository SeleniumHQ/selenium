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

import io.opentelemetry.OpenTelemetry;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.trace.TracerSdkProvider;
import io.opentelemetry.sdk.trace.data.SpanData;
import io.opentelemetry.sdk.trace.export.SimpleSpansProcessor;
import io.opentelemetry.sdk.trace.export.SpanExporter;
import org.junit.Test;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.remote.tracing.HttpTracing;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;
import org.openqa.selenium.remote.tracing.Tracer;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.tracing.HttpTracing.newSpanAsChildOf;

public class TracerTest {

  @Test
  public void shouldBeAbleToCreateATracer() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      span.setAttribute("cheese", "gouda");
      span.setStatus(Status.NOT_FOUND);
    }

    Set<SpanData> values = allSpans.stream()
      .filter(data -> data.getAttributes().containsKey("cheese"))
      .collect(Collectors.toSet());

    assertThat(values).hasSize(1);
    assertThat(values).element(0)
        .extracting(SpanData::getStatus).isEqualTo(io.opentelemetry.trace.Status.NOT_FOUND);
    assertThat(values).element(0)
        .extracting(el -> el.getAttributes().get("cheese").getStringValue()).isEqualTo("gouda");
  }

  @Test
  public void nestingSpansInTheSameThreadShouldWork() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);

    try (Span parent = tracer.getCurrentContext().createSpan("parent")) {
      try (Span child = parent.createSpan("child")) {
        child.setAttribute("cheese", "camembert");
      }
    }

    SpanData parent = allSpans.stream().filter(data -> data.getName().equals("parent"))
        .findFirst().orElseThrow(NoSuchElementException::new);
    SpanData child = allSpans.stream().filter(data -> data.getName().equals("child"))
        .findFirst().orElseThrow(NoSuchElementException::new);

    assertThat(child.getParentSpanId()).isEqualTo(parent.getSpanId());
  }

  @Test
  public void nestingSpansFromDifferentThreadsIsFineToo() throws ExecutionException, InterruptedException {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);

    try (Span parent = tracer.getCurrentContext().createSpan("parent")) {
      Future<?> future = Executors.newSingleThreadExecutor().submit(() -> {
        try (Span child = parent.createSpan("child")) {
          child.setAttribute("cheese", "gruyere");
        }
      });
      future.get();
    }

    SpanData parent = allSpans.stream().filter(data -> data.getName().equals("parent"))
        .findFirst().orElseThrow(NoSuchElementException::new);
    SpanData child = allSpans.stream().filter(data -> data.getName().equals("child"))
        .findFirst().orElseThrow(NoSuchElementException::new);

    assertThat(child.getParentSpanId()).isEqualTo(parent.getSpanId());
  }

  @Test
  public void currentSpanIsKeptOnTracerCorrectlyWithinSameThread() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);

    try (Span parent = tracer.getCurrentContext().createSpan("parent")) {
      assertThat(parent.getId()).isEqualTo(tracer.getCurrentContext().getId());

      try (Span child = parent.createSpan("child")) {
        assertThat(child.getId()).isEqualTo(tracer.getCurrentContext().getId());
      }

      assertThat(parent.getId()).isEqualTo(tracer.getCurrentContext().getId());
    }
  }

  @Test
  public void currentSpanIsKeptOnTracerCorrectlyBetweenThreads() throws ExecutionException, InterruptedException {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);

    try (Span parent = tracer.getCurrentContext().createSpan("parent")) {
      assertThat(parent.getId()).isEqualTo(tracer.getCurrentContext().getId());

      Future<?> future = Executors.newSingleThreadExecutor().submit(() -> {
        Span child = null;
        try {
          child = parent.createSpan("child");
          assertThat(child.getId()).isEqualTo(tracer.getCurrentContext().getId());
        } finally {
          assert child != null;
          child.close();
        }

        // At this point, the parent span is undefind, but shouldn't be null

        assertThat(parent.getId()).isNotEqualTo(tracer.getCurrentContext().getId());
        assertThat(child.getId()).isNotEqualTo(tracer.getCurrentContext().getId());
        assertThat(tracer.getCurrentContext().getId()).isNotNull();
      });

      future.get();

      assertThat(parent.getId()).isEqualTo(tracer.getCurrentContext().getId());
    }
  }

  @Test
  public void cleverShenanigansRepresentingWhatWeSeeInTheRouter() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);

    CombinedHandler handler = new CombinedHandler();
    ExecutorService executors = Executors.newCachedThreadPool();

    handler.addHandler(Route.get("/status").to(() -> req -> {
      try (Span span = HttpTracing.newSpanAsChildOf(tracer, req, "status")) {
        executors.submit(span.wrap(() -> new HashSet<>(Arrays.asList("cheese", "peas")))).get();

        CompletableFuture<String> toReturn = new CompletableFuture<>();
        executors.submit(() -> {
          try {
            HttpRequest cheeseReq = new HttpRequest(GET, "/cheeses");
            HttpTracing.inject(tracer, span, cheeseReq);

            handler.execute(cheeseReq);
            toReturn.complete("nom, nom, nom");
          } catch (RuntimeException e) {
            toReturn.completeExceptionally(e);
          }
        });
        toReturn.get();
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
      return new HttpResponse();
    }));

    handler.addHandler(Route.get("/cheeses").to(() -> req -> new HttpResponse()));

    Routable routable = handler.with(delegate -> req -> {
      try (Span span = newSpanAsChildOf(tracer, req, "httpclient.execute")) {
        return delegate.execute(req);
      }
    });

    routable.execute(new HttpRequest(GET, "/"));
  }

  private Tracer createTracer(List<SpanData> exportTo) {
    TracerSdkProvider provider = OpenTelemetrySdk.getTracerProvider();
    provider.addSpanProcessor(SimpleSpansProcessor.create(new SpanExporter() {
      @Override
      public ResultCode export(Collection<SpanData> spans) {
        exportTo.addAll(spans);
        return ResultCode.SUCCESS;
      }

      @Override public ResultCode flush() {
        return ResultCode.SUCCESS;
      }

      @Override
      public void shutdown() {
      }
    }));

    io.opentelemetry.trace.Tracer otTracer = provider.get("get");
    return new OpenTelemetryTracer(
      otTracer,
      OpenTelemetry.getPropagators().getHttpTextFormat());
  }
}
