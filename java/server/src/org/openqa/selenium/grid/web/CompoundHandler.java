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

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterators;
import com.google.common.collect.Ordering;
import com.google.common.collect.Sets;

import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.injector.Injector;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Predicate;

/**
 * Presents a collection of {@link CommandHandler}s as a single unit. Should there be more than one
 * handler that responds to a given {@link HttpRequest}, then the last one returned from the
 * underlying {@link Map}'s key set will be returned (that is, if the map preserves insertion order
 * the last inserted handler will be returned). This means that handlers added later take precedence
 * over handlers added first, allowing them to be overridden.
 */
public class CompoundHandler implements Predicate<HttpRequest>, CommandHandler {

  private final Injector injector;
  private final Map<Predicate<HttpRequest>, BiFunction<Injector, HttpRequest, CommandHandler>>
      handlers;

  public CompoundHandler(
      Injector injector,
      Map<Predicate<HttpRequest>, BiFunction<Injector, HttpRequest, CommandHandler>> handlers) {

    this.injector = Objects.requireNonNull(injector, "Injector must be set");

    Objects.requireNonNull(handlers, "Handlers to use must be set");

    // First reverse the key set. In maps without a defined order in the key set, this doesn't mean
    // much.
    Deque<Predicate<HttpRequest>> deque = new ArrayDeque<>();
    handlers.keySet().forEach(deque::addFirst);

    // Now bbuild up the map we want to actually use.
    ImmutableMap.Builder<Predicate<HttpRequest>, BiFunction<Injector, HttpRequest, CommandHandler>>
        built = ImmutableMap.builder();
    deque.forEach(key -> built.put(key, handlers.get(key)));
    this.handlers = built.build();
  }

  @Override
  public boolean test(HttpRequest request) {
    return handlers.keySet().parallelStream().anyMatch(pred -> pred.test(request));
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    BiFunction<Injector, HttpRequest, CommandHandler> generator =
        handlers.entrySet().stream()
            .filter(entry -> entry.getKey().test(req))
            .map(Map.Entry::getValue)
            .findFirst()
            .orElseThrow(() -> new UnsupportedCommandException(String.format(
                "Unknown command: (%s) %s", req.getMethod(), req.getUri())));

    CommandHandler handler = generator.apply(injector, req);
    handler.execute(req, resp);
  }
}
