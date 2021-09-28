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

package org.openqa.selenium.safari;

import org.openqa.selenium.Beta;

import java.util.Map;

/**
 * Used by classes to indicate that they can take adjust permissions.
 */
@Beta
public interface HasPermissions {

  /**
   * Set permission on the browser.
   * The only supported permission at this time is "getUserMedia".
   *
   * @param permission the name of the item to set permission on.
   * @param value whether the permission has been granted.
   */
  void setPermissions(String permission, boolean value);

  /**
   *
   * @return each permission and whether it is allowed or not.
   */
  Map<String, Boolean> getPermissions();
}
