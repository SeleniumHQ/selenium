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

package org.openqa.selenium.remote.locators;

import org.openqa.selenium.By;

/**
 * Allows servers to add additional locator strategies to the Selenium
 * Server. This takes the JSON payload of the Find Element command
 * (essentially {@code {"using": "locator-name", "value": "arguments"}})
 * and calls it in the context of the server.
 */
public interface CustomLocator {

  /**
   * @return The locator name, which is the value of the {@code using}
   *   property of the JSON payload.
   */
  String getLocatorName();

  By createBy(Object usingParameter);
}
