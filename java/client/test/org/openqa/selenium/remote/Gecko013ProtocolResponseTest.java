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

package org.openqa.selenium.remote;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;

import java.net.MalformedURLException;
import java.util.Optional;


public class Gecko013ProtocolResponseTest {

  @Test
  public void successfulResponseGetsParsedProperly() throws MalformedURLException {
    Capabilities caps = new ImmutableCapabilities("cheese", "peas");
    ImmutableMap<String, ?> payload =
        ImmutableMap.of(
            "value", caps.asMap(),
            "sessionId", "cheese is opaque");
    InitialHandshakeResponse initialResponse = new InitialHandshakeResponse(
        0,
        200,
        payload);

    Optional<ProtocolHandshake.Result> optionalResult =
        new Gecko013ProtocolResponse().getResponseFunction().apply(initialResponse);

    assertTrue(optionalResult.isPresent());
    ProtocolHandshake.Result result = optionalResult.get();

    assertEquals(Dialect.W3C, result.getDialect());
    Response response = result.createResponse();

    assertEquals("success", response.getState());
    assertEquals(0, (int) response.getStatus());

    assertEquals(caps.asMap(), response.getValue());
  }

  @Test
  public void shouldIgnoreAJsonWireProtocolReply() {
    Capabilities caps = new ImmutableCapabilities("cheese", "peas");
    ImmutableMap<String, ?> payload =
        ImmutableMap.of(
            "status", 0,
            "value", caps.asMap(),
            "sessionId", "cheese is opaque");
    InitialHandshakeResponse initialResponse = new InitialHandshakeResponse(
        0,
        200,
        payload);

    Optional<ProtocolHandshake.Result> optionalResult =
        new Gecko013ProtocolResponse().getResponseFunction().apply(initialResponse);

    assertFalse(optionalResult.isPresent());
  }

  @Test
  public void shouldIgnoreASpecCompliantReply() {
    Capabilities caps = new ImmutableCapabilities("cheese", "peas");
    ImmutableMap<String, ImmutableMap<String, Object>> payload =
        ImmutableMap.of(
            "value", ImmutableMap.of(
                "capabilities", caps.asMap(),
                "sessionId", "cheese is opaque"));
    InitialHandshakeResponse initialResponse = new InitialHandshakeResponse(
        0,
        200,
        payload);

    Optional<ProtocolHandshake.Result> optionalResult =
        new Gecko013ProtocolResponse().getResponseFunction().apply(initialResponse);

    assertFalse(optionalResult.isPresent());
  }

  @Test
  public void shouldProperlyPopulateAnError() {
    ImmutableMap<String, ?> payload = ImmutableMap.of(
            "error", "session not created",
            "message", "me no likey",
            "stacktrace", "I have no idea what went wrong");

    InitialHandshakeResponse initialResponse = new InitialHandshakeResponse(
        0,
        500,
        payload);


    try {
      new Gecko013ProtocolResponse().getResponseFunction().apply(initialResponse);
      fail();
    } catch (SessionNotCreatedException e) {
      assertTrue(e.getMessage().contains("me no likey"));
      assertFalse(e.getAdditionalInformation().contains("I have no idea what went wrong"));
    }

  }

}
