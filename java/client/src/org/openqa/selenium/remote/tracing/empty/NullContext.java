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

package org.openqa.selenium.remote.tracing.empty;

import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.SpanId;
import org.openqa.selenium.remote.tracing.TraceContext;

import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.Callable;

public class NullContext implements TraceContext {

  private final SpanId id = new SpanId(UUID.randomUUID());

  @Override
  public SpanId getId() {
    return id;
  }

  @Override
  public Span createSpan(String name) {
    Objects.requireNonNull(name, "Name to use must be set.");
    return new NullSpan();
  }

  @Override
  public Runnable wrap(Runnable runnable) {
    Objects.requireNonNull(runnable, "Runnable to use must be set.");
    return runnable;
  }

  @Override
  public <V> Callable<V> wrap(Callable<V> callable) {
    Objects.requireNonNull(callable, "Callable to use must be set.");
    return callable;
  }
}
