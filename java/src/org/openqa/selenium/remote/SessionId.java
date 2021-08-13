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

import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonException;

import java.io.Serializable;
import java.util.Map;
import java.util.UUID;

public class SessionId implements Serializable {

  private final String opaqueKey;

  public SessionId(UUID uuid) {
    this(Require.nonNull("Session ID key", uuid).toString());
  }

  public SessionId(String opaqueKey) {
    this.opaqueKey = Require.nonNull("Session ID key", opaqueKey);
  }

  @Override
  public String toString() {
    return opaqueKey;
  }

  @Override
  public int hashCode() {
    return opaqueKey.hashCode();
  }

  @Override
  public boolean equals(Object obj) {
    return obj instanceof SessionId && opaqueKey.equals(((SessionId) obj).opaqueKey);
  }

  private String toJson() {
    return opaqueKey;
  }

  private static SessionId fromJson(Object raw) {
    if (raw instanceof String) {
      return new SessionId(String.valueOf(raw));
    }

    if (raw instanceof Map) {
      Map<?, ?> map = (Map<?, ?>) raw;
      if (map.get("value") instanceof String) {
        return new SessionId(String.valueOf(map.get("value")));
      }
    }

    throw new JsonException("Unable to coerce session id from " + raw);
  }
}
