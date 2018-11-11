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

import static org.openqa.selenium.remote.http.HttpMethod.DELETE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.collect.ImmutableList;

import org.openqa.selenium.injector.Injector;
import org.openqa.selenium.remote.http.HttpRequest;

import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;
import java.util.function.BiFunction;
import java.util.function.Predicate;
import java.util.stream.Stream;

public class Routes {

  private final BiFunction<Injector, HttpRequest, CommandHandler> handlerFunc;

  Routes(BiFunction<Injector, HttpRequest, CommandHandler> handlerFunc) {
    this.handlerFunc = Objects.requireNonNull(handlerFunc);
  }

  public static PredicatedRoute matching(Predicate<HttpRequest> predicate) {
    return new PredicatedRoute(predicate);
  }

  public static SpecificRoute delete(String template) {
    return new SpecificRoute(DELETE, template);
  }

  public static SpecificRoute get(String template) {
    return new SpecificRoute(GET, template);
  }

  public static SpecificRoute post(String template) {
    return new SpecificRoute(POST, template);
  }

  public static CombinedRoute combine(Route atLeastOne, Route... optionalOthers) {
    return combine(
        atLeastOne.build(),
        Arrays.stream(optionalOthers).map(Route::build).toArray(Routes[]::new));
  }

  public static CombinedRoute combine(
      Routes atLeastOne,
      Routes... optionalOthers) {
    ImmutableList<Routes> queue =
        Stream.concat(Stream.of(atLeastOne), Arrays.stream(optionalOthers))
            .collect(ImmutableList.toImmutableList());

    return new CombinedRoute(queue.reverse());
  }

  public  Optional<CommandHandler> match(Injector injector, HttpRequest request) {
    return Optional.ofNullable(handlerFunc.apply(injector, request));
  }

}
