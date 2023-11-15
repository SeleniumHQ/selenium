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

package org.openqa.selenium.grid.config;

import java.util.Arrays;
import java.util.Collections;
import java.util.Set;
import java.util.TreeSet;

public class StandardGridRoles {
  private StandardGridRoles() {
    // Constants
  }

  public static final Role DISTRIBUTOR_ROLE = Role.of("grid-distributor");
  public static final Role EVENT_BUS_ROLE = Role.of("grid-event-bus");
  public static final Role HTTPD_ROLE = Role.of("httpd");
  public static final Role NODE_ROLE = Role.of("grid-node");
  public static final Role ROUTER_ROLE = Role.of("grid-router");
  public static final Role SESSION_MAP_ROLE = Role.of("grid-session-map");
  public static final Role SESSION_QUEUE_ROLE = Role.of("grid-new-session-queue");

  public static final Set<Role> ALL_ROLES =
      Collections.unmodifiableSet(
          new TreeSet<>(
              Arrays.asList(
                  DISTRIBUTOR_ROLE,
                  EVENT_BUS_ROLE,
                  NODE_ROLE,
                  ROUTER_ROLE,
                  SESSION_MAP_ROLE,
                  SESSION_QUEUE_ROLE)));
}
