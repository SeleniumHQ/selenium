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

import static org.openqa.selenium.events.zeromq.UnboundZmqEventBus.REJECTED_EVENT;

import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.EventListener;
import org.openqa.selenium.events.EventName;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.security.SecretOptions;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.net.Urls;
import org.zeromq.ZContext;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.function.Consumer;

/**
 * An {@link EventBus} backed by ZeroMQ.
 */
public class ZeroMqEventBus {

  private static final String EVENTS_SECTION = "events";

  private ZeroMqEventBus() {
    // Use the create method.
  }

  public static EventBus create(ZContext context, String publish, String subscribe, boolean bind, Secret secret) {
    if (bind) {
      return new BoundZmqEventBus(context, publish, subscribe, secret);
    }
    return new UnboundZmqEventBus(context, publish, subscribe, secret);
  }

  public static EventBus create(Config config) {
    String publish = config.get(EVENTS_SECTION, "publish")
      .orElseGet(() -> {
        URI uri = config.get("node", "hub")
          .map(Urls::from)
          .orElseThrow(() -> new IllegalArgumentException(
            "Unable to find address to publish events to."));
        return mungeUri(uri, "tcp", 4442);
      });

    String subscribe = config.get(EVENTS_SECTION, "subscribe")
      .orElseGet(() -> {
        URI uri = config.get("node", "hub")
          .map(Urls::from)
          .orElseThrow(() -> new IllegalArgumentException(
            "Unable to find address to subscribe for events from."));
        return mungeUri(uri, "tcp", 4443);
      });

    boolean bind = config.getBool(EVENTS_SECTION, "bind").orElse(false);

    SecretOptions secretOptions = new SecretOptions(config);

    return create(new ZContext(), publish, subscribe, bind, secretOptions.getRegistrationSecret());
  }

  private static String mungeUri(URI base, String scheme, int port) {
    try {
      return new URI(
        scheme,
        null,
        base.getHost(),
        port,
        null,
        null,
        null)
        .toString();
    } catch (URISyntaxException e) {
      throw new ConfigException("Unable to create URI from " + base);
    }
  }

  public static EventListener<RejectedEvent> onRejectedEvent(Consumer<RejectedEvent> handler) {
    Require.nonNull("Handler", handler);
    return new EventListener<>(REJECTED_EVENT, RejectedEvent.class, handler);
  }

  public static class RejectedEvent {
    private final EventName name;
    private final Object data;

    RejectedEvent(EventName name, Object data) {
      this.name = name;
      this.data = data;
    }

    private static RejectedEvent fromJson(JsonInput input) {
      EventName name = null;
      Object data = null;

      input.beginObject();
      while (input.hasNext()) {
        switch (input.nextName()) {
          case "data":
            data = input.read(Object.class);
            break;

          case "name":
            name = input.read(EventName.class);
            break;

          default:
            input.skipValue();
            break;
        }
      }
      input.endObject();

      return new RejectedEvent(name, data);
    }

    public EventName getName() {
      return name;
    }

    public Object getData() {
      return data;
    }
  }
}
