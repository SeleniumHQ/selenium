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

import org.openqa.selenium.Platform;
import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.remote.internal.ApacheHttpClient;
import org.openqa.selenium.remote.internal.OkHttpClient;

import java.io.IOException;
import java.net.URL;
import java.time.Duration;

/**
 * Defines a simple client for making HTTP requests.
 */
public interface HttpClient {

  String USER_AGENT = String.format(
      "selenium/%s (java %s)",
      new BuildInfo().getReleaseLabel(),
      (Platform.getCurrent().family() == null ?
          Platform.getCurrent().toString().toLowerCase() :
          Platform.getCurrent().family().toString().toLowerCase()));

  /**
   * Executes the given request, following any redirects if necessary.
   *
   * @param request the request to execute.
   * @return the final response.
   * @throws IOException if an I/O error occurs.
   */
  HttpResponse execute(HttpRequest request) throws IOException;

  interface Factory {

    static Factory createDefault() {
      String defaultFactory = System.getProperty("webdriver.http.factory", "okhttp");
      switch (defaultFactory) {
        case "apache":
          return new ApacheHttpClient.Factory();

        case "okhttp":
        default:
          return new OkHttpClient.Factory();
      }
    }

    /**
     * Creates a HTTP client that will send requests to the given URL.
     *
     * @param url URL
     * @return HttpClient
     */
    HttpClient createClient(URL url);

    /**
     * Creates a HTTP client that will send requests to the given URL.
     *
     * @param url URL
     * @param connectionTimeout int
     * @param readTimeout int
     * @return HttpClient
     */
    HttpClient createClient(URL url, Duration connectionTimeout, Duration readTimeout);

    /**
     * Closes idle clients.
     */
    void cleanupIdleClients();
  }
}
