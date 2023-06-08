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

package org.openqa.selenium.environment.webserver;

import static java.nio.charset.StandardCharsets.UTF_8;
import static java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME;

import com.google.common.base.Splitter;
import java.io.UncheckedIOException;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.TemporalAccessor;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

class CookieHandler implements HttpHandler {

  private static final String EPOCH_START =
      RFC_1123_DATE_TIME.format(ZonedDateTime.ofInstant(Instant.ofEpochMilli(0), ZoneId.of("UTC")));
  private static final String RESPONSE_STRING =
      "<html><head><title>Done</title></head><body>%s : %s</body></html>";

  @Override
  public HttpResponse execute(HttpRequest request) throws UncheckedIOException {
    HttpResponse response = new HttpResponse();
    response.setHeader("Content-Type", "text/html");
    // Don't Cache Anything  at the browser
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Pragma", "no-cache");
    response.setHeader("Expires", EPOCH_START);

    String action = request.getQueryParameter("action");

    if ("add".equals(action)) {
      String name = request.getQueryParameter("name");

      StringBuilder cookie = new StringBuilder();
      cookie.append(name).append("=").append(request.getQueryParameter("value")).append("; ");

      append(cookie, request.getQueryParameter("domain"), str -> "Domain=" + str);
      append(cookie, request.getQueryParameter("path"), str -> "Path=" + str);
      append(
          cookie, request.getQueryParameter("expiry"), str -> "Max-Age=" + Integer.parseInt(str));
      append(cookie, request.getQueryParameter("secure"), str -> "Secure");
      append(cookie, request.getQueryParameter("httpOnly"), str -> "HttpOnly");

      response.addHeader("Set-Cookie", cookie.toString());

      response.setContent(
          Contents.string(String.format(RESPONSE_STRING, "Cookie added", name), UTF_8));
    } else if ("delete".equals(action)) {
      String name = request.getQueryParameter("name");
      for (Cookie cookie : getCookies(request)) {
        if (!cookie.getName().equals(name)) {
          addCookie(
              response, new Cookie.Builder(name, "").path("/").expiresOn(new Date(0)).build());
        }
      }
      response.setContent(
          Contents.string(String.format(RESPONSE_STRING, "Cookie deleted", name), UTF_8));
    } else if ("deleteAll".equals(action)) {
      for (Cookie cookie : getCookies(request)) {
        addCookie(
            response,
            new Cookie.Builder(cookie.getName(), "").path("/").expiresOn(new Date(0)).build());
      }
      response.setContent(
          Contents.string(String.format(RESPONSE_STRING, "All cookies deleted", ""), UTF_8));
    } else {
      response.setContent(
          Contents.string(String.format(RESPONSE_STRING, "Unrecognized action", action), UTF_8));
    }

    return response;
  }

  private <X> void append(StringBuilder builder, X fromCookie, Function<X, String> value) {
    if (fromCookie == null) {
      return;
    }

    builder.append(value.apply(fromCookie)).append("; ");
  }

  private Collection<Cookie> getCookies(HttpRequest request) {
    return StreamSupport.stream(request.getHeaders("Cookie").spliterator(), false)
        .map(this::parse)
        .collect(Collectors.toList());
  }

  private void addCookie(HttpResponse response, Cookie cook) {
    StringBuilder cookie = new StringBuilder();

    // TODO: escape string as necessary
    String name = cook.getName();
    cookie.append(name).append("=").append(cook.getValue()).append("; ");

    append(cookie, cook.getDomain(), str -> "Domain=" + str);
    append(cookie, cook.getPath(), str -> "Path=" + str);
    append(
        cookie,
        cook.getExpiry(),
        date -> {
          ZonedDateTime zonedDateTime = ZonedDateTime.ofInstant(date.toInstant(), ZoneId.of("UTC"));
          return "Expiry=" + RFC_1123_DATE_TIME.format(zonedDateTime);
        });
    append(cookie, cook.isSecure(), val -> "Secure");
    append(cookie, cook.isHttpOnly(), val -> "HttpOnly");

    response.addHeader("Set-Cookie", cookie.toString());
  }

  private Cookie parse(String cookieString) {
    String[] split = cookieString.split("=", 2);

    if (split.length < 2) {
      throw new IllegalStateException("Illegal cookie: " + cookieString);
    }

    int index = split[1].indexOf(";");
    if (index == -1) {
      return new Cookie(split[0], split[1]);
    }

    List<String> keysAndValues =
        Splitter.on(";").trimResults().omitEmptyStrings().splitToList(split[1]);
    Cookie.Builder builder = new Cookie.Builder(split[0], keysAndValues.get(0));

    keysAndValues.stream()
        .skip(1)
        .forEach(
            keyAndValue -> {
              List<String> parts =
                  Splitter.on("=")
                      .limit(2)
                      .trimResults()
                      .omitEmptyStrings()
                      .splitToList(keyAndValue);
              String key = parts.get(0).toLowerCase();
              switch (key) {
                case "domain":
                  builder.domain(parts.get(1));
                  break;

                case "expires":
                  TemporalAccessor temporalAccessor = RFC_1123_DATE_TIME.parse(parts.get(1));
                  builder.expiresOn(Date.from(Instant.from(temporalAccessor)));
                  break;

                case "httponly":
                  builder.isHttpOnly(true);
                  break;

                case "path":
                  builder.path(parts.get(1));
                  break;

                case "secure":
                  builder.isSecure(true);
                  break;

                default:
                  throw new RuntimeException("Unknown option: " + key);
              }
            });

    return builder.build();
  }
}
