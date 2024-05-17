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
package org.openqa.selenium.bidi.browsingcontext;

import java.util.HashMap;
import java.util.Map;

public class ElementClipRectangle extends ClipRectangle {
  private final Map<String, Object> map = new HashMap<>();

  public ElementClipRectangle(String sharedId) {
    super(Type.ELEMENT);
    map.put("sharedId", sharedId);
  }

  public ElementClipRectangle(String sharedId, String handle) {
    super(Type.ELEMENT);
    map.put("sharedId", sharedId);
    map.put("handle", handle);
  }

  public Map<String, Object> toMap() {
    map.put("type", super.getType().toString());

    return map;
  }
}
