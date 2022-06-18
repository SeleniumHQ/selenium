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

import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.common.AttributesBuilder;
import io.opentelemetry.api.trace.StatusCode;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.context.Context;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.trace.SdkTracerProvider;
import io.opentelemetry.sdk.trace.data.EventData;
import io.opentelemetry.sdk.trace.data.SpanData;
import io.opentelemetry.sdk.trace.data.StatusData;
import io.opentelemetry.sdk.trace.export.SimpleSpanProcessor;
import io.opentelemetry.sdk.trace.export.SpanExporter;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
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

@Tag("UnitTests")
public class TracerTest {

  @BeforeEach
  public void before() {
    GlobalOpenTelemetry.resetForTest();
  }

  @AfterEach
  public void after() {
    GlobalOpenTelemetry.resetForTest();
  }

  @Test
  public void shouldBeAbleToCreateATracer() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      span.setAttribute("cheese", "gouda");
      span.setStatus(Status.NOT_FOUND);
    }

    Set<SpanData> values = allSpans.stream()
      .filter(data -> data.getAttributes().get(AttributeKey.stringKey("cheese")) != null)
      .collect(Collectors.toSet());

    assertThat(values).hasSize(1);
    assertThat(values).element(0)
        .extracting(SpanData::getStatus).extracting(StatusData::getStatusCode).isEqualTo(
        StatusCode.ERROR);
    assertThat(values).element(0)
        .extracting(el -> el.getAttributes().get(AttributeKey.stringKey("cheese"))).isEqualTo("gouda");
  }

  @Test
  public void shouldBeAbleToInjectContext() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);

    HttpRequest cheeseReq = new HttpRequest(GET, "/cheeses");

    assertThat(cheeseReq.getHeaderNames()).size().isEqualTo(0);

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      span.setAttribute("cheese", "gouda");
      span.setStatus(Status.NOT_FOUND);
      tracer.getPropagator().inject(tracer.getCurrentContext(),
        cheeseReq,
        (req, key, value) -> req.setHeader("cheese", "gouda"));
    }

    assertThat(cheeseReq.getHeaderNames()).size().isEqualTo(1);
    assertThat(cheeseReq.getHeaderNames()).element(0).isEqualTo("cheese");
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

    List<EventData> timedEvents = spanData.getEvents();
    assertThat(timedEvents).element(0).extracting(EventData::getName)
        .isEqualTo(event);
    assertThat(timedEvents).element(0).extracting(EventData::getTotalAttributeCount)
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

    List<EventData> timedEvents = spanData.getEvents();
    assertThat(timedEvents).element(0).extracting(EventData::getName)
        .isEqualTo(startEvent);
    assertThat(timedEvents).element(1).extracting(EventData::getName)
        .isEqualTo(endEvent);
    assertThat(timedEvents).element(0).extracting(EventData::getTotalAttributeCount)
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
    List<EventData> httpTimedEvents = httpSpanData.getEvents();
    assertThat(httpTimedEvents).element(0).extracting(EventData::getName)
        .isEqualTo(httpEvent);

    SpanData dbSpanData = allSpans.get(1);
    assertThat(dbSpanData.getEvents()).hasSize(1);
    List<EventData> dbTimedEvents = dbSpanData.getEvents();
    assertThat(dbTimedEvents).element(0).extracting(EventData::getName)
        .isEqualTo(databaseEvent);
  }

  @Test
  public void canCreateASpanEventWithBooleanAttribute() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";
    String attribute = "testBoolean";

    AttributesBuilder attributes = Attributes.builder();
    attributes.put(attribute, false);

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(attribute, EventAttribute.setValue(false));
      span.addEvent(event, attributeMap);
    }

    assertThat(allSpans).hasSize(1);
    List<EventData> timedEvents = allSpans.get(0).getEvents();
    assertThat(timedEvents).element(0).extracting(EventData::getName).isEqualTo(event);
    assertThat(timedEvents.get(0).getAttributes()).isEqualTo(attributes.build());
  }

  @Test
  public void canCreateASpanEventWithBooleanArrayAttributes() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";
    String arrayKey = "booleanArray";
    String varArgsKey = "booleanVarArgs";
    boolean[] booleanArray = new boolean[]{true, false};

    AttributesBuilder attributes = Attributes.builder();
    attributes.put(arrayKey, booleanArray);
    attributes.put(varArgsKey, true, false, true);

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(arrayKey, EventAttribute.setValue(booleanArray));
      attributeMap.put(varArgsKey, EventAttribute.setValue(true, false, true));
      span.addEvent(event, attributeMap);
    }

    assertThat(allSpans).hasSize(1);
    List<EventData> timedEvents = allSpans.get(0).getEvents();
    assertThat(timedEvents).element(0).extracting(EventData::getName).isEqualTo(event);
    assertThat(timedEvents.get(0).getAttributes()).isEqualTo(attributes.build());
  }

  @Test
  public void canCreateASpanEventWithDoubleAttribute() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";
    String attribute = "testDouble";
    Double attributeValue = 1.1;

    AttributesBuilder attributes = Attributes.builder();
    attributes.put(attribute, attributeValue);

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(attribute, EventAttribute.setValue(attributeValue));
      span.addEvent(event, attributeMap);
    }

    assertThat(allSpans).hasSize(1);
    List<EventData> timedEvents = allSpans.get(0).getEvents();
    assertThat(timedEvents).element(0).extracting(EventData::getName).isEqualTo(event);
    assertThat(timedEvents.get(0).getAttributes()).isEqualTo(attributes.build());
  }

  @Test
  public void canCreateASpanEventWithDoubleArrayAttributes() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";
    String arrayKey = "doubleArray";
    String varArgsKey = "doubleVarArgs";
    double[] doubleArray = new double[]{4.5, 2.5};

    AttributesBuilder attributes = Attributes.builder();
    attributes.put(arrayKey, doubleArray);
    attributes.put(varArgsKey, 2.2, 5.3);

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(arrayKey, EventAttribute.setValue(doubleArray));
      attributeMap.put(varArgsKey, EventAttribute.setValue(2.2, 5.3));
      span.addEvent(event, attributeMap);
    }

    assertThat(allSpans).hasSize(1);
    List<EventData> timedEvents = allSpans.get(0).getEvents();
    assertThat(timedEvents).element(0).extracting(EventData::getName).isEqualTo(event);
    assertThat(timedEvents.get(0).getAttributes()).isEqualTo(attributes.build());
  }

  @Test
  public void canCreateASpanEventWithLongAttribute() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";
    String attribute = "testLong";
    Long attributeValue = 500L;

    AttributesBuilder attributes = Attributes.builder();
    attributes.put(attribute, attributeValue);

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(attribute, EventAttribute.setValue(attributeValue));
      span.addEvent(event, attributeMap);
    }

    assertThat(allSpans).hasSize(1);
    List<EventData> timedEvents = allSpans.get(0).getEvents();
    assertThat(timedEvents).element(0).extracting(EventData::getName).isEqualTo(event);
    assertThat(timedEvents.get(0).getAttributes()).isEqualTo(attributes.build());
  }

  @Test
  public void canCreateASpanEventWithLongArrayAttributes() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";
    String arrayKey = "longArray";
    String varArgsKey = "longVarArgs";
    long[] longArray = new long[]{400L, 200L};

    AttributesBuilder attributes = Attributes.builder();
    attributes.put(arrayKey, longArray);
    attributes.put(varArgsKey, 250L, 5L);

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(arrayKey, EventAttribute.setValue(longArray));
      attributeMap.put(varArgsKey, EventAttribute.setValue(250L, 5L));
      span.addEvent(event, attributeMap);
    }

    assertThat(allSpans).hasSize(1);
    List<EventData> timedEvents = allSpans.get(0).getEvents();
    assertThat(timedEvents).element(0).extracting(EventData::getName).isEqualTo(event);
    assertThat(timedEvents.get(0).getAttributes()).isEqualTo(attributes.build());
  }

  @Test
  public void canCreateASpanEventWithStringAttribute() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";
    String attribute = "testString";
    String attributeValue = "attributeValue";

    AttributesBuilder attributes = Attributes.builder();
    attributes.put(attribute, attributeValue);

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(attribute, EventAttribute.setValue(attributeValue));
      span.addEvent(event, attributeMap);
    }

    assertThat(allSpans).hasSize(1);
    List<EventData> timedEvents = allSpans.get(0).getEvents();
    assertThat(timedEvents).element(0).extracting(EventData::getName).isEqualTo(event);
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

    AttributesBuilder attributes = Attributes.builder();
    attributes.put(arrayKey, strArray);
    attributes.put(varArgsKey, "hi", "hola");

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(arrayKey, EventAttribute.setValue(strArray));
      attributeMap.put(varArgsKey, EventAttribute.setValue("hi", "hola"));
      span.addEvent(event, attributeMap);
    }

    assertThat(allSpans).hasSize(1);
    List<EventData> timedEvents = allSpans.get(0).getEvents();
    assertThat(timedEvents).element(0).extracting(EventData::getName).isEqualTo(event);
    assertThat(timedEvents.get(0).getAttributes()).isEqualTo(attributes.build());
  }

  @Test
  public void canCreateASpanEventWithSameAttributeType() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";
    String attribute = "testString";
    String attributeValue = "Hey";

    AttributesBuilder attributes = Attributes.builder();
    attributes.put(attribute, attributeValue);
    attributes.put(attribute, attributeValue);

    try (Span span = tracer.getCurrentContext().createSpan("parent")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(attribute, EventAttribute.setValue(attributeValue));
      attributeMap.put(attribute, EventAttribute.setValue(attributeValue));
      span.addEvent(event, attributeMap);
    }

    assertThat(allSpans).hasSize(1);
    List<EventData> timedEvents = allSpans.get(0).getEvents();
    assertThat(timedEvents).element(0).extracting(EventData::getName).isEqualTo(event);
    assertThat(timedEvents.get(0).getAttributes()).isEqualTo(attributes.build());
  }

  @Test
  public void canCreateASpanEventWithMultipleAttributeTypes() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);
    String event = "Test event";
    String[] stringArray = new String[]{"Hey", "Hello"};
    boolean[] booleanArray = new boolean[]{true, false};

    AttributesBuilder attributes = Attributes.builder();
    attributes.put("testFloat", 5.5f);
    attributes.put("testInt", 10);
    attributes.put("testStringArray", stringArray);
    attributes.put("testBooleanArray", booleanArray);

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

    List<EventData> timedEvents = spanData.getEvents();
    assertThat(timedEvents).element(0).extracting(EventData::getName).isEqualTo(event);
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

        // At this point, the parent span is undefined, but shouldn't be null

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
      } catch (InterruptedException | ExecutionException e) {
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

  @Test
  public void shouldBeAbleToSetExternalContextAndCreatedSpansAreItsChildren() {
    List<SpanData> allSpans = new ArrayList<>();
    Tracer tracer = createTracer(allSpans);

    OpenTelemetrySdk openTelemetrySdk = OpenTelemetrySdk.builder().build();
    io.opentelemetry.api.trace.Span externalSpan = openTelemetrySdk
        .getTracer("externalTracer")
        .spanBuilder("externalSpan")
        .startSpan();
    Context parentContext = Context.current().with(externalSpan);
    tracer.setOpenTelemetryContext(parentContext);

    Span parent = tracer.getCurrentContext().createSpan("parent");
    try (Span child = parent.createSpan("child")) {
    }
    parent.close();

    assertThat(allSpans).hasSize(2);
    assertThat(allSpans.get(0).getName()).isEqualTo("child");
    assertThat(allSpans.get(0).getParentSpanId())
        .isEqualTo(parent.getId());
    assertThat(allSpans.get(1).getName()).isEqualTo("parent");
    assertThat(allSpans.get(1).getParentSpanId())
        .isEqualTo(externalSpan.getSpanContext().getSpanId());
  }

  private Tracer createTracer(List<SpanData> exportTo) {
    ContextPropagators propagators =
      ContextPropagators.create((W3CTraceContextPropagator.getInstance()));
    SdkTracerProvider sdkTracerProvider = SdkTracerProvider.builder()
      .addSpanProcessor(SimpleSpanProcessor.create(new SpanExporter() {
        @Override
        public CompletableResultCode export(Collection<SpanData> spans) {
          exportTo.addAll(spans);
          return CompletableResultCode.ofSuccess();
        }

        @Override public CompletableResultCode flush() {
          return CompletableResultCode.ofSuccess();
        }

        @Override
        public CompletableResultCode shutdown() {
          return CompletableResultCode.ofSuccess();
        }
      }))
      .build();

    OpenTelemetrySdk openTelemetrySdk = OpenTelemetrySdk.builder()
      .setTracerProvider(sdkTracerProvider)
      .setPropagators(propagators)
      .buildAndRegisterGlobal();

    Runtime.getRuntime()
      .addShutdownHook(new Thread(sdkTracerProvider::close));

    return new OpenTelemetryTracer(
      openTelemetrySdk.getTracer("test"),
      propagators.getTextMapPropagator());
  }
}
