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

import static com.google.common.net.HttpHeaders.CACHE_CONTROL;
import static com.google.common.net.HttpHeaders.CONTENT_LENGTH;
import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.nio.charset.StandardCharsets.UTF_16;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.remote.Dialect.OSS;
import static org.openqa.selenium.remote.http.Contents.bytes;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.DELETE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.collect.ImmutableMap;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag("UnitTests")
public class JsonHttpCommandCodecTest {

  private final JsonHttpCommandCodec codec = new JsonHttpCommandCodec();

  @Test
  public void throwsIfCommandNameIsNotRecognized() {
    Command command = new Command(null, "garbage-command-name");
    assertThatExceptionOfType(UnsupportedCommandException.class)
        .isThrownBy(() -> codec.encode(command))
        .withMessageStartingWith(command.getName() + "\n");
  }

  @Test
  public void throwsIfCommandHasNullSessionId() {
    codec.defineCommand("foo", DELETE, "/foo/:sessionId");
    Command command = new Command(null, "foo");
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> codec.encode(command))
        .withMessageContaining("Session ID");
  }

  @Test
  public void throwsIfCommandIsMissingUriParameter() {
    codec.defineCommand("foo", DELETE, "/foo/:bar");
    Command command = new Command(new SessionId("id"), "foo");
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> codec.encode(command))
        .withMessageContaining("bar");
  }

  @Test
  public void encodingAPostWithNoParameters() {
    codec.defineCommand("foo", POST, "/foo/bar");
    Command command = new Command(null, "foo");

    HttpRequest request = codec.encode(command);
    assertThat(request.getMethod()).isEqualTo(POST);
    assertThat(request.getHeader(CONTENT_TYPE)).isEqualTo(JSON_UTF_8.toString());
    assertThat(request.getHeader(CONTENT_LENGTH)).isEqualTo("3");
    assertThat(request.getUri()).isEqualTo("/foo/bar");
    assertThat(string(request)).isEqualTo("{\n}");
  }

  @Test
  public void encodingAPostWithUrlParameters() {
    codec.defineCommand("foo", POST, "/foo/:bar/baz");
    Command command = new Command(null, "foo", ImmutableMap.of("bar", "apples123"));

    String encoding = "{\n  \"bar\": \"apples123\"\n}";

    HttpRequest request = codec.encode(command);
    assertThat(request.getMethod()).isEqualTo(POST);
    assertThat(request.getHeader(CONTENT_TYPE)).isEqualTo(JSON_UTF_8.toString());
    assertThat(request.getHeader(CONTENT_LENGTH)).isEqualTo(String.valueOf(encoding.length()));
    assertThat(request.getUri()).isEqualTo("/foo/apples123/baz");
    assertThat(string(request)).isEqualTo(encoding);
  }

  @Test
  public void encodingANonPostWithNoParameters() {
    codec.defineCommand("foo", DELETE, "/foo/bar/baz");
    HttpRequest request = codec.encode(new Command(null, "foo"));
    assertThat(request.getMethod()).isEqualTo(DELETE);
    assertThat(request.getHeader(CONTENT_TYPE)).isNull();
    assertThat(request.getHeader(CONTENT_LENGTH)).isNull();
    assertThat(bytes(request.getContent()).length).isEqualTo(0);
    assertThat(request.getUri()).isEqualTo("/foo/bar/baz");
  }

  @Test
  public void encodingANonPostWithParameters() {
    codec.defineCommand("eat", GET, "/fruit/:fruit/:size");
    HttpRequest request = codec.encode(new Command(null, "eat", ImmutableMap.of(
        "fruit", "apple", "size", "large")));
    assertThat(request.getHeader(CONTENT_TYPE)).isNull();
    assertThat(request.getHeader(CONTENT_LENGTH)).isNull();
    assertThat(bytes(request.getContent()).length).isEqualTo(0);
    assertThat(request.getUri()).isEqualTo("/fruit/apple/large");
  }

  @Test
  public void preventsCachingGetRequests() {
    codec.defineCommand("foo", GET, "/foo");
    HttpRequest request = codec.encode(new Command(null, "foo"));
    assertThat(request.getMethod()).isEqualTo(GET);
    assertThat(request.getHeader(CACHE_CONTROL)).isEqualTo("no-cache");
  }

  @Test
  public void throwsIfEncodedCommandHasNoMapping() {
    HttpRequest request = new HttpRequest(GET, "/foo/bar/baz");
    assertThatExceptionOfType(UnsupportedCommandException.class)
        .isThrownBy(() -> codec.decode(request))
        .withMessageStartingWith("GET /foo/bar/baz\n");
  }

  @Test
  public void canDecodeCommandWithNoParameters() {
    HttpRequest request = new HttpRequest(GET, "/foo/bar/baz");
    codec.defineCommand("foo", GET, "/foo/bar/baz");

    Command decoded = codec.decode(request);
    assertThat(decoded.getName()).isEqualTo("foo");
    assertThat(decoded.getSessionId()).isNull();
    assertThat(decoded.getParameters()).isEmpty();
  }

  @Test
  public void canExtractSessionIdFromPathParameters() {
    HttpRequest request = new HttpRequest(GET, "/foo/bar/baz");
    codec.defineCommand("foo", GET, "/foo/:sessionId/baz");

    Command decoded = codec.decode(request);
    assertThat(decoded.getSessionId()).isEqualTo(new SessionId("bar"));
  }

  @Test
  public void removesSessionIdFromParameterMap() {
    HttpRequest request = new HttpRequest(GET, "/foo/bar/baz");
    codec.defineCommand("foo", GET, "/foo/:sessionId/baz");

    Command decoded = codec.decode(request);
    assertThat(decoded.getSessionId()).isEqualTo(new SessionId("bar"));
    assertThat(decoded.getParameters()).isEmpty();
  }

  @Test
  public void canExtractSessionIdFromRequestBody() {
    String data = new Json().toJson(ImmutableMap.of("sessionId", "sessionX"));
    HttpRequest request = new HttpRequest(POST, "/foo/bar/baz");
    request.setContent(utf8String(data));
    codec.defineCommand("foo", POST, "/foo/bar/baz");

    Command decoded = codec.decode(request);
    assertThat(decoded.getSessionId()).isEqualTo(new SessionId("sessionX"));
  }

  @Test
  public void extractsAllParametersFromUrl() {
    HttpRequest request = new HttpRequest(GET, "/fruit/apple/size/large");
    codec.defineCommand("pick", GET, "/fruit/:fruit/size/:size");

    Command decoded = codec.decode(request);
    assertThat(decoded.getParameters()).isEqualTo((Map<String, String>) ImmutableMap.of(
        "fruit", "apple",
        "size", "large"));
  }

  @Test
  public void extractsAllParameters() {
    String data = new Json().toJson(ImmutableMap.of("sessionId", "sessionX",
                                                    "fruit", "apple",
                                                    "color", "red",
                                                    "size", "large"));
    HttpRequest request = new HttpRequest(POST, "/fruit/apple/size/large");
    request.setContent(utf8String(data));
    codec.defineCommand("pick", POST, "/fruit/:fruit/size/:size");

    Command decoded = codec.decode(request);
    assertThat(decoded.getSessionId()).isEqualTo(new SessionId("sessionX"));
    assertThat(decoded.getParameters()).isEqualTo((Map<String, String>) ImmutableMap.of(
        "fruit", "apple", "size", "large", "color", "red"));
  }

  @Test
  public void ignoresNullSessionIdInSessionBody() {
    Map<String, Object> map = new HashMap<>();
    map.put("sessionId", null);
    map.put("fruit", "apple");
    map.put("color", "red");
    map.put("size", "large");
    String data = new Json().toJson(map);
    HttpRequest request = new HttpRequest(POST, "/fruit/apple/size/large");
    request.setContent(utf8String(data));
    codec.defineCommand("pick", POST, "/fruit/:fruit/size/:size");

    Command decoded = codec.decode(request);
    assertThat(decoded.getSessionId()).isNull();
    assertThat(decoded.getParameters()).isEqualTo((Map<String, String>) ImmutableMap.of(
        "fruit", "apple", "size", "large", "color", "red"));
  }

  @Test
  public void decodeRequestWithUtf16Encoding() {
    codec.defineCommand("num", POST, "/one");

    byte[] data = "{\"char\":\"水\"}".getBytes(UTF_16);
    HttpRequest request = new HttpRequest(POST, "/one");
    request.setHeader(CONTENT_TYPE, JSON_UTF_8.withCharset(UTF_16).toString());
    request.setHeader(CONTENT_LENGTH, String.valueOf(data.length));
    request.setContent(bytes(data));

    Command command = codec.decode(request);
    assertThat((String) command.getParameters().get("char")).isEqualTo("水");
  }

  @Test
  public void decodingUsesUtf8IfNoEncodingSpecified() {
    codec.defineCommand("num", POST, "/one");

    byte[] data = "{\"char\":\"水\"}".getBytes(UTF_8);
    HttpRequest request = new HttpRequest(POST, "/one");
    request.setHeader(CONTENT_TYPE, JSON_UTF_8.withoutParameters().toString());
    request.setHeader(CONTENT_LENGTH, String.valueOf(data.length));
    request.setContent(bytes(data));

    Command command = codec.decode(request);
    assertThat((String) command.getParameters().get("char")).isEqualTo("水");
  }

  @Test
  public void codecRoundTrip() {
    codec.defineCommand("buy", POST, "/:sessionId/fruit/:fruit/size/:size");

    Command original = new Command(new SessionId("session123"), "buy", ImmutableMap.of(
        "fruit", "apple", "size", "large", "color", "red", "rotten", "false"));
    HttpRequest request = codec.encode(original);
    Command decoded = codec.decode(request);

    assertThat(decoded.getName()).isEqualTo(original.getName());
    assertThat(decoded.getSessionId()).isEqualTo(original.getSessionId());
    assertThat(decoded.getParameters()).isEqualTo((Map<?, ?>) original.getParameters());
  }

  @Test
  public void treatsEmptyPathAsRoot_recognizedCommand() {
    codec.defineCommand("num", POST, "/");

    byte[] data = "{\"char\":\"水\"}".getBytes(UTF_8);
    HttpRequest request = new HttpRequest(POST, "");
    request.setHeader(CONTENT_TYPE, JSON_UTF_8.withoutParameters().toString());
    request.setHeader(CONTENT_LENGTH, String.valueOf(data.length));
    request.setContent(bytes(data));

    Command command = codec.decode(request);
    assertThat(command.getName()).isEqualTo("num");
  }

  @Test
  public void treatsNullPathAsRoot_recognizedCommand() {
    codec.defineCommand("num", POST, "/");

    byte[] data = "{\"char\":\"水\"}".getBytes(UTF_8);
    HttpRequest request = new HttpRequest(POST, null);
    request.setHeader(CONTENT_TYPE, JSON_UTF_8.withoutParameters().toString());
    request.setHeader(CONTENT_LENGTH, String.valueOf(data.length));
    request.setContent(bytes(data));

    Command command = codec.decode(request);
    assertThat(command.getName()).isEqualTo("num");
  }

  @Test
  public void treatsEmptyPathAsRoot_unrecognizedCommand() {
    codec.defineCommand("num", GET, "/");

    byte[] data = "{\"char\":\"水\"}".getBytes(UTF_8);
    HttpRequest request = new HttpRequest(POST, "");
    request.setHeader(CONTENT_TYPE, JSON_UTF_8.withoutParameters().toString());
    request.setHeader(CONTENT_LENGTH, String.valueOf(data.length));
    request.setContent(bytes(data));

    assertThatExceptionOfType(UnsupportedCommandException.class)
        .isThrownBy(() -> codec.decode(request));
  }

  @Test
  public void treatsNullPathAsRoot_unrecognizedCommand() {
    codec.defineCommand("num", GET, "/");

    byte[] data = "{\"char\":\"水\"}".getBytes(UTF_8);
    HttpRequest request = new HttpRequest(POST, null);
    request.setHeader(CONTENT_TYPE, JSON_UTF_8.withoutParameters().toString());
    request.setHeader(CONTENT_LENGTH, String.valueOf(data.length));
    request.setContent(bytes(data));

    assertThatExceptionOfType(UnsupportedCommandException.class)
        .isThrownBy(() -> codec.decode(request));
  }

  @Test
  public void whenDecodingAnHttpRequestDoesNotRecreateWebElements() {
    Command command = new Command(
        new SessionId("1234567"),
        DriverCommand.EXECUTE_SCRIPT,
        ImmutableMap.of(
            "script", "",
            "args", Arrays.asList(ImmutableMap.of(OSS.getEncodedElementKey(), "67890"))));

    HttpRequest request = codec.encode(command);

    Command decoded = codec.decode(request);

    List<?> args = (List<?>) decoded.getParameters().get("args");

    Map<? ,?> element = (Map<?, ?>) args.get(0);
    assertThat(element.get(OSS.getEncodedElementKey())).isEqualTo("67890");
  }
}
