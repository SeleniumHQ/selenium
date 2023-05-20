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

package org.openqa.selenium.firefox;

import static org.openqa.selenium.remote.Browser.FIREFOX;

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
public class AddHasContext implements AugmenterProvider<HasContext>, AdditionalHttpCommands {

  public static final String SET_CONTEXT = "setContext";
  public static final String GET_CONTEXT = "getContext";

  private static final Map<String, CommandInfo> COMMANDS =
      ImmutableMap.of(
          SET_CONTEXT, new CommandInfo("/session/:sessionId/moz/context", HttpMethod.POST),
          GET_CONTEXT, new CommandInfo("/session/:sessionId/moz/context", HttpMethod.GET));

  @Override
  public Map<String, CommandInfo> getAdditionalCommands() {
    return COMMANDS;
  }

  @Override
  public Predicate<Capabilities> isApplicable() {
    return FIREFOX::is;
  }

  @Override
  public Class<HasContext> getDescribedInterface() {
    return HasContext.class;
  }

  @Override
  public HasContext getImplementation(Capabilities capabilities, ExecuteMethod executeMethod) {
    return new HasContext() {
      @Override
      public void setContext(FirefoxCommandContext context) {
        Require.nonNull("Firefox Command Context", context);

        executeMethod.execute(SET_CONTEXT, ImmutableMap.of("context", context));
      }

      @Override
      public FirefoxCommandContext getContext() {
        String context = (String) executeMethod.execute(GET_CONTEXT, null);

        return FirefoxCommandContext.fromString(context);
      }
    };
  }
}
