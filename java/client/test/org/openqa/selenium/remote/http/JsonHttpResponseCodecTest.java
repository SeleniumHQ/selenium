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

import static com.google.common.base.Charsets.UTF_16;
import static com.google.common.base.Charsets.UTF_8;
import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_NO_CONTENT;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;

import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.Response;

@RunWith(JUnit4.class)
public class JsonHttpResponseCodecTest {

  private final JsonHttpResponseCodec codec = new JsonHttpResponseCodec();

  @Test
  public void convertsResponses_success() {
    Response response = new Response();
    response.setStatus(ErrorCodes.SUCCESS);
    response.setValue(ImmutableMap.of("color", "red"));

    HttpResponse converted = codec.encode(response);
    assertThat(converted.getStatus(), is(HTTP_OK));
    assertThat(converted.getHeader(CONTENT_TYPE), is(JSON_UTF_8.toString()));

    Response rebuilt = new JsonToBeanConverter().convert(
        Response.class, new String(converted.getContent(), UTF_8));

    assertEquals(response.getStatus(), rebuilt.getStatus());
    assertEquals(new ErrorCodes().toState(response.getStatus()), rebuilt.getState());
    assertEquals(response.getSessionId(), rebuilt.getSessionId());
    assertEquals(response.getValue(), rebuilt.getValue());
  }

  @Test
  public void convertsResponses_failure() {
    Response response = new Response();
    response.setStatus(ErrorCodes.NO_SUCH_ELEMENT);
    response.setValue(ImmutableMap.of("color", "red"));

    HttpResponse converted = codec.encode(response);
    assertThat(converted.getStatus(), is(HTTP_INTERNAL_ERROR));
    assertThat(converted.getHeader(CONTENT_TYPE), is(JSON_UTF_8.toString()));

    Response rebuilt = new JsonToBeanConverter().convert(
        Response.class, new String(converted.getContent(), UTF_8));

    assertEquals(response.getStatus(), rebuilt.getStatus());
    assertEquals(new ErrorCodes().toState(response.getStatus()), rebuilt.getState());
    assertEquals(response.getSessionId(), rebuilt.getSessionId());
    assertEquals(response.getValue(), rebuilt.getValue());
  }

  @Test
  public void roundTrip() {
    Response response = new Response();
    response.setStatus(ErrorCodes.SUCCESS);
    response.setValue(ImmutableMap.of("color", "red"));

    HttpResponse httpResponse = codec.encode(response);
    Response decoded = codec.decode(httpResponse);

    assertEquals(response.getStatus(), decoded.getStatus());
    assertEquals(response.getSessionId(), decoded.getSessionId());
    assertEquals(response.getValue(), decoded.getValue());
  }

  @Test
  public void decodeNonJsonResponse_200() {
    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent("{\"foobar\"}".getBytes(UTF_8));

    Response decoded = codec.decode(response);
    assertEquals(0, decoded.getStatus().longValue());
    assertEquals("{\"foobar\"}", decoded.getValue());
  }

  @Test
  public void decodeNonJsonResponse_204() {
    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_NO_CONTENT);

    Response decoded = codec.decode(response);
    assertNull(decoded.getStatus());
    assertNull(decoded.getValue());
  }

  @Test
  public void decodeNonJsonResponse_4xx() {
    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_BAD_REQUEST);
    response.setContent("{\"foobar\"}".getBytes(UTF_8));

    Response decoded = codec.decode(response);
    assertEquals(ErrorCodes.UNKNOWN_COMMAND, decoded.getStatus().intValue());
    assertEquals("{\"foobar\"}", decoded.getValue());
  }

  @Test
  public void decodeNonJsonResponse_5xx() {
    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_INTERNAL_ERROR);
    response.setContent("{\"foobar\"}".getBytes(UTF_8));

    Response decoded = codec.decode(response);
    assertEquals(ErrorCodes.UNHANDLED_ERROR, decoded.getStatus().intValue());
    assertEquals("{\"foobar\"}", decoded.getValue());
  }

  @Test
  public void decodeJsonResponseMissingContentType() {
    Response response = new Response();
    response.setStatus(ErrorCodes.ASYNC_SCRIPT_TIMEOUT);
    response.setValue(ImmutableMap.of("color", "red"));

    HttpResponse httpResponse = new HttpResponse();
    httpResponse.setStatus(HTTP_OK);
    httpResponse.setContent(
        new BeanToJsonConverter().convert(response).getBytes(UTF_8));

    Response decoded = codec.decode(httpResponse);
    assertEquals(response.getStatus(), decoded.getStatus());
    assertEquals(response.getSessionId(), decoded.getSessionId());
    assertEquals(response.getValue(), decoded.getValue());
  }

  @Test
  public void decodeUtf16EncodedResponse() {
    HttpResponse httpResponse = new HttpResponse();
    httpResponse.setStatus(200);
    httpResponse.setHeader(CONTENT_TYPE, JSON_UTF_8.withCharset(UTF_16).toString());
    httpResponse.setContent("{\"status\":0,\"value\":\"水\"}".getBytes(UTF_16));

    Response response = codec.decode(httpResponse);
    assertEquals("水", response.getValue());
  }

  @Test
  public void decodeJsonResponseWithTrailingNullBytes() {
    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent("{\"status\":0,\"value\":\"foo\"}\0\0".getBytes(UTF_8));

    Response decoded = codec.decode(response);
    assertEquals(ErrorCodes.SUCCESS, decoded.getStatus().intValue());
    assertEquals("foo", decoded.getValue());
  }
}
