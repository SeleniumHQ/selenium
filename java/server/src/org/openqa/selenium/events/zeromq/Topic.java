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

package org.openqa.selenium.events.zeromq;

import org.openqa.selenium.events.Event;
import org.openqa.selenium.events.EventName;
import org.openqa.selenium.internal.Require;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Consumer;

class Topic {

  private final List<Consumer<Event>> listeners = new CopyOnWriteArrayList<>();
  private final EventName eventName;

  Topic(EventName forEventName) {
    this.eventName = Require.nonNull("Type", forEventName);
  }

  void addListener(Consumer<Event> listener) {
    listeners.add(Require.nonNull("Event listener", listener));
  }

  public void fire(Event event) {
    if (!eventName.equals(event.getType())) {
      return;
    }

    listeners.parallelStream().forEach(listener -> listener.accept(event));
  }
}
