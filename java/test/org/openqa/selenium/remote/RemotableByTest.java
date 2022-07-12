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

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.InvalidArgumentException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Function;

import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.remote.ErrorCodes.SUCCESS_STRING;

import com.google.common.collect.ImmutableMap;

public class RemotableByTest {

  private final SessionId id = new SessionId(UUID.randomUUID());
  private final ErrorCodes errorCodes = new ErrorCodes();

  @Test
  public void shouldCallW3CLocatorWithW3CParameters() {
    AtomicReference<Map<?, ?>> parameters = new AtomicReference<>();

    WebDriver driver = createDriver(cmd -> {
      parameters.set(cmd.getParameters());
      return createResponse(new RemoteWebElement());
    });
    driver.findElement(By.cssSelector("#foo"));

    assertThat(parameters.get())
      .isEqualTo(ImmutableMap.of("using", "css selector", "value", "#foo"));
  }

  @Test
  public void shouldCallDownToSearchContextForNonRemotableLocators() {
    AtomicReference<Map<?, ?>> parameters = new AtomicReference<>();

    WebDriver driver = createDriver(
      cmd -> {
        parameters.set(cmd.getParameters());
        return createResponse(singletonList(new RemoteWebElement()));
      }
    );

    driver.findElement(new By() {
      @Override
      public List<WebElement> findElements(SearchContext context) {
        return context.findElements(By.cssSelector("#foo"));
      }
    });

    assertThat(parameters.get())
      .isEqualTo(ImmutableMap.of("using", "css selector", "value", "#foo"));
  }

  @Test
  public void shouldAttemptToUseRemotableParametersIfPresent() {
    AtomicReference<Map<?, ?>> parameters = new AtomicReference<>();

    WebDriver driver = createDriver(
      cmd -> {
        parameters.set(cmd.getParameters());
        return createResponse(new RemoteWebElement());
      }
    );

    class CustomBy extends By implements By.Remotable {
      @Override
      public Parameters getRemoteParameters() {
        return new Parameters("magic", "abracadabra");
      }

      @Override
      public List<WebElement> findElements(SearchContext context) {
        throw new UnsupportedOperationException("findElements");
      }
    }

    driver.findElement(new CustomBy());

    assertThat(parameters.get())
      .isEqualTo(ImmutableMap.of("using", "magic", "value", "abracadabra"));
  }

  @Test
  public void shouldFallBackToCallingSearchContextIfRemotableSearchReturnsInvalidArgument() {
    AtomicReference<Map<?, ?>> parameters = new AtomicReference<>();

    WebDriver driver = createDriver(
      cmd -> createError(new InvalidArgumentException("Nope")),
      cmd -> {
        parameters.set(cmd.getParameters());
        return createResponse(singletonList(new RemoteWebElement()));
      }
    );

    class CustomBy extends By implements By.Remotable {
      @Override
      public Parameters getRemoteParameters() {
        return new Parameters("magic", "abracadabra");
      }

      @Override
      public List<WebElement> findElements(SearchContext context) {
        return context.findElements(By.cssSelector("not-magic"));
      }
    }

    driver.findElement(new CustomBy());

    assertThat(parameters.get())
      .isEqualTo(ImmutableMap.of("using", "css selector", "value", "not-magic"));
  }

  @Test
  public void shouldUseMechanismUsedForFirstSuccessfulSearchInLaterCalls() {
    AtomicReference<Map<?, ?>> parameters = new AtomicReference<>();

    // The remote driver attempts to find remotable elements by going straight
    // to the remotable version first. The spec says that may return an
    // "invalid argument" error, so the remote webdriver then falls back to
    // calling `findElement(SearchContext)`. As such, we build up the requests
    // in pairs, until we reach the final call, where we expect the remotable
    // path to be skipped.
    WebDriver driver = createDriver(
      // First search fails because the argument actually _is_ invalid.
      cmd -> createError(new InvalidArgumentException("remoting fail")),
      cmd -> createError(new InvalidArgumentException("context fail")),

      // Second search tries both mechanisms, and succeeds because fallback to search context works
      cmd -> createError(new InvalidArgumentException("remoting fail")),
      cmd -> createResponse(singletonList(new RemoteWebElement())),

      // Third search goes straight to using the fallback
      cmd -> {
        parameters.set(cmd.getParameters());
        return createResponse(singletonList(new RemoteWebElement()));
      }
    );

    class CustomBy extends By implements By.Remotable {
      private final String arg;

      public CustomBy(String arg) {
        this.arg = arg;
      }

      @Override
      public List<WebElement> findElements(SearchContext context) {
        return context.findElements(By.cssSelector(arg));
      }

      @Override
      public Parameters getRemoteParameters() {
        return new Parameters("custom", arg);
      }
    }

    assertThatExceptionOfType(InvalidArgumentException.class).isThrownBy(() -> driver.findElement(new CustomBy("one")));
    driver.findElement(new CustomBy("two"));
    driver.findElement(new CustomBy("three"));

    assertThat(parameters.get())
      .isEqualTo(ImmutableMap.of("using", "css selector", "value", "three"));
  }

  private Response createResponse(Object value) {
    Response res = new Response();
    res.setState(SUCCESS_STRING);
    res.setSessionId(id.toString());
    res.setValue(value);
    return res;
  }

  private Response createError(Exception e) {
    Response res = new Response();
    res.setStatus(errorCodes.toStatusCode(e));
    res.setState(errorCodes.toState(res.getStatus()));
    res.setValue(ErrorCodec.createDefault().encode(e));
    return res;
  }

  @SafeVarargs
  private WebDriver createDriver(Function<Command, Response>... responses) {
    Iterator<Function<Command, Response>> iterator = Arrays.stream(responses).iterator();
    CommandExecutor executor = cmd -> iterator.next().apply(cmd);

    return new RemoteWebDriver(executor, new ImmutableCapabilities()) {
      @Override
      protected void startSession(Capabilities capabilities) {
        // no-op
      }
    };
  }
}
