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

package org.openqa.selenium.remote.server;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.fail;

import com.google.common.collect.ImmutableSet;

import org.junit.Test;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

public class AllHandlersTest {
  private AllHandlers allHandlers = new AllHandlers(new ActiveSessions(120, SECONDS));

  static class NoArgs implements CommandHandler {
    @Override
    public void execute(HttpRequest req, HttpResponse resp) throws IOException {
      // Does nothing
    }
  }

  @Test
  public void canCreateAnObject() {
    ActiveSessions sessions = new ActiveSessions(3, TimeUnit.MINUTES);
    NoArgs noArgs = allHandlers.create(NoArgs.class, ImmutableSet.of(sessions));

    assertNotNull(noArgs);
  }

  static class SingleArg implements CommandHandler {
    private final SessionId id;

    public SingleArg(SessionId id) {
      this.id = Objects.requireNonNull(id);
    }

    @Override
    public void execute(HttpRequest req, HttpResponse resp) throws IOException {
      // Does nothing
    }
  }

  @Test
  public void willCallAConstructorThatTakesAnArgument() {
    SessionId id = new SessionId("2345678");

    SingleArg singleArg = allHandlers.create(SingleArg.class, ImmutableSet.of(id));

    assertEquals(id, singleArg.id);
  }

  static class MultipleArgs implements CommandHandler {

    private final SessionId id;
    private final String cake;

    public MultipleArgs(String cake) {
      this(null, cake);
    }

    public MultipleArgs(SessionId id, String cake) {
      this.id = id;
      this.cake = cake;
    }

    public MultipleArgs(SessionId id) {
      this(id, null);
    }

    @Override
    public void execute(HttpRequest req, HttpResponse resp) throws IOException {
      // Does nothing
    }
  }
  @Test
  public void willCallLongestConstructor() throws IOException {
    SessionId id = new SessionId("12345678");
    String cake = "cheese";

    MultipleArgs multipleArgs = allHandlers.create(MultipleArgs.class, ImmutableSet.of(cake, id));

    assertEquals(id, multipleArgs.id);
    assertEquals(cake, multipleArgs.cake);
  }

  static class UnmatchableConstructor implements CommandHandler {

    private SessionId id;

    public UnmatchableConstructor(SessionId id, String cake) {
      fail("I shall never be called");
    }

    public UnmatchableConstructor(SessionId id) {
      this.id = id;
    }

    @Override
    public void execute(HttpRequest req, HttpResponse resp) throws IOException {
      // Do nothing
    }
  }

  @Test
  public void shouldOnlyCallLongestConstructorWhereEverParameterCanBeFilled() {
    SessionId id = new SessionId("2345678");

    UnmatchableConstructor unmatchable = allHandlers.create(
        UnmatchableConstructor.class,
        ImmutableSet.of(id));

    assertEquals(id, unmatchable.id);
  }

  @Test(expected = IllegalArgumentException.class)
  public void shouldThrowAnErrorIfThereIsNoCallableConstructor() {
    allHandlers.create(SingleArg.class, ImmutableSet.of());
  }
}
