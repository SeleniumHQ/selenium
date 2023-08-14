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

package org.openqa.selenium.devtools.v116;

import com.google.common.collect.ImmutableList;
import org.openqa.selenium.JavascriptException;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.events.ConsoleEvent;
import org.openqa.selenium.devtools.idealized.Events;
import org.openqa.selenium.devtools.idealized.runtime.model.RemoteObject;
import org.openqa.selenium.devtools.v116.runtime.Runtime;
import org.openqa.selenium.devtools.v116.runtime.model.ConsoleAPICalled;
import org.openqa.selenium.devtools.v116.runtime.model.ExceptionDetails;
import org.openqa.selenium.devtools.v116.runtime.model.ExceptionThrown;
import org.openqa.selenium.devtools.v116.runtime.model.StackTrace;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public class v116Events extends Events<ConsoleAPICalled, ExceptionThrown> {

  public v116Events(DevTools devtools) {
    super(devtools);
  }

  @Override
  protected Command<Void> enableRuntime() {
    return Runtime.enable();
  }

  @Override
  protected Command<Void> disableRuntime() {
    return Runtime.disable();
  }

  @Override
  protected Event<ConsoleAPICalled> consoleEvent() {
    return Runtime.consoleAPICalled();
  }

  @Override
  protected Event<ExceptionThrown> exceptionThrownEvent() {
    return Runtime.exceptionThrown();
  }

  @Override
  protected ConsoleEvent toConsoleEvent(ConsoleAPICalled event) {
    long ts = event.getTimestamp().toJson().longValue();

    List<Object> modifiedArgs =
        event.getArgs().stream()
            .map(obj -> new RemoteObject(obj.getType().toString(), obj.getValue().orElse(null)))
            .collect(ImmutableList.toImmutableList());

    return new ConsoleEvent(
        event.getType().toString(), Instant.ofEpochMilli(ts), modifiedArgs, event.getArgs());
  }

  @Override
  protected JavascriptException toJsException(ExceptionThrown event) {
    ExceptionDetails details = event.getExceptionDetails();
    Optional<StackTrace> maybeTrace = details.getStackTrace();
    Optional<org.openqa.selenium.devtools.v116.runtime.model.RemoteObject> maybeException =
        details.getException();

    String message =
        maybeException
            .flatMap(obj -> obj.getDescription().map(String::toString))
            .orElseGet(details::getText);

    JavascriptException exception = new JavascriptException(message);

    if (!maybeTrace.isPresent()) {
      StackTraceElement element =
          new StackTraceElement(
              "unknown", "unknown", details.getUrl().orElse("unknown"), details.getLineNumber());
      exception.setStackTrace(new StackTraceElement[] {element});
      return exception;
    }

    StackTrace trace = maybeTrace.get();

    exception.setStackTrace(
        trace.getCallFrames().stream()
            .map(
                frame ->
                    new StackTraceElement(
                        "", frame.getFunctionName(), frame.getUrl(), frame.getLineNumber()))
            .toArray(StackTraceElement[]::new));

    return exception;
  }
}
