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

package org.openqa.selenium.remote.http.netty;

import static org.openqa.selenium.remote.http.Contents.empty;

import org.asynchttpclient.Dsl;
import org.asynchttpclient.Request;
import org.asynchttpclient.RequestBuilder;
import org.asynchttpclient.Response;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.net.URI;

import static org.asynchttpclient.Dsl.request;

import com.google.common.base.Strings;

class NettyMessages {

  private NettyMessages() {
    // Utility classes.
  }

  protected static Request toNettyRequest(URI baseUrl, HttpRequest request) {
    String rawUrl;

    if (request.getUri().startsWith("ws://")) {
      rawUrl = "http://" + request.getUri().substring("ws://".length());
    } else if (request.getUri().startsWith("wss://")) {
      rawUrl = "https://" + request.getUri().substring("wss://".length());
    } else if (request.getUri().startsWith("http://") || request.getUri().startsWith("https://")) {
      rawUrl = request.getUri();
    } else {
      rawUrl = baseUrl.toString().replaceAll("/$", "") + request.getUri();
    }

    RequestBuilder builder = request(request.getMethod().toString(), rawUrl);

    for (String name : request.getQueryParameterNames()) {
      for (String value : request.getQueryParameters(name)) {
        builder.addQueryParam(name, value);
      }
    }

    for (String name : request.getHeaderNames()) {
      for (String value : request.getHeaders(name)) {
        builder.addHeader(name, value);
      }
    }

    String info = baseUrl.getUserInfo();
    if (!Strings.isNullOrEmpty(info)) {
      String[] parts = info.split(":", 2);
      String user = parts[0];
      String pass = parts.length > 1 ? parts[1] : null;

      builder.setRealm(Dsl.basicAuthRealm(user, pass).setUsePreemptiveAuth(true).build());
    }

    if (request.getMethod().equals(HttpMethod.POST)) {
      builder.setBody(request.getContent().get());
    }

    return builder.build();
  }

  public static HttpResponse toSeleniumResponse(Response response) {
    HttpResponse toReturn = new HttpResponse();

    toReturn.setStatus(response.getStatusCode());

    toReturn.setContent(! response.hasResponseBody()
                        ? empty()
                        : Contents.memoize(response::getResponseBodyAsStream));

    response.getHeaders().names().forEach(
        name -> response.getHeaders(name).forEach(value -> toReturn.addHeader(name, value)));

    return toReturn;
  }
}
