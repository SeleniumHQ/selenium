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

import java.util.Map;

/**
 * Used by classes to indicate that they can execute Command DevTools commands.
 */
@Beta
public interface HasCdp {

  /**
   * Execute a Chrome DevTools Protocol command and get returned result. The
   * command and command args should follow
   * <a href="https://chromedevtools.github.io/devtools-protocol/">chrome
   * devtools protocol domains/commands</a>.
   *
   * It is strongly encouraged to use {@link org.openqa.selenium.devtools.DevTools} API instead of this
   *
   * @param commandName the command to execute with Chrome Dev Tools.
   * @param parameters any information needed to execute the Dev Tools command.
   * @return the name and value of the response.
   */
  Map<String, Object> executeCdpCommand(String commandName, Map<String, Object> parameters);
}
