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
import io.opentelemetry.common.AttributeValue;
import io.opentelemetry.common.Attributes;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.trace.TracerSdkProvider;
import io.opentelemetry.sdk.trace.data.SpanData;
import io.opentelemetry.sdk.trace.export.SimpleSpanProcessor;
import io.opentelemetry.sdk.trace.export.SpanExporter;
import org.junit.Test;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.remote.tracing.EventAttribute;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.HttpTracing;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;
import org.openqa.selenium.remote.tracing.Tracer;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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
      .filter(data -> data.getAttributes().get("cheese") != null)
      .collect(Collectors.toSet());

    assertThat(values).hasSize(1);
    assertThat(values).element(0)
        .extracting(SpanData::getStatus).isEqualTo(io.opentelemetry.trace.Status.NOT_FOUND);
    assertThat(values).element(0)
        .extracting(el -> el.getAttributes().get("cheese").getStringValue()).isEqualTo("gouda");

  }

  @Test
  public void shouldBeAbleToCreateASpanWithAEvent() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      span.addEvent(event);
    }

    assertThat(allSpans).hasSize(1);
    SpanData spanData = allSpans.get(0);
    assertThat(spanData.getEvents()).hasSize(1);

    List<SpanData.Event> timedEvents = spanData.getEvents();
    assertThat(timedEvents).element(0).extracting(SpanData.Event::getName)
        .isEqualTo(event);
    assertThat(timedEvents).element(0).extracting(SpanData.Event::getTotalAttributeCount)
        .isEqualTo(0);
  }

  @Test
  public void shouldBeAbleToCreateASpanWithEvents() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String startEvent = "Test event started";
    String endEvent = "Test event ended";

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      span.addEvent(startEvent);
      span.addEvent(endEvent);
    }

    assertThat(allSpans).hasSize(1);
    SpanData spanData = allSpans.get(0);
    assertThat(spanData.getEvents()).hasSize(2);

    List<SpanData.Event> timedEvents = spanData.getEvents();
    assertThat(timedEvents).element(0).extracting(SpanData.Event::getName)
        .isEqualTo(startEvent);
    assertThat(timedEvents).element(1).extracting(SpanData.Event::getName)
        .isEqualTo(endEvent);
    assertThat(timedEvents).element(0).extracting(SpanData.Event::getTotalAttributeCount)
        .isEqualTo(0);
  }

  @Test
  public void shouldBeAbleToCreateSpansWithEvents() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String httpEvent = "HTTP test event ";
    String databaseEvent = "Database test event";
    String httpSpan = "http.test";
    String databaseSpan = "db.test";

    try (Span span = tracer.getCurrentContext().createSpan(httpSpan)) {
      span.addEvent(httpEvent);
    }

    try (Span span = tracer.getCurrentContext().createSpan(databaseSpan)) {
      span.addEvent(databaseEvent);
    }

    assertThat(allSpans).hasSize(2);
    SpanData httpSpanData = allSpans.get(0);
    assertThat(httpSpanData.getEvents()).hasSize(1);
    List<SpanData.Event> httpTimedEvents = httpSpanData.getEvents();
    assertThat(httpTimedEvents).element(0).extracting(SpanData.Event::getName)
        .isEqualTo(httpEvent);

    SpanData dbSpanData = allSpans.get(1);
    assertThat(dbSpanData.getEvents()).hasSize(1);
    List<SpanData.Event> dbTimedEvents = dbSpanData.getEvents();
    assertThat(dbTimedEvents).element(0).extracting(SpanData.Event::getName)
        .isEqualTo(databaseEvent);
  }

  @Test
  public void canCreateASpanEventWithBooleanAttribute() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";
    String attribute = "testBoolean";

    Attributes.Builder attributes = new Attributes.Builder();
    attributes.setAttribute(attribute, AttributeValue.booleanAttributeValue(false));

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(attribute, EventAttribute.setValue(false));
      span.addEvent(event, attributeMap);
    }

    assertThat(allSpans).hasSize(1);
    List<SpanData.Event> timedEvents = allSpans.get(0).getEvents();
    assertThat(timedEvents).element(0).extracting(SpanData.Event::getName).isEqualTo(event);
    assertThat(timedEvents.get(0).getAttributes()).isEqualTo(attributes.build());
  }

  @Test
  public void canCreateASpanEventWithBooleanArrayAttributes() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";
    String arrayKey = "booleanArray";
    String varArgsKey = "booleanVarArgs";
    Boolean[] booleanArray = new Boolean[]{true, false};

    Attributes.Builder attributes = new Attributes.Builder();
    attributes.setAttribute(arrayKey, AttributeValue.arrayAttributeValue(booleanArray));
    attributes.setAttribute(varArgsKey, AttributeValue.arrayAttributeValue(true, false, true));

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(arrayKey, EventAttribute.setValue(booleanArray));
      attributeMap.put(varArgsKey, EventAttribute.setValue(true, false, true));
      span.addEvent(event, attributeMap);
    }

    assertThat(allSpans).hasSize(1);
    List<SpanData.Event> timedEvents = allSpans.get(0).getEvents();
    assertThat(timedEvents).element(0).extracting(SpanData.Event::getName).isEqualTo(event);
    assertThat(timedEvents.get(0).getAttributes()).isEqualTo(attributes.build());
  }

  @Test
  public void canCreateASpanEventWithDoubleAttribute() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";
    String attribute = "testDouble";
    Double attributeValue = 1.1;

    Attributes.Builder attributes = new Attributes.Builder();
    attributes.setAttribute(attribute, AttributeValue.doubleAttributeValue(attributeValue));

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(attribute, EventAttribute.setValue(attributeValue));
      span.addEvent(event, attributeMap);
    }

    assertThat(allSpans).hasSize(1);
    List<SpanData.Event> timedEvents = allSpans.get(0).getEvents();
    assertThat(timedEvents).element(0).extracting(SpanData.Event::getName).isEqualTo(event);
    assertThat(timedEvents.get(0).getAttributes()).isEqualTo(attributes.build());
  }

  @Test
  public void canCreateASpanEventWithDoubleArrayAttributes() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";
    String arrayKey = "doubleArray";
    String varArgsKey = "doubleVarArgs";
    Double[] doubleArray = new Double[]{4.5, 2.5};

    Attributes.Builder attributes = new Attributes.Builder();
    attributes.setAttribute(arrayKey, AttributeValue.arrayAttributeValue(doubleArray));
    attributes.setAttribute(varArgsKey, AttributeValue.arrayAttributeValue(2.2, 5.3));

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(arrayKey, EventAttribute.setValue(doubleArray));
      attributeMap.put(varArgsKey, EventAttribute.setValue(2.2, 5.3));
      span.addEvent(event, attributeMap);
    }

    assertThat(allSpans).hasSize(1);
    List<SpanData.Event> timedEvents = allSpans.get(0).getEvents();
    assertThat(timedEvents).element(0).extracting(SpanData.Event::getName).isEqualTo(event);
    assertThat(timedEvents.get(0).getAttributes()).isEqualTo(attributes.build());
  }

  @Test
  public void canCreateASpanEventWithLongAttribute() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";
    String attribute = "testLong";
    Long attributeValue = 500L;

    Attributes.Builder attributes = new Attributes.Builder();
    attributes.setAttribute(attribute, AttributeValue.longAttributeValue(attributeValue));

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(attribute, EventAttribute.setValue(attributeValue));
      span.addEvent(event, attributeMap);
    }

    assertThat(allSpans).hasSize(1);
    List<SpanData.Event> timedEvents = allSpans.get(0).getEvents();
    assertThat(timedEvents).element(0).extracting(SpanData.Event::getName).isEqualTo(event);
    assertThat(timedEvents.get(0).getAttributes()).isEqualTo(attributes.build());
  }

  @Test
  public void canCreateASpanEventWithLongArrayAttributes() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";
    String arrayKey = "longArray";
    String varArgsKey = "longVarArgs";
    Long[] longArray = new Long[]{400L, 200L};

    Attributes.Builder attributes = new Attributes.Builder();
    attributes.setAttribute(arrayKey, AttributeValue.arrayAttributeValue(longArray));
    attributes.setAttribute(varArgsKey, AttributeValue.arrayAttributeValue(250L, 5L));

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(arrayKey, EventAttribute.setValue(longArray));
      attributeMap.put(varArgsKey, EventAttribute.setValue(250L, 5L));
      span.addEvent(event, attributeMap);
    }

    assertThat(allSpans).hasSize(1);
    List<SpanData.Event> timedEvents = allSpans.get(0).getEvents();
    assertThat(timedEvents).element(0).extracting(SpanData.Event::getName).isEqualTo(event);
    assertThat(timedEvents.get(0).getAttributes()).isEqualTo(attributes.build());
  }

  @Test
  public void canCreateASpanEventWithStringAttribute() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";
    String attribute = "testString";
    String attributeValue = "attributeValue";

    Attributes.Builder attributes = new Attributes.Builder();
    attributes.setAttribute(attribute, AttributeValue.stringAttributeValue(attributeValue));

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(attribute, EventAttribute.setValue(attributeValue));
      span.addEvent(event, attributeMap);
    }

    assertThat(allSpans).hasSize(1);
    List<SpanData.Event> timedEvents = allSpans.get(0).getEvents();
    assertThat(timedEvents).element(0).extracting(SpanData.Event::getName).isEqualTo(event);
    assertThat(timedEvents.get(0).getAttributes()).isEqualTo(attributes.build());
  }

  @Test
  public void canCreateASpanEventWithStringArrayAttributes() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";
    String arrayKey = "strArray";
    String varArgsKey = "strVarArgs";
    String[] strArray = new String[]{"hey", "hello"};

    Attributes.Builder attributes = new Attributes.Builder();
    attributes.setAttribute(arrayKey, AttributeValue.arrayAttributeValue(strArray));
    attributes.setAttribute(varArgsKey, AttributeValue.arrayAttributeValue("hi", "hola"));

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(arrayKey, EventAttribute.setValue(strArray));
      attributeMap.put(varArgsKey, EventAttribute.setValue("hi", "hola"));
      span.addEvent(event, attributeMap);
    }

    assertThat(allSpans).hasSize(1);
    List<SpanData.Event> timedEvents = allSpans.get(0).getEvents();
    assertThat(timedEvents).element(0).extracting(SpanData.Event::getName).isEqualTo(event);
    assertThat(timedEvents.get(0).getAttributes()).isEqualTo(attributes.build());
  }

  @Test
  public void canCreateASpanEventWithSameAttributeType() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";
    String attribute = "testString";
    String attributeValue = "Hey";

    Attributes.Builder attributes = new Attributes.Builder();
    attributes.setAttribute(attribute, AttributeValue.stringAttributeValue(attributeValue));
    attributes.setAttribute(attribute, AttributeValue.stringAttributeValue(attributeValue));

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(attribute, EventAttribute.setValue(attributeValue));
      attributeMap.put(attribute, EventAttribute.setValue(attributeValue));
      span.addEvent(event, attributeMap);
    }

    assertThat(allSpans).hasSize(1);
    List<SpanData.Event> timedEvents = allSpans.get(0).getEvents();
    assertThat(timedEvents).element(0).extracting(SpanData.Event::getName).isEqualTo(event);
    assertThat(timedEvents.get(0).getAttributes()).isEqualTo(attributes.build());
  }

  @Test
  public void canCreateASpanEventWithMultipleAttributeTypes() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";
    String[] stringArray = new String[]{"Hey", "Hello"};
    Long[] longArray = new Long[]{10L, 5L};
    Double[] doubleArray = new Double[]{4.5, 2.5};
    Boolean[] booleanArray = new Boolean[]{true, false};

    Attributes.Builder attributes = new Attributes.Builder();
    attributes.setAttribute("testFloat", AttributeValue.doubleAttributeValue(5.5f));
    attributes.setAttribute("testInt", AttributeValue.longAttributeValue(10));
    attributes.setAttribute("testStringArray", AttributeValue.arrayAttributeValue(stringArray));
    attributes.setAttribute("testBooleanArray", AttributeValue.arrayAttributeValue(booleanArray));

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {

      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put("testFloat", EventAttribute.setValue(5.5f));
      attributeMap.put("testInt", EventAttribute.setValue(10));
      attributeMap.put("testStringArray", EventAttribute.setValue(stringArray));
      attributeMap.put("testBooleanArray", EventAttribute.setValue(booleanArray));

      span.addEvent(event, attributeMap);
    }

    assertThat(allSpans).hasSize(1);
    SpanData spanData = allSpans.get(0);
    assertThat(spanData.getEvents()).hasSize(1);

    List<SpanData.Event> timedEvents = spanData.getEvents();
    assertThat(timedEvents).element(0).extracting(SpanData.Event::getName).isEqualTo(event);
    assertThat(timedEvents.get(0).getAttributes()).isEqualTo(attributes.build());
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
    provider.addSpanProcessor(SimpleSpanProcessor.newBuilder(new SpanExporter() {
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
    }).build());

    io.opentelemetry.trace.Tracer otTracer = provider.get("get");
    return new OpenTelemetryTracer(
      otTracer,
      OpenTelemetry.getPropagators().getHttpTextFormat());
  }
}
