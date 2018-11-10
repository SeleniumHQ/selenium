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

import java.util.Objects;

class CompoundSpan implements Span {

  private final DistributedTracer tracer;
  private final ImmutableSet<Span> allSpans;

  public CompoundSpan(DistributedTracer tracer, ImmutableSet<Span> allSpans) {
    this.tracer = Objects.requireNonNull(tracer);
    this.allSpans = Objects.requireNonNull(allSpans);
  }

  @Override
  public Span activate() {
    allSpans.forEach(Span::activate);

    // It's important we do this last, since the activations of all the wrapped spans has caused
    // them to _also_ attempt to set themselves as the active span.
    tracer.setActiveSpan(this);
    return this;
  }

  @Override
  public Span createChild(String operation) {
    ImmutableSet.Builder<Span> allChildren = ImmutableSet.builder();
    allSpans.forEach(span -> allChildren.add(span.createChild(operation)));

    CompoundSpan child = new CompoundSpan(tracer, allChildren.build());
    return child.activate();
  }

  @Override
  public Span addTraceTag(String key, String value) {
    Objects.requireNonNull(key, "Key must be set");
    allSpans.forEach(span -> span.addTraceTag(key, value));
    return this;
  }

  @Override
  public Span addTag(String key, String value) {
    Objects.requireNonNull(key, "Key must be set");
    allSpans.forEach(span -> span.addTag(key, value));
    return this;
  }

  @Override
  public Span addTag(String key, boolean value) {
    Objects.requireNonNull(key, "Key must be set");
    allSpans.forEach(span -> span.addTag(key, value));
    return this;
  }

  @Override
  public Span addTag(String key, long value) {
    Objects.requireNonNull(key, "Key must be set");
    allSpans.forEach(span -> span.addTag(key, value));
    return this;
  }

  @Override
  public void close() {
    allSpans.forEach(Span::close);
    tracer.remove(this);
  }
}
