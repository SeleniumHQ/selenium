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
import com.google.auto.service.AutoService;
import com.google.common.collect.ImmutableSet;
import org.openqa.selenium.grid.config.ConfigValue;
import org.openqa.selenium.grid.config.HasRoles;
import org.openqa.selenium.grid.config.Role;

import java.util.Set;

import static org.openqa.selenium.grid.config.StandardGridRoles.EVENT_BUS_ROLE;

@AutoService(HasRoles.class)
public class EventBusFlags implements HasRoles {

  @Parameter(
      names = {"--publish-events"},
      description =  "Connection string for publishing events to the event bus")
  @ConfigValue(section = "events", name = "publish", example = "\"tcp://*:1233\"")
  private String publishString;

  @Parameter(
      names = {"--subscribe-events"},
      description =  "Connection string for subscribing to events from the event bus")
  @ConfigValue(section = "events", name = "subscribe", example = "\"tcp://*1232\"")
  private String subscribeString;

  @Parameter(
      names = {"--bind-bus"},
      description = "Whether the connection string should be bound or connected",
      arity = 1)
  @ConfigValue(section = "events", name = "bind", example = "false")
  // We use the Boolean here so we can differentiate between there being no option, and a default
  // false value.
  private Boolean bind;

  @Parameter(
      names = {"--events-implementation"},
      description = "Full classname of non-default event bus implementation")
  @ConfigValue(
    section = "events",
    name = "implementation",
    example = "org.openqa.selenium.events.zeromq.ZeroMqEventBus")
  private String implmentation;

  @Override
  public Set<Role> getRoles() {
    return ImmutableSet.of(EVENT_BUS_ROLE);
  }
}
