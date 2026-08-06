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

package org.openqa.selenium.grid.sessionqueue.httpd;

import static org.assertj.core.api.Assertions.assertThatCode;

import org.junit.jupiter.api.Test;

class NewSessionQueueServerTest {

  // These classes are loaded via Class.forName() at runtime. This test verifies they are bundled
  // into the httpd target so that --sessionqueue-implementation works without --ext.
  @Test
  void localImplementationIsOnClasspath() {
    assertThatCode(
            () -> Class.forName("org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue"))
        .doesNotThrowAnyException();
  }

  @Test
  void redisImplementationIsOnClasspath() {
    assertThatCode(
            () ->
                Class.forName(
                    "org.openqa.selenium.grid.sessionqueue.redis.RedisBackedNewSessionQueue"))
        .doesNotThrowAnyException();
  }
}
