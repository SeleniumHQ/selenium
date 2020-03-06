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

package org.openqa.selenium.grid.server;

import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableMultimap;
import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.function.Supplier;

import javax.servlet.http.HttpServletRequest;

/**
 * Read-only adapter of {@link HttpServletRequest} to a {@link HttpRequest}. This class is not
 * thread-safe, and you can only expect to read the content once.
 */
class ServletRequestWrappingHttpRequest extends HttpRequest {

  private final HttpServletRequest req;

  ServletRequestWrappingHttpRequest(HttpServletRequest req) {
    super(HttpMethod.valueOf(req.getMethod()), req.getPathInfo() == null ? "/" : req.getPathInfo());

    this.req = req;
  }

  @Override
  public Iterable<String> getHeaderNames() {
    return Collections.list(req.getHeaderNames());
  }

  @Override
  public Iterable<String> getHeaders(String name) {
    return Collections.list(req.getHeaders(name));
  }

  @Override
  public String getHeader(String name) {
    return req.getHeader(name);
  }


  @Override
  public ServletRequestWrappingHttpRequest removeHeader(String name) {
    throw new UnsupportedOperationException("removeHeader");
  }

  @Override
  public ServletRequestWrappingHttpRequest setHeader(String name, String value) {
    throw new UnsupportedOperationException("setHeader");
  }

  @Override
  public ServletRequestWrappingHttpRequest addHeader(String name, String value) {
    throw new UnsupportedOperationException("addHeader");
  }

  @Override
  public HttpRequest addQueryParameter(String name, String value) {
    throw new UnsupportedOperationException("addQueryParameter");
  }

  @Override
  public Iterable<String> getQueryParameterNames() {
    return parseQueryString().keySet();
  }

  private Map<String, Collection<String>> parseQueryString() {
    String queryString = req.getQueryString();
    if (queryString == null || queryString.isEmpty()) {
      return ImmutableMap.of();
    }

    ImmutableMultimap.Builder<String, String> allParams = ImmutableMultimap.builder();

    Iterable<String> paramsAndValues = Splitter.on("&").split(queryString);
    for (String paramAndValue : paramsAndValues) {
      int index = paramAndValue.indexOf("=");

      String key;
      String value;
      if (index == -1) {
        key = paramAndValue;
        value = "";
      } else {
        key = paramAndValue.substring(0, index);
        if (paramAndValue.length() >= index) {
          value = paramAndValue.substring(index + 1);
        } else {
          value = "";
        }
      }

      try {
        allParams.put(URLDecoder.decode(key, "UTF-8"), URLDecoder.decode(value, "UTF-8"));
      } catch (UnsupportedEncodingException e) {
        // UTF-8 is mandated to be supported in Java, so this should never happen.
        throw new RuntimeException(e);
      }
    }

    return allParams.build().asMap();
  }

  @Override
  public Iterable<String> getQueryParameters(String name) {
    return parseQueryString().getOrDefault(name, ImmutableSet.of());
  }

  @Override
  public Supplier<InputStream> getContent() {
    // We need to memoize, but the request input may be too large to fit in
    // memory.

    return Contents.memoize(() -> {
      try {
        return req.getInputStream();
      } catch (IOException e) {
        throw new UncheckedIOException(e);
      }
    });
  }

  @Override
  public ServletRequestWrappingHttpRequest setContent(Supplier<InputStream> supplier) {
    throw new UnsupportedOperationException("setContent");
  }
}
