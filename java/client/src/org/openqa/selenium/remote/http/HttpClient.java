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

import static com.google.common.base.Preconditions.checkArgument;
import static java.util.Objects.requireNonNull;

import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.internal.OkHttpClient;

import java.io.IOException;
import java.net.Proxy;
import java.net.URL;
import java.time.Duration;
import java.util.Objects;
import java.util.Locale;

/**
 * Defines a simple client for making HTTP requests.
 */
public interface HttpClient {

  String USER_AGENT = String.format(
      "selenium/%s (java %s)",
      new BuildInfo().getReleaseLabel(),
      (Platform.getCurrent().family() == null ?
       Platform.getCurrent().toString().toLowerCase(Locale.US) :
       Platform.getCurrent().family().toString().toLowerCase(Locale.US)));

  /**
   * Executes the given request, following any redirects if necessary.
   *
   * @param request the request to execute.
   * @return the final response.
   * @throws IOException if an I/O error occurs.
   */
  HttpResponse execute(HttpRequest request) throws IOException;

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
          return new OkHttpClient.Factory();
      }
    }

    /**
     * By default {@link #createClient(URL)} will pick sensible defaults for the {@link HttpClient}
     * to use, but if more control is needed, the {@link Builder} gives access to this.
     */
    Builder builder();

    /**
     * Creates a HTTP client that will send requests to the given URL.
     *
     * @param url URL The base URL for requests.
     */
    default HttpClient createClient(URL url) {
      return builder().createClient(url);
    }

    /**
     * Closes idle clients.
     */
    void cleanupIdleClients();
  }

  abstract class Builder {

    protected Duration connectionTimeout = Duration.ofMinutes(2);
    protected Duration readTimeout = Duration.ofHours(3);
    protected Proxy proxy = null;

    /**
     * Set the connection timeout to a given value. Note that setting to negative values is not
     * allowed, and that a timeout of {@code 0} results in unspecified behaviour.
     */
    public Builder connectionTimeout(Duration duration) {
      requireNonNull(duration, "Connection time out must be set");
      checkArgument(!duration.isNegative(), "Connection time out cannot be negative");

      this.connectionTimeout = duration;

      return this;
    }

    /**
     * Set the read timeout to a given value. Note that setting to negative values is not
     * allowed, and that a timeout of {@code 0} results in unspecified behaviour.
     */
    public Builder readTimeout(Duration duration) {
      requireNonNull(duration, "Read time out must be set");
      checkArgument(!duration.isNegative(), "Read time out cannot be negative");

      this.readTimeout = duration;

      return this;
    }

    /**
     * Set the {@link Proxy} that should be used by the {@link HttpClient} (<b>not</b> the
     * {@link org.openqa.selenium.WebDriver} instance!). If this is not set, then an implementation
     * specific method for selecting a proxy will be used.
     */
    public Builder proxy(Proxy proxy) {
      this.proxy = Objects.requireNonNull(proxy, "Proxy must be set");

      return this;
    }

    public abstract HttpClient createClient(URL url);
  }
}
