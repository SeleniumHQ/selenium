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

import java.io.IOException;
import java.io.UncheckedIOException;
import java.text.ParseException;
import java.util.Map;
import java.util.UUID;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.DetachedShadowRootException;
import org.openqa.selenium.ElementClickInterceptedException;
import org.openqa.selenium.ElementNotInteractableException;
import org.openqa.selenium.InsecureCertificateException;
import org.openqa.selenium.InvalidArgumentException;
import org.openqa.selenium.InvalidCookieDomainException;
import org.openqa.selenium.InvalidElementStateException;
import org.openqa.selenium.InvalidSelectorException;
import org.openqa.selenium.JavascriptException;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.NoSuchCookieException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.NoSuchShadowRootException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.ScriptTimeoutException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.UnableToSetCookieException;
import org.openqa.selenium.UnhandledAlertException;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.interactions.MoveTargetOutOfBoundsException;

@Tag("UnitTests")
public class ErrorCodecTest {

  private final ErrorCodec errorCodec = ErrorCodec.createDefault();

  @Test
  void encodeW3cSpecExceptions() {
    String msg = UUID.randomUUID().toString();

    encodeAndCheck(new ScriptTimeoutException(msg), "script timeout", msg);
    encodeAndCheck(new DetachedShadowRootException(msg), "detached shadow root", msg);
    encodeAndCheck(new ElementClickInterceptedException(msg), "element click intercepted", msg);
    encodeAndCheck(new ElementNotInteractableException(msg), "element not interactable", msg);
    encodeAndCheck(new InvalidArgumentException(msg), "invalid argument", msg);
    encodeAndCheck(new InvalidCookieDomainException(msg), "invalid cookie domain", msg);
    encodeAndCheck(new InvalidElementStateException(msg), "invalid element state", msg);
    encodeAndCheck(new InvalidSelectorException(msg), "invalid selector", msg);
    encodeAndCheck(new NoSuchSessionException(msg), "invalid session id", msg);
    encodeAndCheck(new InsecureCertificateException(msg), "insecure certificate", msg);
    encodeAndCheck(new JavascriptException(msg), "javascript error", msg);
    encodeAndCheck(new MoveTargetOutOfBoundsException(msg), "move target out of bounds", msg);
    encodeAndCheck(new NoAlertPresentException(msg), "no such alert", msg);
    encodeAndCheck(new NoSuchCookieException(msg), "no such cookie", msg);
    encodeAndCheck(new NoSuchElementException(msg), "no such element", msg);
    encodeAndCheck(new NoSuchFrameException(msg), "no such frame", msg);
    encodeAndCheck(new NoSuchShadowRootException(msg), "no such shadow root", msg);
    encodeAndCheck(new NoSuchWindowException(msg), "no such window", msg);
    encodeAndCheck(new SessionNotCreatedException(msg), "session not created", msg);
    encodeAndCheck(new StaleElementReferenceException(msg), "stale element reference", msg);
    encodeAndCheck(new TimeoutException(msg), "timeout", msg);
    encodeAndCheck(new ScreenshotException(msg), "unable to capture screen", msg);
    encodeAndCheck(new UnableToSetCookieException(msg), "unable to set cookie", msg);
    encodeAndCheck(new UnhandledAlertException(msg), "unexpected alert open", msg);
    encodeAndCheck(new UnsupportedCommandException(msg), "unsupported operation", msg);
    encodeAndCheck(new WebDriverException(msg), "unknown error", msg);
  }

  @Test
  void encodeCommonUncheckedExceptions() {
    String msg = UUID.randomUUID().toString();

    encodeAndCheck(new NullPointerException(msg), "unknown error", msg);
    encodeAndCheck(new IllegalArgumentException(msg), "unknown error", msg);
    encodeAndCheck(new IllegalStateException(msg), "unknown error", msg);
    encodeAndCheck(new java.util.NoSuchElementException(msg), "unknown error", msg);
    encodeAndCheck(new ArrayIndexOutOfBoundsException(msg), "unknown error", msg);
    encodeAndCheck(new UncheckedIOException(msg, new IOException()), "unknown error", msg);
    encodeAndCheck(new RuntimeException(msg), "unknown error", msg);
  }

  @Test
  void encodeCommonCheckedExceptions() {
    String msg = UUID.randomUUID().toString();

    encodeAndCheck(new IOException(msg), "unknown error", msg);
    encodeAndCheck(new ParseException(msg, -1), "unknown error", msg);
    encodeAndCheck(new InterruptedException(msg), "unknown error", msg);
  }

  @Test
  void encodeCommonErrors() {
    String msg = UUID.randomUUID().toString();

    encodeAndCheck(new OutOfMemoryError(msg), "unknown error", msg);
    encodeAndCheck(new StackOverflowError(msg), "unknown error", msg);
    encodeAndCheck(new ClassNotFoundException(msg), "unknown error", msg);
  }

  void encodeAndCheck(Throwable toEncode, String expectedType, String expectedMessage) {
    Map<String, Object> encoded = errorCodec.encode(toEncode);
    Map<String, Object> value = (Map<String, Object>) encoded.get("value");

    Assertions.assertThat(value.get("error")).isEqualTo(expectedType);
    Assertions.assertThat(value.get("message")).isEqualTo(toEncode.getMessage());
  }
}
