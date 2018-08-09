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

package org.openqa.selenium.grid.server;

import com.beust.jcommander.Parameter;

import org.openqa.selenium.grid.config.Config;

import java.util.Optional;

public class BaseServerConfig implements Config {

  @Parameter(description = "Port to listen on", names = {"-p", "--port"})
  private int port = 0;

  @Parameter(description = "Maximum number of listener threads", names = "--max-threads")
  private int maxThreads = Runtime.getRuntime().availableProcessors() * 3;

  @Override
  public Optional<String> get(String section, String option) {
    switch (section) {
      case "server":
        switch (option) {
          case "max-threads":
            return Optional.of(String.valueOf(maxThreads));

          case "port":
            return Optional.of(String.valueOf(port));
        }
        break;
    }

    return Optional.empty();
  }
}
