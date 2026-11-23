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

package org.openqa.selenium.grid.sessionmap.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.beust.jcommander.JCommander;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.grid.config.AnnotatedConfig;
import org.openqa.selenium.grid.config.Config;

class SessionMapFlagsTest {

  private SessionMapFlags flags;

  @BeforeEach
  void setUp() {
    flags = new SessionMapFlags();
  }

  @Test
  void sessionsSchemeFlagPopulatesConfig() {
    JCommander.newBuilder().addObject(flags).build().parse("--sessions-scheme", "redis");

    Config config = new AnnotatedConfig(flags);

    assertThat(config.get("sessions", "scheme")).contains("redis");
  }

  @Test
  void sessionsImplementationFlagPopulatesConfig() {
    String impl = "org.openqa.selenium.grid.sessionmap.redis.RedisBackedSessionMap";
    JCommander.newBuilder().addObject(flags).build().parse("--sessions-implementation", impl);

    Config config = new AnnotatedConfig(flags);

    assertThat(config.get("sessions", "implementation")).contains(impl);
  }

  @Test
  void sessionsSchemeIsAbsentWhenFlagNotSet() {
    Config config = new AnnotatedConfig(flags);

    assertThat(config.get("sessions", "scheme")).isEmpty();
  }

  @Test
  void sessionsImplementationIsAbsentWhenFlagNotSet() {
    Config config = new AnnotatedConfig(flags);

    assertThat(config.get("sessions", "implementation")).isEmpty();
  }
}
