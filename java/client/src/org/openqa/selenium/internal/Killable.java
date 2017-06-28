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
package org.openqa.selenium.internal;

/**
 * Implemented by WebDriver implementations that support hard kill by
 * killing the process at the OS level. This is interface is a last-ditch
 * mechanism used by selenium-server and other servers trying to maintain
 * a consistent runtime environment when facing hanging processes.
 *
 * @deprecated Nothing implements this interface, and it will be removed
 */
@Deprecated
public interface Killable {

  /**
   * Attempt to forcibly kill this Killable at the OS level. Call when all hope is lost.
   */
  void kill();
}
