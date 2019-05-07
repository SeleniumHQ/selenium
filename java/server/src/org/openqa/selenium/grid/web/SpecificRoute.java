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

import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.UrlTemplate;

import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.function.Supplier;

public class SpecificRoute extends Route<SpecificRoute> {

  private final HttpMethod method;
  private final UrlTemplate template;
  private Function<Map<String, String>, CommandHandler> handlerFunc;

  SpecificRoute(HttpMethod method, String template) {
    this.method = Objects.requireNonNull(method);
    this.template = new UrlTemplate(Objects.requireNonNull(template));
  }

  public SpecificRoute using(Supplier<CommandHandler> handlerSupplier) {
    Objects.requireNonNull(handlerSupplier);
    handlerFunc = params -> handlerSupplier.get();
    return this;
  }

  public SpecificRoute using(Function<Map<String, String>, CommandHandler> handlerGenerator) {
    Objects.requireNonNull(handlerGenerator);
    handlerFunc = handlerGenerator;
    return this;
  }

  public SpecificRoute using(CommandHandler handlerInstance) {
    Objects.requireNonNull(handlerInstance);
    handlerFunc = params -> handlerInstance;
    return this;
  }


  @Override
  protected void validate() {
    if (handlerFunc == null) {
      throw new IllegalStateException("Handler for route is required");
    }
  }

  @Override
  protected CommandHandler newHandler(HttpRequest request) {
    if (request.getMethod() != method) {
      return getFallback();
    }

    UrlTemplate.Match match = template.match(request.getUri());
    if (match == null) {
      return getFallback();
    }

    Map<String, String> params = match.getParameters();
    return handlerFunc.apply(params);
  }
}
