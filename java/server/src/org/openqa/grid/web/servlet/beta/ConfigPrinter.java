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

package org.openqa.grid.web.servlet.beta;

import com.google.common.collect.ImmutableSet;

import org.openqa.grid.common.RegistrationRequest;

import java.util.Set;
import java.util.concurrent.TimeUnit;

public class ConfigPrinter {

  private static final Set<String> CONFIG_KEYS_TO_BE_PRINTED_IN_SECONDS =
    ImmutableSet.of(RegistrationRequest.BROWSER_TIME_OUT,
                    RegistrationRequest.TIME_OUT);


  public static String printConfigValue(String configKey, Object configValue) {
    if (configValue == null) {
      return null;
    }

    return configKeyShouldBePrintedInSeconds(configKey)
           ? printSecondsFromMillis(Long.valueOf(String.valueOf(configValue)))
           : String.valueOf(configValue);
  }

  private static boolean configKeyShouldBePrintedInSeconds(String configKey) {
    return CONFIG_KEYS_TO_BE_PRINTED_IN_SECONDS.contains(configKey);
  }

  private static String printSecondsFromMillis(long millis) {
    return String.format("%ds", TimeUnit.MILLISECONDS.toSeconds(millis));
  }

}
