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

package org.openqa.selenium.devtools;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.HasDevTools;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.Filter;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;

import java.util.Map;
import java.util.Optional;

import static org.openqa.selenium.remote.http.Contents.utf8String;

/**
 * Provides a mechanism for stubbing out responses to requests in drivers which
 * implement {@link HasDevTools}. Usage is done by specifying a {@link Route},
 * which will be checked for every request to see if that request should be
 * handled or not. Note that the URLs given to the {@code Route} will be fully
 * qualified.
 * <p>
 * Example usage:
 * <p>
 * <pre><code>
 *   Route route = Route.matching(req -&gt; GET == req.getMethod() &amp;&amp; req.getUri().endsWith("/example"))
 *     .to(() -&gt; req -&gt; new HttpResponse().setContent(Contents.utf8String("Hello, World!")));
 *
 *   try (NetworkInterceptor interceptor = new NetworkInterceptor(driver, route)) {
 *     // Your code here.
 *   }
 * </code></pre>
 * <p>
 * It is also possible to intercept and modify responses that the browser will
 * receive. Do this by calling {@link #NetworkInterceptor(WebDriver, Filter)}.
 */
public class NetworkInterceptor implements AutoCloseable {

  /**
   * Return this from a {@link Routable} in order to have the browser
   * continue the request unmodified.
   */
  public static final HttpResponse PROCEED_WITH_REQUEST = new HttpResponse()
    .addHeader("Selenium-Interceptor", "Continue")
    .setContent(utf8String("Original request should proceed"));

  private final DevTools tools;

  public NetworkInterceptor(WebDriver driver, HttpHandler handler) {
    this(driver, (Filter) next -> handler);
  }

  public NetworkInterceptor(WebDriver driver, Routable routable) {
    this(
      driver,
      (Filter) next -> req -> {
        if (routable.matches(req)) {
          return routable.execute(req);
        }
        return next.execute(req);
      });
  }

  public NetworkInterceptor(WebDriver driver, Filter filter) {
    Require.nonNull("WebDriver", driver);
    Require.nonNull("HTTP filter", filter);

    if (!(driver instanceof HasDevTools)) {
      throw new IllegalArgumentException("WebDriver instance must implement HasDevTools");
    }

    this.tools = ((HasDevTools) driver).getDevTools();
    tools.createSessionIfThereIsNotOne(driver.getWindowHandle());

    tools.getDomains().network().interceptTrafficWith(filter);
  }

  @Override
  public void close() {
    tools.getDomains().network().resetNetworkFilter();
  }

  protected HttpMethod convertFromCdpHttpMethod(String method) {
    Require.nonNull("HTTP Method", method);
    try {
      return HttpMethod.valueOf(method.toUpperCase());
    } catch (IllegalArgumentException e) {
      // Spam in a reasonable value
      return HttpMethod.GET;
    }
  }

  protected HttpRequest createHttpRequest(
    String cdpMethod,
    String url,
    Map<String, Object> headers,
    Optional<String> postData) {
    HttpRequest req = new HttpRequest(convertFromCdpHttpMethod(cdpMethod), url);
    headers.forEach((key, value) -> req.addHeader(key, String.valueOf(value)));
    postData.ifPresent(data -> req.setContent(utf8String(data)));

    return req;
  }

}
