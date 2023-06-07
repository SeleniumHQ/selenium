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

import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import java.lang.reflect.Constructor;
import java.util.Map;
import java.util.Set;
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
import org.openqa.selenium.internal.Require;

// TODO(simon): Push back into the remote jar and centralise all error decoding and encoding.
public class ErrorCodec {

  private static final W3CError DEFAULT_ERROR =
      new W3CError("unknown error", WebDriverException.class, 500);

  private static final Set<W3CError> ERRORS =
      ImmutableSet.<W3CError>builder()
          .add(new W3CError("script timeout", ScriptTimeoutException.class, 500))
          .add(new W3CError("detached shadow root", DetachedShadowRootException.class, 404))
          .add(
              new W3CError(
                  "element click intercepted", ElementClickInterceptedException.class, 400))
          .add(new W3CError("element not interactable", ElementNotInteractableException.class, 400))
          .add(new W3CError("invalid argument", InvalidArgumentException.class, 400))
          .add(new W3CError("invalid cookie domain", InvalidCookieDomainException.class, 400))
          .add(new W3CError("invalid element state", InvalidElementStateException.class, 400))
          .add(new W3CError("invalid selector", InvalidSelectorException.class, 400))
          .add(new W3CError("invalid session id", NoSuchSessionException.class, 404))
          .add(new W3CError("insecure certificate", InsecureCertificateException.class, 400))
          .add(new W3CError("javascript error", JavascriptException.class, 500))
          .add(new W3CError("move target out of bounds", MoveTargetOutOfBoundsException.class, 500))
          .add(new W3CError("no such alert", NoAlertPresentException.class, 404))
          .add(new W3CError("no such cookie", NoSuchCookieException.class, 404))
          .add(new W3CError("no such element", NoSuchElementException.class, 404))
          .add(new W3CError("no such frame", NoSuchFrameException.class, 404))
          .add(new W3CError("no such shadow root", NoSuchShadowRootException.class, 404))
          .add(new W3CError("no such window", NoSuchWindowException.class, 404))
          .add(new W3CError("session not created", SessionNotCreatedException.class, 500))
          .add(new W3CError("stale element reference", StaleElementReferenceException.class, 404))
          .add(new W3CError("timeout", TimeoutException.class, 500))
          .add(new W3CError("unable to capture screen", ScreenshotException.class, 500))
          .add(new W3CError("unable to set cookie", UnableToSetCookieException.class, 500))
          .add(new W3CError("unexpected alert open", UnhandledAlertException.class, 500))
          .add(new W3CError("unknown error", WebDriverException.class, 500))
          .add(new W3CError("unknown command", UnsupportedCommandException.class, 404))
          .add(new W3CError("unknown method", UnsupportedCommandException.class, 405))
          .add(new W3CError("unsupported operation", UnsupportedCommandException.class, 404))
          .build();

  private ErrorCodec() {
    // This will switch to being an interface at some point. Use `createDefault`
  }

  public static ErrorCodec createDefault() {
    return new ErrorCodec();
  }

  public Map<String, Object> encode(Throwable throwable) {
    Require.nonNull("Throwable to encode", throwable);

    W3CError err = fromThrowable(throwable);

    String message =
        throwable.getMessage() == null
            ? "<no message present in throwable>"
            : throwable.getMessage();

    return ImmutableMap.of(
        "value",
        ImmutableMap.of(
            "error",
            err.w3cErrorString,
            "message",
            message,
            "stacktrace",
            Throwables.getStackTraceAsString(throwable)));
  }

  public int getHttpStatusCode(Throwable throwable) {
    Require.nonNull("Throwable to encode", throwable);

    return fromThrowable(throwable).httpErrorCode;
  }

  public WebDriverException decode(Map<String, Object> response) {
    if (!(response.get("value") instanceof Map)) {
      throw new IllegalArgumentException("Unable to find mapping for " + response.toString());
    }

    Map<?, ?> value = (Map<?, ?>) response.get("value");
    if (!(value.get("error") instanceof String)) {
      throw new IllegalArgumentException("Unable to find mapping for " + response.toString());
    }

    String error = (String) value.get("error");
    String message = value.get("message") instanceof String ? (String) value.get("message") : null;

    W3CError w3CError =
        ERRORS.stream()
            .filter(err -> error.equals(err.w3cErrorString))
            .findFirst()
            .orElse(DEFAULT_ERROR);

    try {
      Constructor<? extends WebDriverException> constructor =
          w3CError.exception.getConstructor(String.class);
      return constructor.newInstance(message);
    } catch (ReflectiveOperationException e) {
      throw new WebDriverException(message, e);
    }
  }

  private W3CError fromThrowable(Throwable throwable) {
    return ERRORS.stream()
        .filter(err -> throwable.getClass().isAssignableFrom(err.exception))
        .findFirst()
        .orElse(DEFAULT_ERROR);
  }

  private static class W3CError {

    public final String w3cErrorString;
    public final Class<? extends WebDriverException> exception;
    public final int httpErrorCode;

    public W3CError(
        String w3cErrorString, Class<? extends WebDriverException> exception, int httpErrorCode) {
      this.w3cErrorString = w3cErrorString;
      this.exception = exception;
      this.httpErrorCode = httpErrorCode;
    }
  }
}
