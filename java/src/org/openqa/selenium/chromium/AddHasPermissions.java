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

import static org.openqa.selenium.chromium.ChromiumDriver.IS_CHROMIUM_BROWSER;

import com.google.auto.service.AutoService;
import com.google.common.collect.ImmutableMap;
import java.util.Map;
import java.util.function.Predicate;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.AdditionalHttpCommands;
import org.openqa.selenium.remote.AugmenterProvider;
import org.openqa.selenium.remote.CommandInfo;
import org.openqa.selenium.remote.ExecuteMethod;
import org.openqa.selenium.remote.http.HttpMethod;

@AutoService({AdditionalHttpCommands.class, AugmenterProvider.class})
public class AddHasPermissions
    implements AugmenterProvider<HasPermissions>, AdditionalHttpCommands {

  public static final String SET_PERMISSION = "setPermission";

  private static final Map<String, CommandInfo> COMMANDS =
      ImmutableMap.of(
          SET_PERMISSION, new CommandInfo("/session/:sessionId/permissions", HttpMethod.POST));

  @Override
  public Map<String, CommandInfo> getAdditionalCommands() {
    return COMMANDS;
  }

  @Override
  public Predicate<Capabilities> isApplicable() {
    return caps -> IS_CHROMIUM_BROWSER.test(caps.getBrowserName());
  }

  @Override
  public Class<HasPermissions> getDescribedInterface() {
    return HasPermissions.class;
  }

  @Override
  public HasPermissions getImplementation(Capabilities capabilities, ExecuteMethod executeMethod) {
    return new HasPermissions() {
      @Override
      public void setPermission(String name, String value) {
        Require.nonNull("Permission name", name);
        Require.nonNull("Permission value", value);

        executeMethod.execute(
            SET_PERMISSION,
            ImmutableMap.of("descriptor", ImmutableMap.of("name", name), "state", value));
      }
    };
  }
}
