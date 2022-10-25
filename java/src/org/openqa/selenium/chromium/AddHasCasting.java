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
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.AdditionalHttpCommands;
import org.openqa.selenium.remote.AugmenterProvider;
import org.openqa.selenium.remote.CommandInfo;
import org.openqa.selenium.remote.ExecuteMethod;

import java.util.List;
import java.util.Map;
import java.util.function.Predicate;

public abstract class AddHasCasting implements AugmenterProvider<HasCasting>, AdditionalHttpCommands {

  public static final String GET_CAST_SINKS = "getCastSinks";
  public static final String SET_CAST_SINK_TO_USE = "selectCastSink";
  public static final String START_CAST_TAB_MIRRORING = "startCastTabMirroring";
  public static final String START_CAST_DESKTOP_MIRRORING = "startDesktopMirroring";
  public static final String GET_CAST_ISSUE_MESSAGE = "getCastIssueMessage";
  public static final String STOP_CASTING = "stopCasting";

  @Override
  public abstract Map<String, CommandInfo> getAdditionalCommands();

  @Override
  public abstract Predicate<Capabilities> isApplicable();

  @Override
  public Class<HasCasting> getDescribedInterface() {
    return HasCasting.class;
  }

  @Override
  public HasCasting getImplementation(Capabilities capabilities, ExecuteMethod executeMethod) {
    return new HasCasting() {
      @SuppressWarnings("unchecked")
      @Override
      public List<Map<String, String>> getCastSinks() {
        return (List<Map<String, String>>) executeMethod.execute(GET_CAST_SINKS, null);
      }

      @Override
      public void selectCastSink(String deviceName) {
        Require.nonNull("Device Name", deviceName);

        executeMethod.execute(SET_CAST_SINK_TO_USE, ImmutableMap.of("sinkName", deviceName));
      }

      @Override
      public void startDesktopMirroring(String deviceName) {
        Require.nonNull("Device Name", deviceName);

        executeMethod.execute(START_CAST_DESKTOP_MIRRORING, ImmutableMap.of("sinkName", deviceName));
      }

      @Override
      public void startTabMirroring(String deviceName) {
        Require.nonNull("Device Name", deviceName);

        executeMethod.execute(START_CAST_TAB_MIRRORING, ImmutableMap.of("sinkName", deviceName));
      }

      @Override
      public String getCastIssueMessage() {
        return executeMethod.execute(GET_CAST_ISSUE_MESSAGE, null).toString();
      }

      @Override
      public void stopCasting(String deviceName) {
        Require.nonNull("Device Name", deviceName);

        executeMethod.execute(STOP_CASTING, ImmutableMap.of("sinkName", deviceName));
      }
    };
  }
}
