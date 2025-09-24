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


package org.openqa.selenium.grid.node.config;

import static java.util.Collections.singleton;
import static org.assertj.core.api.Assertions.assertThat;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.node.SessionFactory;

class NodeOptionsDetectDriversFalseTest {

  @Test
  void testS24_UnlimitedMaxSessionsWithOverride() {
    String[] rawConfig =
        new String[] {
          "[node]",
          "max-sessions = 4",
          "override-max-sessions = true",
          "detect-drivers = false",
          "",
          "[[node.driver-configuration]]",
          "display-name = \"chrome\"",
          "stereotype = '{\"browserName\":\"chrome\"}'",
          "",
          "[[node.driver-configuration]]",
          "display-name = \"MicrosoftEdge\"",
          "stereotype = '{\"browserName\":\"MicrosoftEdge\"}'",
          "max-sessions = 3",
          "",
          "[[node.driver-configuration]]",
          "display-name = \"firefox\"",
          "stereotype = '{\"browserName\":\"firefox\"}'",
          "max-sessions = 5"
        };

    Config config = new TomlConfig(new StringReader(String.join("\n", rawConfig)));
    List<Capabilities> reported = new ArrayList<>();

    new NodeOptions(config)
        .getSessionFactories(
            caps -> {
              reported.add(caps);
              return singleton(HelperFactory.create(config, caps));
            });

    long chromeCount =
        reported.stream().filter(caps -> "chrome".equals(caps.getBrowserName())).count();
    long edgeCount =
        reported.stream().filter(caps -> "MicrosoftEdge".equals(caps.getBrowserName())).count();
    long firefoxCount =
        reported.stream().filter(caps -> "firefox".equals(caps.getBrowserName())).count();

    assertThat(chromeCount).isEqualTo(4);
    assertThat(edgeCount).isEqualTo(3);
    assertThat(firefoxCount).isEqualTo(5);
    assertThat(reported.size()).isEqualTo(12);
  }

  public static class HelperFactory {
    public static SessionFactory create(Config config, Capabilities caps) {
      return new SessionFactory() {
        @Override
        public Capabilities getStereotype() {
          return caps;
        }

        @Override
        public org.openqa.selenium.internal.Either<
                org.openqa.selenium.WebDriverException, org.openqa.selenium.grid.node.ActiveSession>
            apply(org.openqa.selenium.grid.data.CreateSessionRequest createSessionRequest) {
          return org.openqa.selenium.internal.Either.left(
              new org.openqa.selenium.SessionNotCreatedException("HelperFactory for testing"));
        }

        @Override
        public boolean test(Capabilities capabilities) {
          return true;
        }
      };
    }
  }
}
