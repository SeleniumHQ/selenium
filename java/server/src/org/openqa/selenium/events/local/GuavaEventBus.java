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

package org.openqa.selenium.events.local;

import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.Subscribe;

import org.openqa.selenium.events.Event;
import org.openqa.selenium.events.Type;
import org.openqa.selenium.grid.config.Config;

import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.function.Consumer;

public class GuavaEventBus implements org.openqa.selenium.events.EventBus {

  private final EventBus guavaBus;
  private final List<Listener> allListeners = new LinkedList<>();

  public GuavaEventBus() {
    guavaBus = new EventBus();
  }

  @Override
  public void addListener(Type type, Consumer<Event> onType) {
    Listener listener = new Listener(type, onType);
    allListeners.add(listener);
    guavaBus.register(listener);
  }

  @Override
  public void fire(Event event) {
    Objects.requireNonNull(event);
    guavaBus.post(event);
  }

  @Override
  public void close() {
    allListeners.forEach(guavaBus::unregister);
    allListeners.clear();
  }

  public static GuavaEventBus create(Config config) {
    return new GuavaEventBus();
  }

  private static class Listener {

    private final Type type;
    private final Consumer<Event> onType;

    public Listener(Type type, Consumer<Event> onType) {
      this.type = Objects.requireNonNull(type);
      this.onType = Objects.requireNonNull(onType);
    }

    @Subscribe
    public void handle(Event event) {
      if (type.equals(event.getType())) {
        onType.accept(event);
      }
    }
  }
}
