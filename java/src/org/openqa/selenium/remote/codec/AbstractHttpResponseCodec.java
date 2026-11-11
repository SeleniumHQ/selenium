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

package org.openqa.selenium.remote.codec;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.json.Json.JSON_UTF_8;
import static org.openqa.selenium.remote.http.Contents.bytes;

import java.util.function.Supplier;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.ResponseCodec;
import org.openqa.selenium.remote.http.HttpHeader;
import org.openqa.selenium.remote.http.HttpResponse;

/**
 * A response codec usable as a base for both the JSON and W3C wire protocols.
 *
 * @see <a href="https://w3.org/tr/webdriver">W3C WebDriver spec</a>
 */
public abstract class AbstractHttpResponseCodec implements ResponseCodec<HttpResponse> {
  private final Json json = new Json();

  /**
   * Encodes the given response as an HTTP response message. This method is guaranteed not to throw.
   *
   * @param response The response to encode.
   * @return The encoded response.
   */
  @Override
  public HttpResponse encode(Supplier<HttpResponse> factory, Response response) {
    // A response with no state has always been encoded as a success.
    String state = response.getState();
    int status = state == null || "success".equals(state) ? HTTP_OK : HTTP_INTERNAL_ERROR;

    byte[] data = json.toJson(getValueToEncode(response)).getBytes(UTF_8);

    HttpResponse httpResponse = factory.get();
    httpResponse.setStatus(status);
    httpResponse.setHeader(HttpHeader.CacheControl.getName(), "no-cache");
    httpResponse.setHeader(HttpHeader.Expires.getName(), "Thu, 01 Jan 1970 00:00:00 GMT");
    httpResponse.setHeader(HttpHeader.ContentLength.getName(), String.valueOf(data.length));
    httpResponse.setHeader(HttpHeader.ContentType.getName(), JSON_UTF_8);
    httpResponse.setContent(bytes(data));

    return httpResponse;
  }

  protected abstract Object getValueToEncode(Response response);

  @Override
  public Response decode(HttpResponse encodedResponse) {
    String contentType = encodedResponse.getHeader(HttpHeader.ContentType, "");
    String content = encodedResponse.contentAsString().trim();
    try {
      return reconstructValue(json.toType(content, Response.class));
    } catch (JsonException e) {
      if (contentType.startsWith("application/json")) {
        throw new IllegalArgumentException("Cannot decode response content: " + content, e);
      }
    } catch (ClassCastException e) {
      if (contentType.startsWith("application/json")) {
        if (content.isEmpty()) {
          // The remote server has died, but has already set some headers.
          // Normally this occurs when the final window of the firefox driver
          // is closed on OS X. Return null, as the return value _should_ be
          // being ignored. This is not an elegant solution.
          return new Response();
        }
        throw new IllegalArgumentException("Cannot decode response content: " + content, e);
      }
    }

    Response response = new Response();
    int statusCode = encodedResponse.getStatus();
    if (statusCode == HTTP_OK) {
      response.setState("success");
    } else if (statusCode > 399 && statusCode < 500) {
      // 4xx represents an unknown command or a bad request.
      response.setState("unknown command");
    } else if (statusCode < 200 || statusCode > 299) {
      response.setState("unknown error");
    }

    if (!content.isEmpty()) {
      response.setValue(content);
    }

    return response;
  }

  protected abstract Response reconstructValue(Response response);
}
