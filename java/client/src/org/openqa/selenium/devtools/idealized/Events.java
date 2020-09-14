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

package org.openqa.selenium.devtools.idealized;

import org.openqa.selenium.JavascriptException;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.events.ConsoleEvent;
import org.openqa.selenium.internal.Require;

import java.util.LinkedList;
import java.util.List;
import java.util.function.Consumer;

public abstract class Events<CONSOLEEVENT, EXCEPTIONTHROWN> {

  private final DevTools devtools;
  private final List<Consumer<ConsoleEvent>> consoleListeners = new LinkedList<>();
  private final List<Consumer<JavascriptException>> exceptionListeners = new LinkedList<>();
  private boolean consoleListenersEnabled = false;

  public Events(DevTools devtools) {
    this.devtools = Require.nonNull("DevTools", devtools);
  }

  public void addConsoleListener(Consumer<ConsoleEvent> listener) {
    Require.nonNull("Event handler", listener);

    consoleListeners.add(listener);

    initializeConsoleListeners();
  }

  public void addJavascriptExceptionListener(Consumer<JavascriptException> listener) {
    Require.nonNull("Listener", listener);

    exceptionListeners.add(listener);

    initializeConsoleListeners();
  }

  private void initializeConsoleListeners() {
    if (consoleListenersEnabled) {
      return;
    }

    devtools.send(enableRuntime());

    devtools.addListener(
      consoleEvent(),
      event -> {
        ConsoleEvent consoleEvent = toConsoleEvent(event);

        consoleListeners.forEach(l -> l.accept(consoleEvent));
      }
    );

    devtools.addListener(
      exceptionThrownEvent(),
      event -> {
        JavascriptException exception = toJsException(event);

        exceptionListeners.forEach(l -> l.accept(exception));
      }
    );

    consoleListenersEnabled = true;
  }

  public void disable() {
    devtools.send(disableRuntime());
    consoleListeners.clear();
    consoleListenersEnabled = false;
  }

  protected abstract Command<Void> enableRuntime();

  protected abstract Command<Void> disableRuntime();

  protected abstract Event<CONSOLEEVENT> consoleEvent();

  protected abstract Event<EXCEPTIONTHROWN> exceptionThrownEvent();

  protected abstract ConsoleEvent toConsoleEvent(CONSOLEEVENT event);

  protected abstract JavascriptException toJsException(EXCEPTIONTHROWN event);
}
