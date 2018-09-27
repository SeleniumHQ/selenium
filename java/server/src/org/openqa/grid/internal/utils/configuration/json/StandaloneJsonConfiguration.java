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

package org.openqa.grid.internal.utils.configuration.json;

import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

public class StandaloneJsonConfiguration extends CommonJsonConfiguration {

  private StandaloneJsonConfiguration() {}

  public static StandaloneJsonConfiguration loadFromJson(JsonInput source) {
    StandaloneJsonConfiguration config = fromJson(source, StandaloneJsonConfiguration.class);

    if (config.getRole() != null && !config.getRole().equals("standalone")) {
      throw new RuntimeException("Unable to load standalone configuration from " + source +
                                 " because it contains configuration for '" + config.getRole() + "' role");
    }

    return config;
  }

  public static StandaloneJsonConfiguration loadFromResourceOrFile(String source) {
    StandaloneJsonConfiguration config = fromResourceOrFile(source, StandaloneJsonConfiguration.class);

    if (config.getRole() != null && !config.getRole().equals("standalone")) {
      throw new RuntimeException("Unable to load standalone configuration from " + source +
                                 " because it contains configuration for '" + config.getRole() + "' role");
    }

    return config;
  }

}
