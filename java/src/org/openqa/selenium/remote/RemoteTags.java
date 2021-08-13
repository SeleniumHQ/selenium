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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.EventAttribute;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.Span;

import java.util.Map;
import java.util.function.BiConsumer;

public class RemoteTags {

  private static final Json JSON = new Json();

  private RemoteTags() {
    // Utility class
  }

  public static final BiConsumer<Span, Capabilities> CAPABILITIES =
    (span, caps) ->
      span.setAttribute(AttributeKey.SESSION_CAPABILITIES.getKey(), convertCapsToJsonString(caps));

  public static final BiConsumer<Span, SessionId> SESSION_ID = (span, id) ->
      span.setAttribute(AttributeKey.SESSION_ID.getKey(), String.valueOf(id));

  public static final BiConsumer<Map<String, EventAttributeValue>, Capabilities>
    CAPABILITIES_EVENT =
    (map, caps) ->
      map.put(AttributeKey.SESSION_CAPABILITIES.getKey(),
      EventAttribute.setValue(convertCapsToJsonString(caps)));

  public static final BiConsumer<Map<String, EventAttributeValue>, SessionId>
      SESSION_ID_EVENT =
      (map, id) ->
          map.put(AttributeKey.SESSION_ID.getKey(), EventAttribute.setValue(String.valueOf(id)));

  private static String convertCapsToJsonString(Capabilities capabilities) {
    StringBuilder text = new StringBuilder();
    try (JsonOutput json = JSON.newOutput(text).setPrettyPrint(false)) {
      json.write(capabilities);
      text.append('\n');
    }
    return text.toString();
  }
}
