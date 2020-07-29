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

import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;

import java.util.Map;

public class NullSpan extends NullContext implements Span {

  @Override
  public Span setName(String name) {
    Require.nonNull("Name", name);
    return this;
  }

  @Override
  public Span setAttribute(String key, boolean value) {
    Require.nonNull("Key", key);
    return this;
  }

  @Override
  public Span setAttribute(String key, Number value) {
    Require.nonNull("Key", key);
    Require.nonNull("Value", value);
    return this;
  }

  @Override
  public Span setAttribute(String key, String value) {
    Require.nonNull("Key", key);
    Require.nonNull("Value", value);
    return this;
  }

  @Override
  public Span addEvent(String name) {
    Require.nonNull("Name", name);
    return this;
  }

  @Override
  public Span addEvent(String name, Map<String, EventAttributeValue> attributeMap) {
    Require.nonNull("Name", name);
    Require.nonNull("Event Attribute Map", attributeMap);
    return this;
  }

  @Override
  public Span setStatus(Status status) {
    Require.nonNull("Status", status);
    return this;
  }

  @Override
  public void close() {
    // no-op
  }
}
