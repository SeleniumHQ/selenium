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
import org.openqa.selenium.OutputType;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.AdditionalHttpCommands;
import org.openqa.selenium.remote.AugmenterProvider;
import org.openqa.selenium.remote.CommandInfo;
import org.openqa.selenium.remote.ExecuteMethod;
import org.openqa.selenium.remote.http.HttpMethod;

@AutoService({AdditionalHttpCommands.class, AugmenterProvider.class})
public class AddHasFullPageScreenshot<X>
    implements AugmenterProvider<HasFullPageScreenshot>, AdditionalHttpCommands {

  public static final String FULL_PAGE_SCREENSHOT = "fullPageScreenshot";

  private static final Map<String, CommandInfo> COMMANDS =
      ImmutableMap.of(
          FULL_PAGE_SCREENSHOT,
          new CommandInfo("/session/:sessionId/moz/screenshot/full", HttpMethod.GET));

  @Override
  public Map<String, CommandInfo> getAdditionalCommands() {
    return COMMANDS;
  }

  @Override
  public Predicate<Capabilities> isApplicable() {
    return FIREFOX::is;
  }

  @Override
  public Class<HasFullPageScreenshot> getDescribedInterface() {
    return HasFullPageScreenshot.class;
  }

  @Override
  public HasFullPageScreenshot getImplementation(
      Capabilities capabilities, ExecuteMethod executeMethod) {
    return new HasFullPageScreenshot() {
      @Override
      public <X> X getFullPageScreenshotAs(OutputType<X> outputType) {
        Require.nonNull("Output Type", outputType);

        Object result = executeMethod.execute(FULL_PAGE_SCREENSHOT, null);

        if (result instanceof String) {
          String base64EncodedPng = (String) result;
          return outputType.convertFromBase64Png(base64EncodedPng);
        } else if (result instanceof byte[]) {
          return outputType.convertFromPngBytes((byte[]) result);
        } else {
          throw new RuntimeException(
              String.format(
                  "Unexpected result for %s command: %s",
                  FULL_PAGE_SCREENSHOT,
                  result == null ? "null" : result.getClass().getName() + " instance"));
        }
      }
    };
  }
}
