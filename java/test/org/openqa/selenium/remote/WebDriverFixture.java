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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.lang.reflect.Array;
import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.mockito.InOrder;
import org.mockito.Mockito;
import org.mockito.stubbing.OngoingStubbing;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriverException;

class WebDriverFixture {

  public final CommandExecutor executor;
  public final RemoteWebDriver driver;
  private final SessionId sessionId;

  @SafeVarargs
  public WebDriverFixture(Function<Command, Response>... handlers) {
    this(new ImmutableCapabilities(), handlers);
  }

  @SafeVarargs
  public WebDriverFixture(Capabilities capabilities, Function<Command, Response>... handlers) {
    executor = prepareExecutorMock(handlers);
    driver = new RemoteWebDriver(executor, capabilities);
    sessionId = driver.getSessionId();
  }

  @SafeVarargs
  public static CommandExecutor prepareExecutorMock(Function<Command, Response>... handlers) {
    CommandExecutor executor = mock(CommandExecutor.class);
    try {
      OngoingStubbing<Response> callChain = when(executor.execute(any()));
      for (Function<Command, Response> handler : handlers) {
        callChain = callChain.thenAnswer(invocation -> handler.apply(invocation.getArgument(0)));
      }
      return executor;
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public void verifyNoCommands() {
    try {
      verify(executor).execute(argThat(cmd -> cmd.getName().equals(DriverCommand.NEW_SESSION)));
    } catch (IOException ex) {
      throw new UncheckedIOException(ex);
    }
    verifyNoMoreInteractions(executor);
  }

  public void verifyCommands(CommandPayload... commands) {
    InOrder inOrder = Mockito.inOrder(executor);
    try {
      inOrder
          .verify(executor)
          .execute(argThat(command -> command.getName().equals(DriverCommand.NEW_SESSION)));
      for (CommandPayload target : commands) {
        int x =
            target instanceof MultiCommandPayload ? ((MultiCommandPayload) target).getTimes() : 1;
        inOrder
            .verify(executor, times(x))
            .execute(
                argThat(
                    cmd ->
                        cmd.getSessionId().equals(sessionId)
                            && cmd.getName().equals(target.getName())
                            && areEqual(cmd.getParameters(), target.getParameters())));
      }
    } catch (IOException ex) {
      throw new UncheckedIOException(ex);
    }
    verifyNoMoreInteractions(executor);
  }

  private boolean areEqual(Map<String, ?> left, Map<String, ?> right) {
    if (left.size() != right.size()) {
      return false;
    }
    if (!left.keySet().equals(right.keySet())) {
      return false;
    }
    for (String key : left.keySet()) {
      if (!areEqual(left.get(key), right.get(key))) {
        return false;
      }
    }
    return true;
  }

  private boolean areEqual(Object left, Object right) {
    if (left == null) {
      return right == null;
    }
    if (!left.getClass().isArray()) {
      return left.equals(right);
    }
    if (!right.getClass().isArray()) {
      return false;
    }
    for (int i = 0; i < Array.getLength(left); i++) {
      if (!Array.get(left, i).equals(Array.get(right, i))) {
        return false;
      }
    }
    return true;
  }

  public static final Function<Command, Response> nullResponder = cmd -> null;

  public static final Function<Command, Response> exceptionResponder =
      cmd -> {
        throw new InternalError("BOOM!!!");
      };

  public static final Function<Command, Response> webDriverExceptionResponder =
      cmd -> {
        throw new WebDriverException("BOOM!!!");
      };

  public static final Function<Command, Response> nullValueResponder = valueResponder(null);

  public static Function<Command, Response> valueResponder(Object value) {
    return cmd -> {
      Response response = new Response();
      response.setValue(value);
      response.setSessionId(cmd.getSessionId() != null ? cmd.getSessionId().toString() : null);
      return response;
    };
  }

  public static Function<Command, Response> errorResponder(String state, Object value) {
    return cmd -> {
      Response response = new Response();
      response.setState(state);
      response.setStatus(new ErrorCodes().toStatus(state, Optional.of(400)));
      response.setValue(value);
      response.setSessionId(cmd.getSessionId() != null ? cmd.getSessionId().toString() : null);
      return response;
    };
  }

  public static final Function<Command, Response> echoCapabilities =
      cmd -> {
        Response response = new Response();

        @SuppressWarnings("unchecked")
        Collection<Capabilities> capabilities =
            (Collection<Capabilities>) cmd.getParameters().get("capabilities");

        response.setValue(
            capabilities.iterator().next().asMap().entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().toString())));
        response.setSessionId(UUID.randomUUID().toString());
        return response;
      };
}
