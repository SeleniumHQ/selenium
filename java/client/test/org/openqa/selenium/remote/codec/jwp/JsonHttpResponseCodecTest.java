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

package org.openqa.selenium.remote.codec.jwp;

import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.net.HttpURLConnection.HTTP_CLIENT_TIMEOUT;
import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_NO_CONTENT;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_16;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.Contents.utf8String;

import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.openqa.selenium.ScriptTimeoutException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.http.HttpResponse;

public class JsonHttpResponseCodecTest {

  private final JsonHttpResponseCodec codec = new JsonHttpResponseCodec();

  @Test
  public void convertsResponses_success() {
    Response response = new Response();
    response.setStatus(ErrorCodes.SUCCESS);
    response.setValue(ImmutableMap.of("color", "red"));

    HttpResponse converted = codec.encode(HttpResponse::new, response);
    assertThat(converted.getStatus()).isEqualTo(HTTP_OK);
    assertThat(converted.getHeader(CONTENT_TYPE)).isEqualTo(JSON_UTF_8.toString());

    Response rebuilt = new Json().toType(string(converted), Response.class);

    assertThat(rebuilt.getStatus()).isEqualTo(response.getStatus());
    assertThat(rebuilt.getState()).isEqualTo(new ErrorCodes().toState(response.getStatus()));
    assertThat(rebuilt.getSessionId()).isEqualTo(response.getSessionId());
    assertThat(rebuilt.getValue()).isEqualTo(response.getValue());
  }

  @Test
  public void convertsResponses_failure() {
    Response response = new Response();
    response.setStatus(ErrorCodes.NO_SUCH_ELEMENT);
    response.setValue(ImmutableMap.of("color", "red"));

    HttpResponse converted = codec.encode(HttpResponse::new, response);
    assertThat(converted.getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);
    assertThat(converted.getHeader(CONTENT_TYPE)).isEqualTo(JSON_UTF_8.toString());

    Response rebuilt = new Json().toType(string(converted), Response.class);

    assertThat(rebuilt.getStatus()).isEqualTo(response.getStatus());
    assertThat(rebuilt.getState()).isEqualTo(new ErrorCodes().toState(response.getStatus()));
    assertThat(rebuilt.getSessionId()).isEqualTo(response.getSessionId());
    assertThat(rebuilt.getValue()).isEqualTo(response.getValue());
  }

  @Test
  public void roundTrip() {
    Response response = new Response();
    response.setStatus(ErrorCodes.SUCCESS);
    response.setValue(ImmutableMap.of("color", "red"));

    HttpResponse httpResponse = codec.encode(HttpResponse::new, response);
    Response decoded = codec.decode(httpResponse);

    assertThat(decoded.getStatus()).isEqualTo(response.getStatus());
    assertThat(decoded.getSessionId()).isEqualTo(response.getSessionId());
    assertThat(decoded.getValue()).isEqualTo(response.getValue());
  }

  @Test
  public void decodeNonJsonResponse_200() {
    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(utf8String("{\"foobar\"}"));

    Response decoded = codec.decode(response);
    assertThat(decoded.getStatus().longValue()).isEqualTo(0);
    assertThat(decoded.getValue()).isEqualTo("{\"foobar\"}");
  }

  @Test
  public void decodeNonJsonResponse_204() {
    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_NO_CONTENT);

    Response decoded = codec.decode(response);
    assertThat(decoded.getStatus()).isNull();
    assertThat(decoded.getValue()).isNull();
  }

  @Test
  public void decodeNonJsonResponse_4xx() {
    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_BAD_REQUEST);
    response.setContent(utf8String("{\"foobar\"}"));

    Response decoded = codec.decode(response);
    assertThat(decoded.getStatus().intValue()).isEqualTo(ErrorCodes.UNKNOWN_COMMAND);
    assertThat(decoded.getValue()).isEqualTo("{\"foobar\"}");
  }

  @Test
  public void decodeNonJsonResponse_5xx() {
    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_INTERNAL_ERROR);
    response.setContent(utf8String("{\"foobar\"}"));

    Response decoded = codec.decode(response);
    assertThat(decoded.getStatus().intValue()).isEqualTo(ErrorCodes.UNHANDLED_ERROR);
    assertThat(decoded.getValue()).isEqualTo("{\"foobar\"}");
  }

  @Test
  public void decodeJsonResponseMissingContentType() {
    Response response = new Response();
    response.setStatus(ErrorCodes.SUCCESS);
    response.setValue(ImmutableMap.of("color", "red"));

    HttpResponse httpResponse = new HttpResponse();
    httpResponse.setStatus(HTTP_OK);
    httpResponse.setContent(utf8String(new Json().toJson(response)));

    Response decoded = codec.decode(httpResponse);
    assertThat(decoded.getStatus()).isEqualTo(response.getStatus());
    assertThat(decoded.getSessionId()).isEqualTo(response.getSessionId());
    assertThat(decoded.getValue()).isEqualTo(response.getValue());
  }

  @Test
  public void decodeUtf16EncodedResponse() {
    HttpResponse httpResponse = new HttpResponse();
    httpResponse.setStatus(200);
    httpResponse.setHeader(CONTENT_TYPE, JSON_UTF_8.withCharset(UTF_16).toString());
    httpResponse.setContent(string("{\"status\":0,\"value\":\"水\"}", UTF_16));

    Response response = codec.decode(httpResponse);
    assertThat(response.getValue()).isEqualTo("水");
  }

  @Test
  public void decodeJsonResponseWithTrailingNullBytes() {
    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(utf8String("{\"status\":0,\"value\":\"foo\"}\0\0"));

    Response decoded = codec.decode(response);
    assertThat(decoded.getStatus().intValue()).isEqualTo(ErrorCodes.SUCCESS);
    assertThat(decoded.getValue()).isEqualTo("foo");
  }

  @Test
  public void shouldConvertElementReferenceToRemoteWebElement() {
    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(utf8String(new Json().toJson(ImmutableMap.of(
        "status", 0,
        "value", ImmutableMap.of(Dialect.OSS.getEncodedElementKey(), "345678")))));

    Response decoded = codec.decode(response);
    assertThat(((RemoteWebElement) decoded.getValue()).getId()).isEqualTo("345678");
  }

  @Test
  public void shouldAttemptToConvertAnExceptionIntoAnActualExceptionInstance() {
    Response response = new Response();
    response.setStatus(ErrorCodes.ASYNC_SCRIPT_TIMEOUT);
    WebDriverException exception = new ScriptTimeoutException("I timed out");
    response.setValue(exception);

    HttpResponse httpResponse = new HttpResponse();
    httpResponse.setStatus(HTTP_CLIENT_TIMEOUT);
    httpResponse.setContent(utf8String(new Json().toJson(response)));

    Response decoded = codec.decode(httpResponse);
    assertThat(decoded.getStatus().intValue()).isEqualTo(ErrorCodes.ASYNC_SCRIPT_TIMEOUT);

    WebDriverException seenException = (WebDriverException) decoded.getValue();
    assertThat(seenException.getClass()).isEqualTo(exception.getClass());
    assertThat(seenException.getMessage().startsWith(exception.getMessage())).isTrue();
  }
}
