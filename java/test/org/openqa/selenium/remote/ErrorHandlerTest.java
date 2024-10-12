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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.json.Json;

@Tag("UnitTests")
class ErrorHandlerTest {
  private ErrorHandler handler;

  private static void assertStackTracesEqual(
      StackTraceElement[] expected, StackTraceElement[] actual) {
    assertThat(actual.length).as("Stacktrace length").isEqualTo(expected.length);
    for (int i = 0; i < expected.length; i++) {
      String message = "Frames at index [" + i + "]";
      assertThat(actual[i].getFileName()).as(message).isEqualTo(expected[i].getFileName());
      assertThat(actual[i].getClassName()).as(message).isEqualTo(expected[i].getClassName());
      assertThat(actual[i].getMethodName()).as(message).isEqualTo(expected[i].getMethodName());
      assertThat(actual[i].getLineNumber()).as(message).isEqualTo(expected[i].getLineNumber());
    }
  }

  private static Map<String, Object> toMap(Object o) {
    String rawJson = new Json().toJson(o);
    return new Json().toType(rawJson, Map.class);
  }

  @BeforeEach
  public void setUp() {
    handler = new ErrorHandler();
  }

  @Test
  void testShouldNotThrowIfResponseWasASuccess() {
    handler.throwIfResponseFailed(createResponse("success"), 100);
    // All is well if this doesn't throw.
  }

  @Test
  void testShouldThrowIfResponseWasNotSuccess() {
    Response response = createResponse("other");
    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> handler.throwIfResponseFailed(response, 123))
        .withNoCause();
  }

  @Test
  void testShouldThrowAVanillaWebDriverExceptionIfServerDoesNotProvideAValue() {
    Response response = createResponse("unknown error");
    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> handler.throwIfResponseFailed(response, 123))
        .withNoCause()
        .withMessageContaining(new WebDriverException().getMessage());
  }

  private Response createResponse(String state) {
    return createResponse(state, null);
  }

  private Response createResponse(String state, Object value) {
    Response response = new Response();
    response.setState(state);
    response.setValue(value);
    return response;
  }
}
