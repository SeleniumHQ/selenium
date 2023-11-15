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

package org.openqa.selenium.remote;

import static org.openqa.selenium.remote.http.Contents.asJson;

import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.Filter;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpResponse;

public class ErrorFilter implements Filter {

  private final ErrorCodec errors;

  public ErrorFilter() {
    this(ErrorCodec.createDefault());
  }

  public ErrorFilter(ErrorCodec errors) {
    this.errors = Require.nonNull("Error codec", errors);
  }

  @Override
  public HttpHandler apply(HttpHandler next) {
    return req -> {
      try {
        return next.execute(req);
      } catch (Throwable throwable) {
        return new HttpResponse()
            .setHeader("Cache-Control", "none")
            .setHeader("Content-Type", Json.JSON_UTF_8)
            .setStatus(errors.getHttpStatusCode(throwable))
            .setContent(asJson(errors.encode(throwable)));
      }
    };
  }
}
