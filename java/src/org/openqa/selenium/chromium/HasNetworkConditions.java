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

import org.openqa.selenium.Beta;

/** Used by classes to indicate that they can simulate different network conditions. */
@Beta
public interface HasNetworkConditions {

  /**
   * Gets map of network conditions. These have to be set before they can be retrieved.
   *
   * @return the current network condition values.
   */
  ChromiumNetworkConditions getNetworkConditions();

  /**
   * Set network limitations
   *
   * @param networkConditions object containing valid network condition settings.
   */
  void setNetworkConditions(ChromiumNetworkConditions networkConditions);

  /** Resets the network conditions to the default settings. */
  void deleteNetworkConditions();
}
