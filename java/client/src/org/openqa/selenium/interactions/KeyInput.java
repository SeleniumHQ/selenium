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

package org.openqa.selenium.interactions;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Models a <a href="https://www.w3.org/TR/webdriver/#dfn-key-input-source">key input source</a>.
 */
public class KeyInput implements InputSource, Encodable {

  private final String name;

  public KeyInput(String name) {
    this.name = Optional.ofNullable(name).orElse(UUID.randomUUID().toString());
  }

  @Override
  public SourceType getInputType() {
    return SourceType.KEY;
  }

  public Interaction createKeyDown(int codePoint) {
    return new TypingInteraction(this, "keyDown", codePoint);
  }

  public Interaction createKeyUp(int codePoint) {
    return new TypingInteraction(this, "keyUp", codePoint);
  }

  @Override
  public Map<String, Object> encode() {
    Map<String, Object> toReturn = new HashMap<>();

    toReturn.put("type", "key");
    toReturn.put("id", name);

    return toReturn;
  }

  private static class TypingInteraction extends Interaction implements Encodable {

    private final String type;
    private final String value;

    TypingInteraction(InputSource source, String type, int codePoint) {
      super(source);

      this.type = type;
      this.value = new StringBuilder().appendCodePoint(codePoint).toString();
    }

    @Override
    public Map<String, Object> encode() {
      HashMap<String, Object> toReturn = new HashMap<>();

      toReturn.put("type", type);
      toReturn.put("value", value);

      return toReturn;
    }
  }
}
