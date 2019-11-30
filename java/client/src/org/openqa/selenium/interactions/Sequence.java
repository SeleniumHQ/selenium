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

import java.time.Duration;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * A sequence of action objects for a given {@link InputSource} for use with the W3C
 * <a href="https://www.w3.org/TR/webdriver/#actions">Action commands</a>. In the spec, an action
 * is composed of a list of sequences, one per {@link InputSource}. Each of these is composed of
 * {@link Interaction}s, with the first item in each sequence being executed at the same time, then
 * the second, and so on, until all interactions in all sequences have been executed.
 */
public class Sequence implements Encodable {

  private final List<Encodable> actions = new LinkedList<>();
  private final InputSource device;

  public Sequence(InputSource device, int initialLength) {
    if (!(device instanceof Encodable)) {
      throw new IllegalArgumentException("Input device must implement Encodable: " + device);
    }

    this.device = device;

    for (int i = 0; i < initialLength; i++) {
      addAction(new Pause(device, Duration.ZERO));
    }
  }

  public Sequence addAction(Interaction action) {
    if (!action.isValidFor(device.getInputType())) {
      throw new IllegalArgumentException(String.format(
          "Interaction (%s) is for wrong kind of input device: %s ",
          action.getClass(),
          device));
    }
    if (!(action instanceof Encodable)) {
      throw new IllegalArgumentException("Interaction must implement Encodable: " + action);
    }


    actions.add((Encodable) action);

    return this;
  }

  @Override
  public Map<String, Object> encode() {
    Map<String, Object> toReturn = new HashMap<>(((Encodable) device).encode());

    List<Map<String, Object>> encodedActions = new LinkedList<>();
    for (Encodable action : actions) {
      Map<String, Object> encodedAction = new HashMap<>(action.encode());
      encodedActions.add(encodedAction);
    }
    toReturn.put("actions", encodedActions);

    return toReturn;
  }

  public Map<String, Object> toJson() {
    return encode();
  }

  int size() {
    return actions.size();
  }
}
