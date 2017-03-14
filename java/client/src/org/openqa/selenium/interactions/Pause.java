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
import java.util.Map;

/**
 * Indicates that a given {@link InputSource} should pause for a given duration.
 */
public class Pause extends Interaction implements Encodable {

  private final Duration duration;

  /**
   * @param duration If 0, this means "wait until all other actions in the tick have been
   *   evaluated". Must be greater than 0.
   */
  // TODO(simons): Reduce visibility?
  public Pause(InputSource device, Duration duration) {
    super(device);

    if (duration.isNegative()) {
      throw new IllegalStateException("Duration must be set to 0 or more: " + duration);
    }
    this.duration = duration;
  }

  @Override
  protected boolean isValidFor(SourceType sourceType) {
    return true;
  }

  @Override
  public Map<String, Object> encode() {
    Map<String, Object> toReturn = new HashMap<>();

    toReturn.put("type", "pause");
    toReturn.put("duration", duration.toMillis());

    return toReturn;
  }
}
