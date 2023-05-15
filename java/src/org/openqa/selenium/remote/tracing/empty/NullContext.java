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

import java.util.UUID;
import java.util.concurrent.Callable;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.TraceContext;

public class NullContext implements TraceContext {

  private final String id = UUID.randomUUID().toString();

  @Override
  public String getId() {
    return id;
  }

  @Override
  public Span createSpan(String name) {
    Require.nonNull("Name", name);
    return new NullSpan();
  }

  @Override
  public Runnable wrap(Runnable runnable) {
    return Require.nonNull("Runnable", runnable);
  }

  @Override
  public <V> Callable<V> wrap(Callable<V> callable) {
    return Require.nonNull("Callable", callable);
  }
}
