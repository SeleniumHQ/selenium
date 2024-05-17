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

package org.openqa.selenium.bidi.script;

import static java.util.Collections.unmodifiableMap;
import static org.openqa.selenium.bidi.script.RemoteReference.Type.HANDLE;
import static org.openqa.selenium.bidi.script.RemoteReference.Type.SHARED_ID;

import java.util.Map;
import java.util.TreeMap;

public class RemoteReference extends LocalValue {
  public enum Type {
    HANDLE("handle"),
    SHARED_ID("sharedId");

    private final String type;

    Type(String type) {
      this.type = type;
    }

    @Override
    public String toString() {
      return type;
    }
  }

  private String handle;
  private String sharedId;

  public RemoteReference(String handle, String sharedId) {
    this.handle = handle;
    this.sharedId = sharedId;
  }

  public RemoteReference(Type type, String value) {
    if (HANDLE.equals(type)) {
      this.handle = value;
    } else {
      this.sharedId = value;
    }
  }

  @Override
  public Map<String, Object> toJson() {
    Map<String, String> toReturn = new TreeMap<>();
    if (handle != null) {
      toReturn.put(HANDLE.toString(), this.handle);
    }

    if (sharedId != null) {
      toReturn.put(SHARED_ID.toString(), this.sharedId);
    }

    return unmodifiableMap(toReturn);
  }
}
