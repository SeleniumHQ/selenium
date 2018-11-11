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

import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.BuildInfo;

import io.opentracing.contrib.tracerresolver.TracerResolver;
import io.opentracing.noop.NoopTracerFactory;

import java.util.LinkedList;
import java.util.Objects;

/**
 * Represents an entry point for accessing all aspects of distributed tracing.
 */
public class DistributedTracer {

  private static volatile DistributedTracer INSTANCE = DistributedTracer.builder()
//      .registerDetectedTracers()
      .build();
  private static final ThreadLocal<LinkedList<Span>> ACTIVE_SPANS =
      ThreadLocal.withInitial(LinkedList::new);
  private final ImmutableSet<io.opencensus.trace.Tracer> ocTracers;
  private final ImmutableSet<io.opentracing.Tracer> otTracers;

  private DistributedTracer(
      ImmutableSet<io.opencensus.trace.Tracer> ocTracers,
      ImmutableSet<io.opentracing.Tracer> otTracers) {
    this.ocTracers = Objects.requireNonNull(ocTracers);
    this.otTracers = Objects.requireNonNull(otTracers);
  }

  public static DistributedTracer getInstance() {
    return INSTANCE;
  }

  public synchronized static void setInstance(DistributedTracer distributedTracer) {
    INSTANCE = distributedTracer;
  }

  public static Builder builder() {
    return new Builder();
  }

  /**
   * A distributed trace is made of a series of {@link Span}s, which are either
   * independent or have a parent/child relationship. Creating a span will make
   * it the currently active {@code Span}, as returned by
   * {@link #getActiveSpan()}.
   *
   * @param parent The parent span. If this is {@code null}, then the span is
   *               assumed to be independent.
   */
  public Span createSpan(String operation, Span parent) {
    if (parent != null) {
      Span child = parent.createChild(operation);
      setActiveSpan(child);
      return child;
    }

    ImmutableSet.Builder<Span> spans = ImmutableSet.builder();

    for (io.opencensus.trace.Tracer tracer : ocTracers) {
      spans.add(new OpenCensusSpan(this, tracer, null, "root"));
    }

    for (io.opentracing.Tracer tracer : otTracers) {
      spans.add(new OpenTracingSpan(this, tracer, null, "root"));
    }

    Span child = new CompoundSpan(this, spans.build());
    child.addTraceTag("selenium-version", new BuildInfo().getReleaseLabel());
    child.addTag("selenium-client", "java");
    setActiveSpan(child);
    return child;
  }

  /**
   * Each thread can have one currently active span. This can be accessed via
   * this method. If there is no currently active span, then a new one will
   * be created. Should a new span be created, it will be set as the currently
   * active span.
   */
  public Span getActiveSpan() {
    if (ACTIVE_SPANS.get().isEmpty()) {
      return null;
    }

    return ACTIVE_SPANS.get().getLast().activate();
  }

  void setActiveSpan(Span span) {
    ACTIVE_SPANS.get().add(span);
  }

  void remove(Span span) {
    Objects.requireNonNull(span, "Span to remove must not be null");

    ACTIVE_SPANS.get().removeIf(span::equals);
  }

  public static class Builder {

    private ImmutableSet.Builder<io.opencensus.trace.Tracer> ocTracers = ImmutableSet.builder();
    private ImmutableSet.Builder<io.opentracing.Tracer> otTracers = ImmutableSet.builder();

    private Builder() {
      // Only accessible through the parent class

      // Make sure we have at least one tracer, but make it one that does nothing.
      register(NoopTracerFactory.create());
    }

    public Builder registerDetectedTracers() {
      try {
        io.opentracing.Tracer tracer = TracerResolver.resolveTracer();
        if (tracer != null) {
          register(tracer);
        }
      } catch (Exception e) {
        // Carry on. This is fine.
      }
      return this;
    }

    public Builder register(io.opentracing.Tracer openTracingTracer) {
      otTracers.add(Objects.requireNonNull(openTracingTracer, "Tracer must be set."));
      return this;
    }

    public Builder register(io.opencensus.trace.Tracer openCensusTracer) {
      ocTracers.add(Objects.requireNonNull(openCensusTracer, "Tracer must be set."));
      return this;
    }

    public DistributedTracer build() {
      return new DistributedTracer(ocTracers.build(), otTracers.build());
    }
  }
}
