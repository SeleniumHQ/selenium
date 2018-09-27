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

package org.openqa.selenium.logging.profiler;

public class HttpProfilerLogEntry extends ProfilerLogEntry {

  public HttpProfilerLogEntry(String commandName, boolean isStart) {
    super(EventType.HTTP_COMMAND, constructMessage(EventType.HTTP_COMMAND, commandName, isStart));
  }

  private static String constructMessage(EventType eventType, String commandName, boolean isStart) {
    // We're going to make the assumption that command name is a simple string which doesn't need
    // escaping.
    return String.format(
        "{\"event\": \"%s\", \"command\": \"%s\", \"startorend\": \"%s\"}",
        eventType.toString(),
        commandName,
        isStart ? "start" : "end");
  }
}
