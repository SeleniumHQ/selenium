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

package org.openqa.selenium.remote.tracing;

import io.opentelemetry.trace.Tracer;
import org.openqa.selenium.remote.http.Filter;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;

import java.util.Objects;
import java.util.function.Function;

public class SpanDecorator implements Filter {

  private final Tracer tracer;
  private final Function<HttpRequest, String> namer;

  public SpanDecorator(Tracer tracer, Function<HttpRequest, String> namer) {
    this.tracer = Objects.requireNonNull(tracer, "Tracer to use must be set.");
    this.namer = Objects.requireNonNull(namer, "Naming function must be set.");
  }

  @Override
  public HttpHandler apply(HttpHandler handler) {
    return new SpanWrappedHttpHandler(tracer, namer, handler);
  }
}
