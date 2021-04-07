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

import org.openqa.selenium.WebDriverException;

/**
 * Indicates that the coordinates provided to an interactions operation are invalid. This, most
 * likely, means that a move operation was provided with invalid coordinates or that an action that
 * depends on mouse position (like click) was not preceded by a move operation.
 */
public class InvalidCoordinatesException extends WebDriverException {

  public InvalidCoordinatesException(String message) {
    super(message);
  }
}
