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

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.remote.ErrorCodes.METHOD_NOT_ALLOWED;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;

import org.junit.Test;
import org.openqa.selenium.UnhandledAlertException;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class W3CHttpResponseCodecTest {

  @Test
  public void noErrorNoCry() {
    Map<String, Object> data = new HashMap<>();
    data.put("value", "cheese");

    HttpResponse response = createValidResponse(HTTP_OK, data);

    Response decoded = new W3CHttpResponseCodec().decode(response);

    assertEquals(ErrorCodes.SUCCESS, decoded.getStatus().intValue());
    assertEquals("success", decoded.getState());
    assertEquals("cheese", decoded.getValue());
  }

  @Test
  public void decodingAnErrorWithoutAStacktraceIsDecodedProperlyForNonCompliantImplementations() {
    Map<String, Object> error = new HashMap<>();
    error.put("error", "unsupported operation");  // 500
    error.put("message", "I like peas");
    error.put("stacktrace", "");

    HttpResponse response = createValidResponse(HTTP_INTERNAL_ERROR, error);

    Response decoded = new W3CHttpResponseCodec().decode(response);

    assertEquals("unsupported operation", decoded.getState());
    assertEquals(METHOD_NOT_ALLOWED, decoded.getStatus().intValue());

    assertTrue(decoded.getValue() instanceof UnsupportedCommandException);
    assertTrue(((WebDriverException) decoded.getValue()).getMessage().contains("I like peas"));
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

    assertEquals("unsupported operation", decoded.getState());
    assertEquals(METHOD_NOT_ALLOWED, decoded.getStatus().intValue());

    assertTrue(decoded.getValue() instanceof UnsupportedCommandException);
    assertTrue(((WebDriverException) decoded.getValue()).getMessage().contains("I like peas"));
  }

  @Test
  public void shouldPopulateTheAlertTextIfThrowingAnUnhandledAlertException() {
    ImmutableMap<String, ImmutableMap<String, Serializable>> data = ImmutableMap.of(
        "value", ImmutableMap.of(
            "error", "unexpected alert open",
            "message", "Modal dialog present",
            "stacktrace", "",
            "data", ImmutableMap.of("text", "cheese")));

    HttpResponse response = createValidResponse(500, data);
    Response decoded = new W3CHttpResponseCodec().decode(response);

    UnhandledAlertException ex = (UnhandledAlertException) decoded.getValue();
    assertEquals("cheese", ex.getAlertText());
  }

  private HttpResponse createValidResponse(int statusCode, Map<String, ?> data) {
    byte[] contents = new Gson().toJson(data).getBytes(UTF_8);

    HttpResponse response = new HttpResponse();
    response.setStatus(statusCode);
    response.addHeader("Content-Type", "application/json; charset=utf-8");
    response.addHeader("Cache-Control", "no-cache");
    response.addHeader("Content-Length", String.valueOf(contents.length));
    response.setContent(contents);

    return response;
  }
}