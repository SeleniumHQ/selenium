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

package org.openqa.selenium.json;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Shared "log, don't silently drop" behavior for a JSON object carrying a key the receiving Java
 * type doesn't declare. {@link ConstructorCoercer} calls this for any type annotated {@link
 * WarnOnUnknownFields}; a generated type with a custom deserializer that bypasses
 * ConstructorCoercer entirely (e.g. one with a reserved-word field — see BiDiGenerator's
 * appendFromJson) calls it directly, so both paths report the same way instead of one of them
 * silently dropping unrecognized keys.
 */
public final class UnknownFieldsWarning {

  private static final Logger LOG = Logger.getLogger(UnknownFieldsWarning.class.getName());

  // A payload with many undeclared keys must not turn into one log record per key — that is
  // log-amplification the caller controls the size of. One summary record, capped at the first
  // few keys plus a total count, keeps the cost bounded regardless of how many keys arrive.
  private static final int MAX_LOGGED_UNKNOWN_KEYS = 10;

  // A JSON property name is attacker-controlled input, so it is never logged verbatim: a raw
  // \r or \n could forge what looks like a separate log line, and an unbounded key could blow up
  // log storage. Escaping control characters and capping length neutralizes both.
  private static final int MAX_LOGGED_KEY_LENGTH = 200;

  private UnknownFieldsWarning() {
    throw new IllegalStateException("Utility class");
  }

  /**
   * Logs a bounded, sanitized warning if {@code received} carries any key absent from {@code
   * knownKeys}. Gated on {@code isLoggable} so a disabled WARNING level skips even scanning for
   * unknown keys, not just building the message — that scan scales with an attacker-controlled
   * payload size.
   *
   * @param declaringClass the type the caller is deserializing into, named in the log message
   * @param knownKeys every key {@code declaringClass} actually declares
   * @param received the raw JSON object being deserialized
   */
  public static void warnOnUnknownFields(
      Class<?> declaringClass, Set<String> knownKeys, Map<String, ?> received) {
    if (!LOG.isLoggable(Level.WARNING)) {
      return;
    }

    int unknownCount = 0;
    List<String> sampleKeys = new ArrayList<>(MAX_LOGGED_UNKNOWN_KEYS);
    for (String key : received.keySet()) {
      if (!knownKeys.contains(key)) {
        unknownCount++;
        if (sampleKeys.size() < MAX_LOGGED_UNKNOWN_KEYS) {
          sampleKeys.add(key);
        }
      }
    }
    if (unknownCount > 0) {
      LOG.warning(describeUnknownFields(declaringClass, unknownCount, sampleKeys));
    }
  }

  // sampleKeys holds at most MAX_LOGGED_UNKNOWN_KEYS entries — the caller stops appending once
  // it hits that cap, so this never buffers more than it will ever print. unknownCount is the
  // true total, tracked separately so a capped sample never has to lie about how many there were.
  private static String describeUnknownFields(
      Class<?> declaringClass, int unknownCount, List<String> sampleKeys) {
    StringBuilder message =
        new StringBuilder(declaringClass.getSimpleName())
            .append(": dropped ")
            .append(unknownCount)
            .append(" undeclared field")
            .append(unknownCount == 1 ? "" : "s")
            .append(": [");
    for (int i = 0; i < sampleKeys.size(); i++) {
      if (i > 0) {
        message.append(", ");
      }
      message.append(sanitizeForLog(sampleKeys.get(i)));
    }
    if (unknownCount > sampleKeys.size()) {
      message.append(", ...");
    }
    return message.append("]").toString();
  }

  private static String sanitizeForLog(String value) {
    String truncated =
        value.length() > MAX_LOGGED_KEY_LENGTH
            ? value.substring(0, MAX_LOGGED_KEY_LENGTH) + "...(truncated)"
            : value;
    StringBuilder sanitized = new StringBuilder(truncated.length());
    for (int i = 0; i < truncated.length(); i++) {
      char c = truncated.charAt(i);
      switch (c) {
        case '\n':
          sanitized.append("\\n");
          break;
        case '\r':
          sanitized.append("\\r");
          break;
        case '\t':
          sanitized.append("\\t");
          break;
        default:
          if (c < 0x20 || c == 0x7f) {
            sanitized.append(String.format("\\u%04x", (int) c));
          } else {
            sanitized.append(c);
          }
      }
    }
    return sanitized.toString();
  }
}
