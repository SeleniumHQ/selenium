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

package org.openqa.selenium.bidi;

import java.util.function.Consumer;
import org.openqa.selenium.Beta;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.internal.Require;

/**
 * Base class for generated BiDi module classes.
 *
 * <p>Subclasses delegate all wire operations through the driver's shared {@link Handle} — no new
 * WebSocket connection is opened.
 */
@Beta
public abstract class Module {

  private final Handle handle;

  protected Module(WebDriver driver) {
    Require.nonNull("WebDriver", driver);
    if (!(driver instanceof HasBiDi)) {
      throw new BiDiException("WebDriver does not support BiDi protocol");
    }
    this.handle = ((HasBiDi) driver).getHandle();
  }

  protected final <X> X send(Command<X> command) {
    return handle.send(command);
  }

  /**
   * Subscribes to a BiDi event, globally across all browsing contexts.
   *
   * @param event the event to subscribe to
   * @param handler invoked with the event's parameters each time it fires
   * @param <X> the event's parameter type
   * @return a subscription id that can be passed to {@link #unsubscribe(String)}
   */
  public final <X> String subscribe(Event<X> event, Consumer<X> handler) {
    return handle.subscribe(event, handler);
  }

  public final <X> String subscribe(Event<X> event, Consumer<X> handler, SubscriptionScope scope) {
    return handle.subscribe(event, handler, scope);
  }

  /**
   * Cancels a previously registered event subscription.
   *
   * @param subscriptionId a subscription id previously returned by {@link #subscribe}
   */
  public final void unsubscribe(String subscriptionId) {
    handle.unsubscribe(subscriptionId);
  }
}
