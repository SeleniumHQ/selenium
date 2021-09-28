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

import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.remote.CommandInfo;
import org.openqa.selenium.remote.service.DriverCommandExecutor;
import org.openqa.selenium.remote.service.DriverService;

import java.util.Map;

/**
 * {@link DriverCommandExecutor} that understands ChromiumDriver specific commands.
 *
 * @see <a href="https://chromium.googlesource.com/chromium/src/+/master/chrome/test/chromedriver/client/command_executor.py">List of ChromeWebdriver commands</a>
 */
public class ChromiumDriverCommandExecutor extends DriverCommandExecutor {

  public ChromiumDriverCommandExecutor(DriverService service, Map<String, CommandInfo> extraCommands) {
    super(service, getExtraCommands(extraCommands));
  }

  private static Map<String, CommandInfo> getExtraCommands(Map<String, CommandInfo> commands) {
    return ImmutableMap.<String, CommandInfo>builder()
      .putAll(commands)
      .putAll(new AddHasNetworkConditions().getAdditionalCommands())
      .putAll(new AddHasPermissions().getAdditionalCommands())
      .putAll(new AddHasLaunchApp().getAdditionalCommands())
      .build();
  }
}
