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

import org.openqa.selenium.injector.Injector;
import org.openqa.selenium.remote.http.HttpRequest;

import java.lang.reflect.Constructor;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;

public abstract class Route<T extends Route> {

  private final List<Class<? extends CommandHandler>> decorators = new ArrayList<>();
  private Function<Injector, CommandHandler> fallback;

  protected Route() {
    // no-op
  }

  protected abstract void validate();

  protected abstract CommandHandler newHandler(Injector injector, HttpRequest request);

  /**
   * The given {@code decorator} must take a {@link CommandHandler} in its longest constructor.
   */
  public T decorateWith(Class<? extends CommandHandler> decorator) {
    Objects.requireNonNull(decorator);

    // Find the longest constructor, which is what the injector uses
    Constructor<?> constructor = Arrays.stream(decorator.getDeclaredConstructors())
        .max(Comparator.comparing(Constructor::getParameterCount))
        .orElse(null);

    if (constructor == null) {
      throw new IllegalArgumentException("Unable to find a constructor for " + decorator);
    }

    Boolean hasHandlerArg = Arrays.stream(constructor.getParameterTypes())
        .map(CommandHandler.class::isAssignableFrom)
        .reduce(Boolean::logicalOr)
        .orElse(false);

    if (!hasHandlerArg) {
      throw new IllegalArgumentException(
          "Decorator must take a CommandHandler as a constructor arg in its longest " +
          "constructor. " + decorator);
    }

    decorators.add(decorator);

    //noinspection unchecked
    return (T) this;
  }

  public T fallbackTo(Class<? extends CommandHandler> fallback) {
    Objects.requireNonNull(fallback);

    this.fallback = inj -> inj.newInstance(fallback);

    //noinspection unchecked
    return (T) this;
  }

  public T fallbackTo(CommandHandler fallback) {
    Objects.requireNonNull(fallback);

    this.fallback = inj -> fallback;

    //noinspection unchecked
    return (T) this;
  }

  public Routes build() {
    validate();

    BiFunction<Injector, HttpRequest, CommandHandler> func = (inj, req) -> {
      CommandHandler handler = newHandler(inj, req);
      if (handler == null) {
        return getFallback(inj);
      }

      Injector injector = inj;
      for (Class<? extends CommandHandler> decorator : decorators) {
        injector = Injector.builder().parent(injector).register(handler).build();
        handler = injector.newInstance(decorator);
      }

      return handler;
    };

    return new Routes(func);
  }

  protected CommandHandler getFallback(Injector injector) {
    return fallback == null ? null : fallback.apply(injector);
  }
}
