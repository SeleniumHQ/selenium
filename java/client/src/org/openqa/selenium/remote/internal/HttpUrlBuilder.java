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

package org.openqa.selenium.remote.internal;

import static java.nio.charset.StandardCharsets.US_ASCII;

import com.google.common.base.Joiner;

import org.openqa.selenium.remote.http.HttpRequest;

import java.io.UncheckedIOException;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

class HttpUrlBuilder {

  private final static Function<String, String> QUERY_ENCODE = str -> {
    try {
      return URLEncoder.encode(str, US_ASCII.toString());
    } catch (UnsupportedEncodingException e) {
      throw new UncheckedIOException(e);
    }
  };

  private HttpUrlBuilder() {
    // Helper class
  }

  static URL toUrl(URL base, HttpRequest request) throws MalformedURLException {
    StringBuilder queryString = new StringBuilder();
    Joiner parameters = Joiner.on("&");

    List<String>
        allParams = StreamSupport.stream(request.getQueryParameterNames().spliterator(), false)
        .map(name -> {
          String encoded = QUERY_ENCODE.apply(name);
          return parameters.join(
              StreamSupport.stream(request.getQueryParameters(name).spliterator(), false)
                  .map(value -> encoded + "=" + QUERY_ENCODE.apply(value))
                  .collect(Collectors.toList()));
        })
        .collect(Collectors.toList());
    parameters.appendTo(queryString, allParams);

    String baseUrl;
    if (request.getUri().startsWith("http://") || request.getUri().startsWith("https://")) {
      baseUrl = request.getUri();
    } else {
      baseUrl = base.toExternalForm().replaceAll("/$", "") + request.getUri();
    }

    if (!queryString.toString().isEmpty()) {
      baseUrl += "?" + queryString.toString();
    }

    return new URL(baseUrl);
  }
}
