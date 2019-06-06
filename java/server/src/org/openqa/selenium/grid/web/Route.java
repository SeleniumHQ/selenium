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

package org.openqa.selenium.grid.web;

import org.openqa.selenium.remote.http.HttpRequest;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;
import java.util.function.Supplier;

@Deprecated
public abstract class Route<T extends Route> {

  private final List<Function<CommandHandler, CommandHandler>> decorators = new ArrayList<>();
  private Supplier<CommandHandler> fallback;

  protected Route() {
    // no-op
  }

  protected abstract void validate();

  protected abstract CommandHandler newHandler(HttpRequest request);

  public T decorateWith(Function<CommandHandler, CommandHandler> decorator) {
    decorators.add(decorator);
    //noinspection unchecked
    return (T) this;
  }

  public T fallbackTo(Supplier<CommandHandler> fallbackSupplier) {
    Objects.requireNonNull(fallbackSupplier);

    this.fallback = fallbackSupplier;

    //noinspection unchecked
    return (T) this;
  }

  public T fallbackTo(CommandHandler fallback) {
    Objects.requireNonNull(fallback);

    this.fallback = () -> fallback;

    //noinspection unchecked
    return (T) this;
  }

  public Routes build() {
    validate();

    Function<HttpRequest, CommandHandler> func = (req) -> {
      CommandHandler handler = newHandler(req);
      if (handler == null) {
        return getFallback();
      }

      for (Function<CommandHandler, CommandHandler> decorator : decorators) {
        handler = decorator.apply(handler);
      }

      return handler;
    };

    return new Routes(func);
  }

  protected CommandHandler getFallback() {
    return fallback == null ? null : fallback.get();
  }
}
