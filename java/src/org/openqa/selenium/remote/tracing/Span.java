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

package org.openqa.selenium.remote.tracing;

import java.util.Map;

public interface Span extends AutoCloseable, TraceContext {

  Span setName(String name);

  Span setAttribute(String key, boolean value);

  Span setAttribute(String key, Number value);

  Span setAttribute(String key, String value);

  Span addEvent(String name);

  Span addEvent(String name, Map<String, EventAttributeValue> attributeMap);

  Span setStatus(Status status);

  @Override
  void close();

  enum Kind {
    CLIENT("client"),
    SERVER("server"),

    PRODUCER("producer"),
    CONSUMER("consumer"),
    ;

    // The nice name is the name expected in an OT trace.
    private final String niceName;

    Kind(String niceName) {
      this.niceName = niceName;
    }

    @Override
    public String toString() {
      return niceName;
    }
  }
}
