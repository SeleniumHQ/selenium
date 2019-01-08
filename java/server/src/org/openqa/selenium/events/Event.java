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

package org.openqa.selenium.events;

import java.util.Objects;
import java.util.UUID;

public class Event {

  private final UUID id;
  private final Type type;
  private final Object data;

  public Event(Type type, Object data) {
    this(UUID.randomUUID(), type, data);
  }

  public Event(UUID id, Type type, Object data) {
    this.id = Objects.requireNonNull(id, "Message id must be set.");
    this.type = Objects.requireNonNull(type, "Event type must be set.");
    this.data = data;
  }

  public UUID getId() {
    return id;
  }

  public Type getType() {
    return type;
  }

  public Object getData() {
    return data;
  }
}
