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

import com.google.auto.service.AutoService;
import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.AdditionalHttpCommands;
import org.openqa.selenium.remote.AugmenterProvider;
import org.openqa.selenium.remote.CommandInfo;
import org.openqa.selenium.remote.ExecuteMethod;
import org.openqa.selenium.remote.http.HttpMethod;

import java.util.Map;
import java.util.function.Predicate;

import static org.openqa.selenium.chromium.ChromiumDriver.IS_CHROMIUM_BROWSER;

@AutoService({AdditionalHttpCommands.class, AugmenterProvider.class})
public class AddHasLaunchApp implements AugmenterProvider<HasLaunchApp>, AdditionalHttpCommands {

  public static final String LAUNCH_APP = "launchApp";

  private static final Map<String, CommandInfo> COMMANDS = ImmutableMap.of(
    LAUNCH_APP, new CommandInfo("/session/:sessionId/chromium/launch_app", HttpMethod.POST));

  @Override
  public Map<String, CommandInfo> getAdditionalCommands() {
    return COMMANDS;
  }

  @Override
  public Predicate<Capabilities> isApplicable() {
    return caps -> IS_CHROMIUM_BROWSER.test(caps.getBrowserName());
  }

  @Override
  public Class<HasLaunchApp> getDescribedInterface() {
    return HasLaunchApp.class;
  }

  @Override
  public HasLaunchApp getImplementation(Capabilities capabilities, ExecuteMethod executeMethod) {
    return new HasLaunchApp() {
      @Override
      public void launchApp(String id) {
        Require.nonNull("id of Chromium App", id);

        executeMethod.execute(LAUNCH_APP, ImmutableMap.of("id", id));
      }
    };
  }
}
