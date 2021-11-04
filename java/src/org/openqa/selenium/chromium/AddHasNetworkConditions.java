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

import java.time.Duration;
import java.util.Map;
import java.util.function.Predicate;

import static org.openqa.selenium.chromium.ChromiumDriver.IS_CHROMIUM_BROWSER;

@AutoService({AdditionalHttpCommands.class, AugmenterProvider.class})
public class AddHasNetworkConditions implements AugmenterProvider<HasNetworkConditions>, AdditionalHttpCommands {

  public static final String GET_NETWORK_CONDITIONS = "getNetworkConditions";
  public static final String SET_NETWORK_CONDITIONS = "setNetworkConditions";
  public static final String DELETE_NETWORK_CONDITIONS = "deleteNetworkConditions";


  private static final Map<String, CommandInfo> COMMANDS = ImmutableMap.of(
    GET_NETWORK_CONDITIONS, new CommandInfo("/session/:sessionId/chromium/network_conditions", HttpMethod.GET),
    SET_NETWORK_CONDITIONS, new CommandInfo("/session/:sessionId/chromium/network_conditions", HttpMethod.POST),
    DELETE_NETWORK_CONDITIONS, new CommandInfo("/session/:sessionId/chromium/network_conditions", HttpMethod.DELETE));

  @Override
  public Map<String, CommandInfo> getAdditionalCommands() {
    return COMMANDS;
  }

  @Override
  public Predicate<Capabilities> isApplicable() {
    return caps -> IS_CHROMIUM_BROWSER.test(caps.getBrowserName());
  }

  @Override
  public Class<HasNetworkConditions> getDescribedInterface() {
    return HasNetworkConditions.class;
  }

  @Override
  public HasNetworkConditions getImplementation(Capabilities capabilities, ExecuteMethod executeMethod) {
    return new HasNetworkConditions() {
      @Override
      public ChromiumNetworkConditions getNetworkConditions() {
        @SuppressWarnings("unchecked")
        Map<String, Object> result = (Map<String, Object>) executeMethod.execute(GET_NETWORK_CONDITIONS, null);
        ChromiumNetworkConditions networkConditions = new ChromiumNetworkConditions();
        networkConditions.setOffline((Boolean) result.getOrDefault(ChromiumNetworkConditions.OFFLINE, false));
        networkConditions.setLatency(Duration.ofMillis((Long) result.getOrDefault(ChromiumNetworkConditions.LATENCY, 0)));
        networkConditions.setDownloadThroughput(((Number) result.getOrDefault(ChromiumNetworkConditions.DOWNLOAD_THROUGHPUT, -1)).intValue());
        networkConditions.setDownloadThroughput(((Number) result.getOrDefault(ChromiumNetworkConditions.UPLOAD_THROUGHPUT, -1)).intValue());
        return networkConditions;
      }

      @Override
      public void setNetworkConditions(ChromiumNetworkConditions networkConditions) {
        Require.nonNull("Network Conditions", networkConditions);

        Map<String, Object> conditions = ImmutableMap.of(ChromiumNetworkConditions.OFFLINE, networkConditions.getOffline(),
          ChromiumNetworkConditions.LATENCY, networkConditions.getLatency().toMillis(),
          ChromiumNetworkConditions.DOWNLOAD_THROUGHPUT, networkConditions.getDownloadThroughput(),
          ChromiumNetworkConditions.UPLOAD_THROUGHPUT, networkConditions.getUploadThroughput());
        executeMethod.execute(SET_NETWORK_CONDITIONS, ImmutableMap.of("network_conditions", conditions));
      }

      @Override
      public void deleteNetworkConditions() {
        executeMethod.execute(DELETE_NETWORK_CONDITIONS, null);
      }
    };
  }
}
