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

import static java.util.Objects.requireNonNullElse;
import static java.util.Objects.requireNonNullElseGet;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
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

  private static final W3CError<WebDriverException> DEFAULT_ERROR =
      new W3CError<>("unknown error", WebDriverException::new, 500);

  // note: this is a set from a logical point of view, but the implementation does rely on the order
  // of the elements.
  // there is no guarantee a Set will keep the order (and we have no .equals / .hashCode
  // implementation too).
  private static final List<W3CError<? extends WebDriverException>> ERRORS =
      List.of(
          new W3CError<>("script timeout", ScriptTimeoutException::new, 500),
          new W3CError<>("detached shadow root", DetachedShadowRootException::new, 404),
          new W3CError<>("element click intercepted", ElementClickInterceptedException::new, 400),
          new W3CError<>("element not interactable", ElementNotInteractableException::new, 400),
          new W3CError<>("invalid argument", InvalidArgumentException::new, 400),
          new W3CError<>("invalid cookie domain", InvalidCookieDomainException::new, 400),
          new W3CError<>("invalid element state", InvalidElementStateException::new, 400),
          new W3CError<>("invalid selector", InvalidSelectorException::new, 400),
          new W3CError<>("invalid session id", NoSuchSessionException::new, 404),
          new W3CError<>("insecure certificate", InsecureCertificateException::new, 400),
          new W3CError<>("javascript error", JavascriptException::new, 500),
          new W3CError<>("move target out of bounds", MoveTargetOutOfBoundsException::new, 500),
          new W3CError<>("no such alert", NoAlertPresentException::new, 404),
          new W3CError<>("no such cookie", NoSuchCookieException::new, 404),
          new W3CError<>("no such element", NoSuchElementException::new, 404),
          new W3CError<>("no such frame", NoSuchFrameException::new, 404),
          new W3CError<>("no such shadow root", NoSuchShadowRootException::new, 404),
          new W3CError<>("no such window", NoSuchWindowException::new, 404),
          new W3CError<>("session not created", SessionNotCreatedException::new, 500),
          new W3CError<>("stale element reference", StaleElementReferenceException::new, 404),
          new W3CError<>("timeout", TimeoutException::new, 500),
          new W3CError<>("unable to capture screen", ScreenshotException::new, 500),
          new W3CError<>("unable to set cookie", UnableToSetCookieException::new, 500),
          new W3CError<>("unexpected alert open", UnhandledAlertException::new, 500),
          new W3CError<>("unsupported operation", UnsupportedCommandException::new, 500),
          new W3CError<>("unknown command", UnsupportedCommandException::new, 404),
          new W3CError<>("unknown method", UnsupportedCommandException::new, 405),
          DEFAULT_ERROR);

  private ErrorCodec() {
    // This will switch to being an interface at some point. Use `createDefault`
  }

  public static ErrorCodec createDefault() {
    return new ErrorCodec();
  }

  public Map<String, Object> encode(Throwable throwable) {
    Require.nonNull("Throwable to encode", throwable);

    W3CError<?> err = fromThrowable(throwable);

    String message =
        throwable.getMessage() == null
            ? "<no message present in throwable>"
            : throwable.getMessage();

    StringWriter stacktrace = new StringWriter();
    try (PrintWriter printWriter = new PrintWriter(stacktrace)) {
      throwable.printStackTrace(printWriter);
    }

    if (throwable instanceof UnhandledAlertException) {
      String text = ((UnhandledAlertException) throwable).getAlertText();
      if (text != null) {
        return Map.of(
            "value",
            Map.of(
                "error",
                err.w3cErrorString,
                "message",
                message,
                "stacktrace",
                stacktrace.toString(),
                "data",
                Map.of("text", text)));
      }
    }

    return Map.of(
        "value",
        Map.of(
            "error", err.w3cErrorString, "message", message, "stacktrace", stacktrace.toString()));
  }

  public int getHttpStatusCode(Throwable throwable) {
    Require.nonNull("Throwable to encode", throwable);

    return fromThrowable(throwable).httpErrorCode;
  }

  public WebDriverException decode(Map<String, Object> response) {
    if (!(response.get("value") instanceof Map)) {
      throw new InvalidResponseException("missing \"value\" field", response);
    }

    Map<?, ?> value = (Map<?, ?>) response.get("value");

    Object error = requireNonNullElse(value.get("error"), "");
    Object message = requireNonNullElseGet(value.get("message"), response::toString);

    if (!(error instanceof String)) {
      throw new InvalidResponseException("\"error\" field must be a string", response);
    }
    if (!(message instanceof String)) {
      throw new InvalidResponseException("\"message\" field must be a string", response);
    }

    Optional<W3CError<? extends WebDriverException>> w3CError =
        ERRORS.stream().filter(err -> error.equals(err.w3cErrorString)).findFirst();
    if (w3CError.isPresent()) {
      return w3CError.get().exceptionConstructor.apply((String) message);
    }
    String extendedMessage = String.format("%s (error code: \"%s\")", message, error);
    return DEFAULT_ERROR.exceptionConstructor.apply(extendedMessage);
  }

  private W3CError<? extends WebDriverException> fromThrowable(Throwable throwable) {
    return ERRORS.stream()
        .filter(err -> err.exception.isAssignableFrom(throwable.getClass()))
        .findFirst()
        .orElse(DEFAULT_ERROR);
  }

  private static class W3CError<T extends WebDriverException> {

    private final String w3cErrorString;
    private final Function<String, T> exceptionConstructor;
    private final Class<T> exception;
    private final int httpErrorCode;

    @SafeVarargs
    @SuppressWarnings("unchecked")
    public W3CError(
        String w3cErrorString,
        Function<String, T> exceptionConstructor,
        int httpErrorCode,
        T... reified) {
      this.w3cErrorString = w3cErrorString;
      this.exceptionConstructor = exceptionConstructor;
      this.exception = (Class<T>) reified.getClass().getComponentType();
      this.httpErrorCode = httpErrorCode;
    }
  }
}
