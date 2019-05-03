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

package org.openqa.selenium.grid.server;

import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Objects;
import java.util.logging.Logger;

public class EventBusConfig {

  private static final Logger LOG = Logger.getLogger(EventBus.class.getName());
  private static final String DEFAULT_CLASS = "org.openqa.selenium.events.zeromq.ZeroMqEventBus";
  
  private final Config config;
  private EventBus bus;

  public EventBusConfig(Config config) {
    this.config = Objects.requireNonNull(config, "Config must be set.");
  }

  public EventBus getEventBus() {
    if (bus == null) {
      synchronized (this) {
        if (bus == null) {
          bus = createBus();
        }
      }
    }

    return bus;
  }

  private EventBus createBus() {
    String clazzName = config.get("events", "implementation").orElse(DEFAULT_CLASS);
    LOG.finest("Creating event bus: " + clazzName);
    try {
      Class<?> busClazz = Class.forName(clazzName);
      Method create = busClazz.getMethod("create", Config.class);

      if (!Modifier.isStatic(create.getModifiers())) {
        throw new IllegalArgumentException(String.format(
            "Event bus class %s's `create(Config)` method must be static", clazzName));
      }

      if (!EventBus.class.isAssignableFrom(create.getReturnType())) {
        throw new IllegalArgumentException(String.format(
            "Event bus class %s's `create(Config)` method must return an EventBus", clazzName));
      }

      return (EventBus) create.invoke(null, config);
    } catch (NoSuchMethodException e) {
      throw new IllegalArgumentException(String.format(
          "Event bus class %s must have a static `create(Config)` method", clazzName));
    } catch (ReflectiveOperationException e) {
      throw new IllegalArgumentException("Unable to find event bus class: " + clazzName, e);
    }
  }
}
