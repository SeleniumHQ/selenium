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
import com.google.gson.Gson;

import org.junit.Test;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriverException;

import java.net.MalformedURLException;
import java.util.Map;
import java.util.Optional;

public class JsonWireProtocolResponseTest {

  @Test
  public void successfulResponseGetsParsedProperly() throws MalformedURLException {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability("cheese", "peas");
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
        new JsonWireProtocolResponse().getResponseFunction().apply(initialResponse);

    assertTrue(optionalResult.isPresent());
    ProtocolHandshake.Result result = optionalResult.get();

    assertEquals(Dialect.OSS, result.getDialect());
    Response response = result.createResponse();

    assertEquals("success", response.getState());
    assertEquals(0, (int) response.getStatus());

    assertEquals(caps.asMap(), response.getValue());
  }

  @Test
  public void shouldIgnoreAw3CProtocolReply() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability("cheese", "peas");
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
        new JsonWireProtocolResponse().getResponseFunction().apply(initialResponse);

    assertFalse(optionalResult.isPresent());
  }

  @Test
  public void shouldIgnoreAGeckodriver013Reply() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability("cheese", "peas");
    ImmutableMap<String, ?> payload =
        ImmutableMap.of(
            "value", caps.asMap(),
            "sessionId", "cheese is opaque");
    InitialHandshakeResponse initialResponse = new InitialHandshakeResponse(
        0,
        200,
        payload);

    Optional<ProtocolHandshake.Result> optionalResult =
        new JsonWireProtocolResponse().getResponseFunction().apply(initialResponse);

    assertFalse(optionalResult.isPresent());
  }

  @Test
  public void shouldProperlyPopulateAnError() {
    WebDriverException exception = new SessionNotCreatedException("me no likey");

    ImmutableMap<String, ?> payload = ImmutableMap.of(
            "value", new Gson().fromJson(new BeanToJsonConverter().convert(exception), Map.class),
            "status", ErrorCodes.SESSION_NOT_CREATED);

    InitialHandshakeResponse initialResponse = new InitialHandshakeResponse(
        0,
        500,
        payload);


    try {
      new JsonWireProtocolResponse().getResponseFunction().apply(initialResponse);
      fail();
    } catch (SessionNotCreatedException e) {
      assertTrue(e.getMessage().contains("me no likey"));
    }

  }
}
