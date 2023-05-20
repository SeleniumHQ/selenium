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

import com.google.common.collect.ImmutableMap;
import java.util.Map;
import java.util.function.Predicate;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.AdditionalHttpCommands;
import org.openqa.selenium.remote.AugmenterProvider;
import org.openqa.selenium.remote.CommandInfo;
import org.openqa.selenium.remote.ExecuteMethod;

public abstract class AddHasCdp implements AugmenterProvider<HasCdp>, AdditionalHttpCommands {

  public static final String EXECUTE_CDP = "executeCdpCommand";

  @Override
  public abstract Map<String, CommandInfo> getAdditionalCommands();

  @Override
  public Predicate<Capabilities> isApplicable() {
    return caps -> IS_CHROMIUM_BROWSER.test(caps.getBrowserName());
  }

  @Override
  public Class<HasCdp> getDescribedInterface() {
    return HasCdp.class;
  }

  @Override
  public HasCdp getImplementation(Capabilities capabilities, ExecuteMethod executeMethod) {
    return new HasCdp() {
      @Override
      public Map<String, Object> executeCdpCommand(
          String commandName, Map<String, Object> parameters) {
        Require.nonNull("Command name", commandName);
        Require.nonNull("Parameters", parameters);

        Map<String, Object> toReturn =
            (Map<String, Object>)
                executeMethod.execute(
                    EXECUTE_CDP, ImmutableMap.of("cmd", commandName, "params", parameters));

        return ImmutableMap.copyOf(toReturn);
      }
    };
  }
}
