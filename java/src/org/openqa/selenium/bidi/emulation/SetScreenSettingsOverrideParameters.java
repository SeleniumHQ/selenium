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

package org.openqa.selenium.bidi.emulation;

import java.util.List;
import java.util.Map;

public class SetScreenSettingsOverrideParameters extends AbstractOverrideParameters {
  int height, width;

  public SetScreenSettingsOverrideParameters(Map<String, Integer> screenArea) {
    if (screenArea == null) {
      map.put("screenArea", null);
    } else if (!screenArea.containsKey("height") || !screenArea.containsKey("width")) {
      throw new IllegalArgumentException("screenArea must contain both 'height' and 'width' keys");
    } else {
      this.height = screenArea.get("height");
      this.width = screenArea.get("width");
      map.put("screenArea", screenArea);
    }
  }

  public int getHeight() {
    return height;
  }

  public int getWidth() {
    return width;
  }

  @Override
  public SetScreenSettingsOverrideParameters contexts(List<String> contexts) {
    super.contexts(contexts);
    return this;
  }

  @Override
  public SetScreenSettingsOverrideParameters userContexts(List<String> userContexts) {
    super.userContexts(userContexts);
    return this;
  }
}
