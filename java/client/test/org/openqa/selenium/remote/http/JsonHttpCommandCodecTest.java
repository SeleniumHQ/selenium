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
import static com.google.common.net.HttpHeaders.CACHE_CONTROL;
import static com.google.common.net.HttpHeaders.CONTENT_LENGTH;
import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static com.google.common.net.MediaType.JSON_UTF_8;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.hamcrest.Matchers.startsWith;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;
import static org.openqa.selenium.remote.Dialect.OSS;
import static org.openqa.selenium.remote.http.HttpMethod.DELETE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.SessionId;

import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;

/**
 * Tests for {@link JsonHttpCommandCodec}.
 */
@RunWith(JUnit4.class)
public class JsonHttpCommandCodecTest {

  private final JsonHttpCommandCodec codec = new JsonHttpCommandCodec();

  @Test
  public void throwsIfCommandNameIsNotRecognized() {
    Command command = new Command(null, "garbage-command-name");
    try {
      codec.encode(command);
      fail();
    } catch (UnsupportedCommandException expected) {
      assertThat(expected.getMessage(), startsWith(command.getName() + "\n"));
    }
  }

  @Test
  public void throwsIfCommandHasNullSessionId() {
    codec.defineCommand("foo", DELETE, "/foo/:sessionId");
    Command command = new Command(null, "foo");
    try {
      codec.encode(command);
      fail();
    } catch (IllegalArgumentException expected) {
      assertThat(expected.getMessage(), containsString("Session ID"));
    }
  }

  @Test
  public void throwsIfCommandIsMissingUriParameter() {
    codec.defineCommand("foo", DELETE, "/foo/:bar");
    Command command = new Command(new SessionId("id"), "foo");
    try {
      codec.encode(command);
      fail();
    } catch (IllegalArgumentException expected) {
      assertThat(expected.getMessage(), containsString("bar"));
    }
  }

  @Test
  public void encodingAPostWithNoParameters() {
    codec.defineCommand("foo", POST, "/foo/bar");
    Command command = new Command(null, "foo");

    HttpRequest request = codec.encode(command);
    assertThat(request.getMethod(), is(POST));
    assertThat(request.getHeader(CONTENT_TYPE), is(JSON_UTF_8.toString()));
    assertThat(request.getHeader(CONTENT_LENGTH), is("2"));
    assertThat(request.getUri(), is("/foo/bar"));
    assertThat(new String(request.getContent(), UTF_8), is("{}"));
  }

  @Test
  public void encodingAPostWithUrlParameters() {
    codec.defineCommand("foo", POST, "/foo/:bar/baz");
    Command command = new Command(null, "foo", ImmutableMap.of("bar", "apples123"));

    String encoding = "{\"bar\":\"apples123\"}";

    HttpRequest request = codec.encode(command);
    assertThat(request.getMethod(), is(POST));
    assertThat(request.getHeader(CONTENT_TYPE), is(JSON_UTF_8.toString()));
    assertThat(request.getHeader(CONTENT_LENGTH), is(String.valueOf(encoding.length())));
    assertThat(request.getUri(), is("/foo/apples123/baz"));
    assertThat(new String(request.getContent(), UTF_8), is(encoding));
  }

  @Test
  public void encodingANonPostWithNoParameters() {
    codec.defineCommand("foo", DELETE, "/foo/bar/baz");
    HttpRequest request = codec.encode(new Command(null, "foo"));
    assertThat(request.getMethod(), is(DELETE));
    assertThat(request.getHeader(CONTENT_TYPE), is(nullValue()));
    assertThat(request.getHeader(CONTENT_LENGTH), is(nullValue()));
    assertThat(request.getContent().length, is(0));
    assertThat(request.getUri(), is("/foo/bar/baz"));
  }

  @Test
  public void encodingANonPostWithParameters() {
    codec.defineCommand("eat", GET, "/fruit/:fruit/:size");
    HttpRequest request = codec.encode(new Command(null, "eat", ImmutableMap.of(
        "fruit", "apple", "size", "large")));
    assertThat(request.getHeader(CONTENT_TYPE), is(nullValue()));
    assertThat(request.getHeader(CONTENT_LENGTH), is(nullValue()));
    assertThat(request.getContent().length, is(0));
    assertThat(request.getUri(), is("/fruit/apple/large"));
  }

  @Test
  public void preventsCachingGetRequests() {
    codec.defineCommand("foo", GET, "/foo");
    HttpRequest request = codec.encode(new Command(null, "foo"));
    assertThat(request.getMethod(), is(GET));
    assertThat(request.getHeader(CACHE_CONTROL), is("no-cache"));
  }

  @Test
  public void throwsIfEncodedCommandHasNoMapping() throws URISyntaxException {
    HttpRequest request = new HttpRequest(GET, "/foo/bar/baz");
    try {
      codec.decode(request);
      fail();
    } catch (UnsupportedCommandException expected) {
      assertThat(expected.getMessage(), startsWith("GET /foo/bar/baz\n"));
    }
  }

  @Test
  public void canDecodeCommandWithNoParameters() throws URISyntaxException {
    HttpRequest request = new HttpRequest(GET, "/foo/bar/baz");
    codec.defineCommand("foo", GET, "/foo/bar/baz");

    Command decoded = codec.decode(request);
    assertThat(decoded.getName(), is("foo"));
    assertThat(decoded.getSessionId(), is(nullValue()));
    assertThat(decoded.getParameters().isEmpty(), is(true));
  }

  @Test
  public void canExtractSessionIdFromPathParameters() throws URISyntaxException {
    HttpRequest request = new HttpRequest(GET, "/foo/bar/baz");
    codec.defineCommand("foo", GET, "/foo/:sessionId/baz");

    Command decoded = codec.decode(request);
    assertThat(decoded.getSessionId(), is(new SessionId("bar")));
  }

  @Test
  public void removesSessionIdFromParameterMap() throws URISyntaxException {
    HttpRequest request = new HttpRequest(GET, "/foo/bar/baz");
    codec.defineCommand("foo", GET, "/foo/:sessionId/baz");

    Command decoded = codec.decode(request);
    assertThat(decoded.getSessionId(), is(new SessionId("bar")));
    assertThat(decoded.getParameters().isEmpty(), is(true));
  }

  @Test
  public void canExtractSessionIdFromRequestBody() throws URISyntaxException {
    JsonObject json = new JsonObject();
    json.addProperty("sessionId", "sessionX");
    String data = json.toString();
    HttpRequest request = new HttpRequest(POST, "/foo/bar/baz");
    request.setContent(data.getBytes(UTF_8));
    codec.defineCommand("foo", POST, "/foo/bar/baz");

    Command decoded = codec.decode(request);
    assertThat(decoded.getSessionId(), is(new SessionId("sessionX")));
  }

  @Test
  public void extractsAllParametersFromUrl() throws URISyntaxException {
    HttpRequest request = new HttpRequest(GET, "/fruit/apple/size/large");
    codec.defineCommand("pick", GET, "/fruit/:fruit/size/:size");

    Command decoded = codec.decode(request);
    assertThat(decoded.getParameters(), is((Map<String, String>) ImmutableMap.of(
        "fruit", "apple",
        "size", "large")));
  }

  @Test
  public void extractsAllParameters() throws URISyntaxException {
    JsonObject json = new JsonObject();
    json.addProperty("sessionId", "sessionX");
    json.addProperty("fruit", "apple");
    json.addProperty("color", "red");
    json.addProperty("size", "large");
    String data = json.toString();

    HttpRequest request = new HttpRequest(POST, "/fruit/apple/size/large");
    request.setContent(data.getBytes(UTF_8));
    codec.defineCommand("pick", POST, "/fruit/:fruit/size/:size");

    Command decoded = codec.decode(request);
    assertThat(decoded.getSessionId(), is(new SessionId("sessionX")));
    assertThat(decoded.getParameters(), is((Map<String, String>) ImmutableMap.of(
        "fruit", "apple", "size", "large", "color", "red")));
  }

  @Test
  public void ignoresNullSessionIdInSessionBody() throws URISyntaxException {
    JsonObject json = new JsonObject();
    json.add("sessionId", JsonNull.INSTANCE);
    json.addProperty("fruit", "apple");
    json.addProperty("color", "red");
    json.addProperty("size", "large");
    String data = json.toString();

    HttpRequest request = new HttpRequest(POST, "/fruit/apple/size/large");
    request.setContent(data.getBytes(UTF_8));
    codec.defineCommand("pick", POST, "/fruit/:fruit/size/:size");

    Command decoded = codec.decode(request);
    assertThat(decoded.getSessionId(), is(nullValue()));
    assertThat(decoded.getParameters(), is((Map<String, String>) ImmutableMap.of(
        "fruit", "apple", "size", "large", "color", "red")));
  }

  @Test
  public void decodeRequestWithUtf16Encoding() {
    codec.defineCommand("num", POST, "/one");

    byte[] data = "{\"char\":\"水\"}".getBytes(UTF_16);
    HttpRequest request = new HttpRequest(POST, "/one");
    request.setHeader(CONTENT_TYPE, JSON_UTF_8.withCharset(UTF_16).toString());
    request.setHeader(CONTENT_LENGTH, String.valueOf(data.length));
    request.setContent(data);

    Command command = codec.decode(request);
    assertThat((String) command.getParameters().get("char"), is("水"));
  }

  @Test
  public void decodingUsesUtf8IfNoEncodingSpecified() {
    codec.defineCommand("num", POST, "/one");

    byte[] data = "{\"char\":\"水\"}".getBytes(UTF_8);
    HttpRequest request = new HttpRequest(POST, "/one");
    request.setHeader(CONTENT_TYPE, JSON_UTF_8.withoutParameters().toString());
    request.setHeader(CONTENT_LENGTH, String.valueOf(data.length));
    request.setContent(data);

    Command command = codec.decode(request);
    assertThat((String) command.getParameters().get("char"), is("水"));
  }

  @Test
  public void codecRoundTrip() {
    codec.defineCommand("buy", POST, "/:sessionId/fruit/:fruit/size/:size");

    Command original = new Command(new SessionId("session123"), "buy", ImmutableMap.of(
        "fruit", "apple", "size", "large", "color", "red", "rotten", "false"));
    HttpRequest request = codec.encode(original);
    Command decoded = codec.decode(request);

    assertThat(decoded.getName(), is(original.getName()));
    assertThat(decoded.getSessionId(), is(original.getSessionId()));
    assertThat(decoded.getParameters(), is((Map<?, ?>) original.getParameters()));
  }

  @Test
  public void treatsEmptyPathAsRoot_recognizedCommand() {
    codec.defineCommand("num", POST, "/");

    byte[] data = "{\"char\":\"水\"}".getBytes(UTF_8);
    HttpRequest request = new HttpRequest(POST, "");
    request.setHeader(CONTENT_TYPE, JSON_UTF_8.withoutParameters().toString());
    request.setHeader(CONTENT_LENGTH, String.valueOf(data.length));
    request.setContent(data);

    Command command = codec.decode(request);
    assertThat(command.getName(), is("num"));
  }

  @Test
  public void treatsNullPathAsRoot_recognizedCommand() {
    codec.defineCommand("num", POST, "/");

    byte[] data = "{\"char\":\"水\"}".getBytes(UTF_8);
    HttpRequest request = new HttpRequest(POST, null);
    request.setHeader(CONTENT_TYPE, JSON_UTF_8.withoutParameters().toString());
    request.setHeader(CONTENT_LENGTH, String.valueOf(data.length));
    request.setContent(data);

    Command command = codec.decode(request);
    assertThat(command.getName(), is("num"));
  }

  @Test
  public void treatsEmptyPathAsRoot_unrecognizedCommand() {
    codec.defineCommand("num", GET, "/");

    byte[] data = "{\"char\":\"水\"}".getBytes(UTF_8);
    HttpRequest request = new HttpRequest(POST, "");
    request.setHeader(CONTENT_TYPE, JSON_UTF_8.withoutParameters().toString());
    request.setHeader(CONTENT_LENGTH, String.valueOf(data.length));
    request.setContent(data);

    try {
      codec.decode(request);
      fail();
    } catch (UnsupportedCommandException expected) {
      // Do nothing.
    }
  }

  @Test
  public void treatsNullPathAsRoot_unrecognizedCommand() {
    codec.defineCommand("num", GET, "/");

    byte[] data = "{\"char\":\"水\"}".getBytes(UTF_8);
    HttpRequest request = new HttpRequest(POST, null);
    request.setHeader(CONTENT_TYPE, JSON_UTF_8.withoutParameters().toString());
    request.setHeader(CONTENT_LENGTH, String.valueOf(data.length));
    request.setContent(data);

    try {
      codec.decode(request);
      fail();
    } catch (UnsupportedCommandException expected) {
      // Do nothing.
    }
  }

  @Test
  public void whenDecodingAnHttpRequestDoesNotRecreateWebElements() {
    Command command = new Command(
        new SessionId("1234567"),
        DriverCommand.EXECUTE_SCRIPT,
        ImmutableMap.of(
            "script", "",
            "args", ImmutableList.of(ImmutableMap.of(OSS.getEncodedElementKey(), "67890"))));

    HttpRequest request = codec.encode(command);

    Command decoded = codec.decode(request);

    List<?> args = (List<?>) decoded.getParameters().get("args");

    Map<? ,?> element = (Map<?, ?>) args.get(0);
    assertEquals("67890", element.get(OSS.getEncodedElementKey()));
  }
}
