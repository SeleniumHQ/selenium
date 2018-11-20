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

import static org.assertj.core.api.Assertions.assertThat;

import com.google.common.collect.ImmutableSet;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.openqa.selenium.remote.tracing.simple.SimpleTracer;

import io.opencensus.trace.Tracing;

import java.util.Collection;

@RunWith(Parameterized.class)
public class DistributedTracerTest {

  @Parameterized.Parameters(name = "Tracer {0}")
  public static Collection<DistributedTracer> buildTracers() {
    return ImmutableSet.of(
        DistributedTracer.builder().use(new SimpleTracer()).build(),
        DistributedTracer.builder().use(Tracing.getTracer()).build());
  }

  @Parameterized.Parameter
  public DistributedTracer tracer;

  @Test
  public void creatingASpanImplicitlyMakesItActive() {
    try (Span span = tracer.createSpan("welcome", null)) {
      assertThat(tracer.getActiveSpan()).isEqualTo(span);
    }
  }

  @Test
  public void shouldBeAbleToSetASpanAsActive() {
    try (Span span = tracer.createSpan("welcome", null)) {
      span.activate();
      assertThat(tracer.getActiveSpan()).isEqualTo(span);
    }
  }

  @Test
  public void childSpansAutomaticallyBecomeActive() {
    try (Span parent = tracer.createSpan("parent", null)) {
      try (Span child = tracer.createSpan("child", parent)) {
        assertThat(tracer.getActiveSpan()).isEqualTo(child);
      }
    }
  }
}
