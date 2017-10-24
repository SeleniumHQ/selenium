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

package org.openqa.selenium.logging;

/**
 * Supported log types.
 */
public class LogType {

  /**
   * This log type pertains to logs from the browser.
   */
  public static final String BROWSER = "browser";

  /**
   * This log type pertains to logs from the client.
   */
  public static final String CLIENT = "client";

  /**
   * This log pertains to logs from the WebDriver implementation.
   */
  public static final String DRIVER = "driver";

  /**
   * This log type pertains to logs relating to performance timings.
   */
  public static final String PERFORMANCE = "performance";

  /**
   * This log type pertains to logs relating to performance timings.
   */
  public static final String PROFILER = "profiler";

  /**
   * This log type pertains to logs from the remote server.
   */
  public static final String SERVER = "server";

}
