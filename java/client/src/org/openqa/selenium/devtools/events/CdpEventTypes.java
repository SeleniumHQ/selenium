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

package org.openqa.selenium.devtools.events;

import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.HasDevTools;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.logging.EventType;
import org.openqa.selenium.logging.HasLogEvents;

import java.util.function.Consumer;

public class CdpEventTypes {

  private CdpEventTypes() {
    // Utility class.
  }

  public static EventType<ConsoleEvent> consoleEvent(Consumer<ConsoleEvent> handler) {
    Require.nonNull("Handler", handler);

    return new EventType<ConsoleEvent>() {
      public void consume(ConsoleEvent event) {
        handler.accept(event);
      }

      @Override
      public void initializeLogger(HasLogEvents loggable) {
        Require.precondition(loggable instanceof HasDevTools, "Loggable must implement HasDevTools");

        DevTools tools = ((HasDevTools) loggable).getDevTools();
        tools.createSession();

        tools.send(tools.getDomains().runtime().enable());
        tools.addListener(
          tools.getDomains().runtime().consoleAPICalled(),
          event -> {
            consume(new ConsoleEvent(event.getType(), event.getTimestamp(), event.getArgs()));
          });
      }
    };
  }

}
