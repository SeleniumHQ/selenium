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
import org.openqa.selenium.remote.tracing.Status;

import java.util.Objects;

public class NullSpan extends NullContext implements Span {

  @Override
  public Span setName(String name) {
    Objects.requireNonNull(name, "Name to use must be set.");
    return this;
  }

  @Override
  public Span setAttribute(String key, boolean value) {
    Objects.requireNonNull(key, "Key to use must be set.");
    return this;
  }

  @Override
  public Span setAttribute(String key, Number value) {
    Objects.requireNonNull(key, "Key to use must be set.");
    Objects.requireNonNull(value, "Value to use must be set.");
    return this;
  }

  @Override
  public Span setAttribute(String key, String value) {
    Objects.requireNonNull(key, "Key to use must be set.");
    Objects.requireNonNull(value, "Value to use must be set.");
    return this;
  }

  @Override
  public Span setStatus(Status status) {
    Objects.requireNonNull(status, "Status to use must be set.");
    return this;
  }

  @Override
  public void close() {
    // no-op
  }
}
