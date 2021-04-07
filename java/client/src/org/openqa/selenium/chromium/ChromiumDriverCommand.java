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

/**
 * Constants for the ChromiumDriver specific command IDs.
 */
final class ChromiumDriverCommand {
  private ChromiumDriverCommand() {}

  static final String LAUNCH_APP = "launchApp";
  static final String GET_NETWORK_CONDITIONS = "getNetworkConditions";
  static final String SET_NETWORK_CONDITIONS = "setNetworkConditions";
  static final String DELETE_NETWORK_CONDITIONS = "deleteNetworkConditions";
  static final String EXECUTE_CDP_COMMAND = "executeCdpCommand";

  // Cast Media Router APIs
  static final String GET_CAST_SINKS = "getCastSinks";
  static final String SET_CAST_SINK_TO_USE = "selectCastSink";
  static final String START_CAST_TAB_MIRRORING = "startCastTabMirroring";
  static final String GET_CAST_ISSUE_MESSAGE = "getCastIssueMessage";  
  static final String STOP_CASTING = "stopCasting";

  static final String SET_PERMISSION = "setPermission";
}
