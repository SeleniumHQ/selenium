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

package org.openqa.selenium.remote.codec.w3c;

import static java.net.HttpURLConnection.HTTP_BAD_GATEWAY;
import static java.net.HttpURLConnection.HTTP_GATEWAY_TIMEOUT;
import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.ErrorCodes.METHOD_NOT_ALLOWED;
import static org.openqa.selenium.remote.http.Contents.bytes;

import com.google.common.collect.ImmutableMap;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import org.openqa.selenium.UnhandledAlertException;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

@Tag("UnitTests")
public class W3CHttpResponseCodecTest {

  @Test
  public void noErrorNoCry() {
    Map<String, Object> data = new HashMap<>();
    data.put("value", "cheese");

    HttpResponse response = createValidResponse(HTTP_OK, data);

    Response decoded = new W3CHttpResponseCodec().decode(response);

    assertThat(decoded.getStatus().intValue()).isEqualTo(ErrorCodes.SUCCESS);
    assertThat(decoded.getState()).isEqualTo("success");
    assertThat(decoded.getValue()).isEqualTo("cheese");
  }

  @Test
  public void shouldBeAbleToHandleGatewayTimeoutError() {
    String responseString = "<html>\r\n" +
      "<body>\r\n" +
      "<h1>504 Gateway Time-out</h1>\r\n" +
      "The server didn't respond in time.\r\n" +
      "</body>\r\n" +
      "</html>";

    byte[] contents = responseString.getBytes(UTF_8);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_GATEWAY_TIMEOUT);
    response.addHeader("Server", "nginx");
    response.addHeader("Content-Type", "text/html");
    response.addHeader("Content-Length", String.valueOf(contents.length));
    response.setContent(bytes(contents));

    Response decoded = new W3CHttpResponseCodec().decode(response);

    assertThat(decoded.getStatus().intValue()).isEqualTo(ErrorCodes.UNHANDLED_ERROR);
    assertThat(decoded.getValue()).isEqualTo(responseString);
  }


  @Test
  public void shouldBeAbleToHandleBadGatewayError() {
    String responseString = "<html>\r\n" +
      "<head><title>502 Bad Gateway</title></head>\r\n" +
      "<body>\r\n" +
      "<center><h1>502 Bad Gateway</h1></center>\r\n" +
      "<hr><center>nginx</center>\r\n" +
      "</body>\r\n" +
      "</html>";

    byte[] contents = responseString.getBytes(UTF_8);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_BAD_GATEWAY);
    response.addHeader("Server", "nginx");
    response.addHeader("Content-Type", "text/html");
    response.addHeader("Content-Length", String.valueOf(contents.length));
    response.setContent(bytes(contents));

    Response decoded = new W3CHttpResponseCodec().decode(response);

    assertThat(decoded.getStatus().intValue()).isEqualTo(ErrorCodes.UNHANDLED_ERROR);
    assertThat(decoded.getValue()).isEqualTo(responseString);
  }

  @Test
  public void decodingAnErrorWithoutAStacktraceIsDecodedProperlyForNonCompliantImplementations() {
    Map<String, Object> error = new HashMap<>();
    error.put("error", "unsupported operation");  // 500
    error.put("message", "I like peas");
    error.put("stacktrace", "");

    HttpResponse response = createValidResponse(HTTP_INTERNAL_ERROR, error);

    Response decoded = new W3CHttpResponseCodec().decode(response);

    assertThat(decoded.getState()).isEqualTo("unsupported operation");
    assertThat(decoded.getStatus().intValue()).isEqualTo(METHOD_NOT_ALLOWED);

    assertThat(decoded.getValue()).isInstanceOf(UnsupportedCommandException.class);
    assertThat(((WebDriverException) decoded.getValue()).getMessage()).contains("I like peas");
  }

  @Test
  public void decodingAnErrorWithoutAStacktraceIsDecodedProperlyForConformingImplementations() {
    Map<String, Object> error = new HashMap<>();
    error.put("error", "unsupported operation");  // 500
    error.put("message", "I like peas");
    error.put("stacktrace", "");
    Map<String, Object> data = new HashMap<>();
    data.put("value", error);

    HttpResponse response = createValidResponse(HTTP_INTERNAL_ERROR, data);

    Response decoded = new W3CHttpResponseCodec().decode(response);

    assertThat(decoded.getState()).isEqualTo("unsupported operation");
    assertThat(decoded.getStatus().intValue()).isEqualTo(METHOD_NOT_ALLOWED);

    assertThat(decoded.getValue()).isInstanceOf(UnsupportedCommandException.class);
    assertThat(((WebDriverException) decoded.getValue()).getMessage()).contains("I like peas");
  }

  @Test
  public void shouldPopulateTheAlertTextIfThrowingAnUnhandledAlertException() {
    Map<String, Map<String, Serializable>> data = ImmutableMap.of(
        "value", ImmutableMap.of(
            "error", "unexpected alert open",
            "message", "Modal dialog present",
            "stacktrace", "",
            "data", ImmutableMap.of("text", "cheese")));

    HttpResponse response = createValidResponse(500, data);
    Response decoded = new W3CHttpResponseCodec().decode(response);

    UnhandledAlertException ex = (UnhandledAlertException) decoded.getValue();
    assertThat(ex.getAlertText()).isEqualTo("cheese");
  }

  private HttpResponse createValidResponse(int statusCode, Map<String, ?> data) {
    byte[] contents = new Json().toJson(data).getBytes(UTF_8);

    HttpResponse response = new HttpResponse();
    response.setStatus(statusCode);
    response.addHeader("Content-Type", "application/json; charset=utf-8");
    response.addHeader("Cache-Control", "no-cache");
    response.addHeader("Content-Length", String.valueOf(contents.length));
    response.setContent(bytes(contents));

    return response;
  }
}
