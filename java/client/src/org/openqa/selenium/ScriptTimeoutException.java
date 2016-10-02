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


package org.openqa.selenium;

/**
 * Thrown when an async execute script command does not complete in enough time.
 */
public class ScriptTimeoutException extends WebDriverException {

  public ScriptTimeoutException() {
  }

  public ScriptTimeoutException(String message) {
    super(message);
  }

  public ScriptTimeoutException(Throwable cause) {
    super(cause);
  }

  public ScriptTimeoutException(String message, Throwable cause) {
    super(message, cause);
  }
}
