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

import java.lang.reflect.Type;
import java.util.function.Consumer;
import org.openqa.selenium.internal.Require;

public class EventListener<X> implements Consumer<Event> {

  private final EventName name;
  private final Consumer<X> handler;
  private final Type type;

  public EventListener(EventName name, Type typeOfX, Consumer<X> handler) {
    this.name = Require.nonNull("Event name", name);
    this.type = Require.nonNull("Type", typeOfX);
    this.handler = Require.nonNull("Event handler", handler);
  }

  public EventName getEventName() {
    return name;
  }

  @Override
  public void accept(Event event) {
    handler.accept(event.getData(type));
  }
}
