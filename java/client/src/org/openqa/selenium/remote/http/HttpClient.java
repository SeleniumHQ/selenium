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

package org.openqa.selenium.remote.http;

import java.net.URL;
import java.util.Objects;

import static org.openqa.selenium.remote.http.ClientConfig.defaultConfig;

/**
 * Defines a simple client for making HTTP requests.
 */
public interface HttpClient extends HttpHandler {

  WebSocket openSocket(HttpRequest request, WebSocket.Listener listener);

  interface Factory {

    /**
     * Use the {@code webdriver.http.factory} system property to determine which implementation of
     * {@link HttpClient} should be used.
     */
    static Factory createDefault() {
      String defaultFactory = System.getProperty("webdriver.http.factory", "okhttp");
      switch (defaultFactory) {
        case "okhttp":
        default:
          try {
            Class<? extends Factory> clazz =
                Class.forName("org.openqa.selenium.remote.http.okhttp.OkHttpClient$Factory")
                    .asSubclass(Factory.class);
            return clazz.newInstance();
          } catch (ReflectiveOperationException e) {
            throw new UnsupportedOperationException("Unable to create HTTP client factory", e);
          }
      }
    }

    /**
     * Creates a HTTP client that will send requests to the given URL.
     *
     * @param url URL The base URL for requests.
     */
    default HttpClient createClient(URL url) {
      Objects.requireNonNull(url, "URL to use as base URL must be set.");
      return createClient(defaultConfig().baseUrl(url));
    }

    HttpClient createClient(ClientConfig config);

    /**
     * Closes idle clients.
     */
    default void cleanupIdleClients() {
      // do nothing by default.
    }
  }
}
