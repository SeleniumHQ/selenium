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

package org.openqa.selenium.chromium;

import java.util.List;
import java.util.Map;
import org.openqa.selenium.Beta;

/** Used by classes to indicate that they can cast devices to available sink targets. */
@Beta
public interface HasCasting {

  /**
   * Returns the list of cast sinks (Cast devices) available to the Chrome media router.
   *
   * @return array of ID / Name pairs of available cast sink targets
   */
  List<Map<String, String>> getCastSinks();

  /**
   * Selects a cast sink (Cast device) as the recipient of media router intents (connect or play).
   *
   * @param deviceName name of the target device.
   */
  void selectCastSink(String deviceName);

  /**
   * Initiates desktop mirroring for the current browser tab on the specified device.
   *
   * @param deviceName name of the target device.
   */
  void startDesktopMirroring(String deviceName);

  /**
   * Initiates tab mirroring for the current browser tab on the specified device.
   *
   * @param deviceName name of the target device.
   */
  void startTabMirroring(String deviceName);

  /**
   * @return an error message if there is any issue in a Cast session.
   */
  String getCastIssueMessage();

  /**
   * Stops casting from media router to the specified device, if connected.
   *
   * @param deviceName name of the target device.
   */
  void stopCasting(String deviceName);
}
