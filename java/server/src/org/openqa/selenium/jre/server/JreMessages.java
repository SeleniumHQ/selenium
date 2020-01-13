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

package org.openqa.selenium.jre.server;

import com.sun.net.httpserver.HttpExchange;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;

import java.util.AbstractMap;
import java.util.Arrays;

import static org.openqa.selenium.remote.http.Contents.memoize;

class JreMessages {

  static HttpRequest asRequest(HttpExchange exchange) {
    HttpRequest request = new HttpRequest(
      HttpMethod.valueOf(exchange.getRequestMethod()),
      exchange.getRequestURI().getPath());

    String query = exchange.getRequestURI().getQuery();
    if (query != null) {
      Arrays.stream(query.split("&"))
        .map(q -> {
          int i = q.indexOf("=");
          if (i == -1) {
            return new AbstractMap.SimpleImmutableEntry<>(q, "");
          }
          return new AbstractMap.SimpleImmutableEntry<>(q.substring(0, i), q.substring(i + 1));
        })
        .forEach(entry -> request.addQueryParameter(entry.getKey(), entry.getValue()));
    }

    exchange.getRequestHeaders().forEach((name, values) -> values.forEach(value -> request.addHeader(name, value)));

    request.setContent(memoize(exchange::getRequestBody));

    return request;
  }

}
