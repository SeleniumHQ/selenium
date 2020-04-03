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
import java.util.HashMap;

import org.openqa.selenium.remote.CommandInfo;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.service.DriverCommandExecutor;
import org.openqa.selenium.remote.service.DriverService;

/**
 * {@link DriverCommandExecutor} that understands ChromiumDriver specific commands.
 *
 * @see <a href="https://chromium.googlesource.com/chromium/src/+/master/chrome/test/chromedriver/client/command_executor.py">List of ChromeWebdriver commands</a>
 */
public class ChromiumDriverCommandExecutor extends DriverCommandExecutor {

  private static ImmutableMap<String, CommandInfo> buildChromiumCommandMappings(String vendorPrefix) {
    HashMap<String, CommandInfo> mappings = new HashMap<String, CommandInfo>();

    mappings.put(ChromiumDriverCommand.LAUNCH_APP,
      new CommandInfo("/session/:sessionId/chromium/launch_app", HttpMethod.POST));
    mappings.put(ChromiumDriverCommand.GET_NETWORK_CONDITIONS,
      new CommandInfo("/session/:sessionId/chromium/network_conditions", HttpMethod.GET));
    mappings.put(ChromiumDriverCommand.SET_NETWORK_CONDITIONS,
      new CommandInfo("/session/:sessionId/chromium/network_conditions", HttpMethod.POST));
    mappings.put(ChromiumDriverCommand.DELETE_NETWORK_CONDITIONS,
      new CommandInfo("/session/:sessionId/chromium/network_conditions", HttpMethod.DELETE));
    mappings.put( ChromiumDriverCommand.EXECUTE_CDP_COMMAND,
      new CommandInfo("/session/:sessionId/" + vendorPrefix + "/cdp/execute", HttpMethod.POST));

    // Cast / Media Router APIs
    mappings.put(ChromiumDriverCommand.GET_CAST_SINKS,
      new CommandInfo("/session/:sessionId/" + vendorPrefix + "/cast/get_sinks", HttpMethod.GET));
    mappings.put(ChromiumDriverCommand.SET_CAST_SINK_TO_USE,
      new CommandInfo("/session/:sessionId/" + vendorPrefix + "/cast/set_sink_to_use", HttpMethod.POST));
    mappings.put(ChromiumDriverCommand.START_CAST_TAB_MIRRORING,
      new CommandInfo("/session/:sessionId/" + vendorPrefix + "/cast/start_tab_mirroring", HttpMethod.POST));
    mappings.put(ChromiumDriverCommand.GET_CAST_ISSUE_MESSAGE,
      new CommandInfo("/session/:sessionId/" + vendorPrefix + "/cast/get_issue_message", HttpMethod.GET));
    mappings.put(ChromiumDriverCommand.STOP_CASTING,
      new CommandInfo("/session/:sessionId/" + vendorPrefix + "/cast/stop_casting", HttpMethod.POST));

    mappings.put(ChromiumDriverCommand.SET_PERMISSION,
      new CommandInfo("/session/:sessionId/permissions", HttpMethod.POST));

    return ImmutableMap.copyOf(mappings);
  }

  public ChromiumDriverCommandExecutor(String vendorPrefix, DriverService service) {
    super(service, buildChromiumCommandMappings(vendorPrefix));
  }
}
