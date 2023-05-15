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
import java.util.Map;
import java.util.Objects;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Tracer;

public class TracedCommandExecutor implements CommandExecutor {

  private final CommandExecutor delegate;
  private final Tracer tracer;

  public TracedCommandExecutor(CommandExecutor delegate, Tracer tracer) {
    this.delegate = delegate;
    this.tracer = tracer;
  }

  @Override
  public Response execute(Command command) throws IOException {
    try (Span commandSpan = tracer.getCurrentContext().createSpan("command")) {
      SessionId sessionId = command.getSessionId();
      if (sessionId != null) {
        commandSpan.setAttribute("sessionId", sessionId.toString());
      }
      commandSpan.setAttribute("command", command.getName());
      Map<String, ?> parameters = command.getParameters();
      if (parameters != null && parameters.size() > 0) {
        for (Map.Entry<String, ?> parameter : parameters.entrySet()) {
          commandSpan.setAttribute(
              "parameter." + parameter.getKey(), Objects.toString(parameter.getValue(), "null"));
        }
      }
      return delegate.execute(command);
    }
  }
}
