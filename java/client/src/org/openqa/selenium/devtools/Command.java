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

package org.openqa.selenium.devtools;

import com.google.common.collect.ImmutableMap;

import java.util.Map;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicLong;

public class Command {

  private static final AtomicLong NEXT_ID = new AtomicLong(1);

  private final long id;
  private final String method;
  private final Map<String, Object> params;

  public Command(String method, Map<String, Object> params) {
    this(NEXT_ID.getAndIncrement(), method, params);
  }

  public Command(long id, String method, Map<String, Object> params) {
    this.id = id;
    this.method = Objects.requireNonNull(method, "Method name must be set.");
    this.params = ImmutableMap.copyOf(Objects.requireNonNull(params, "Command parameters must be set."));
  }

  public long getId() {
    return id;
  }

  private Map<String, Object> toJson() {
    return ImmutableMap.of(
        "id", id,
        "method", method,
        "params", params);
  }
}
