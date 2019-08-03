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
package org.openqa.selenium.devtools.inspector;

import static org.openqa.selenium.devtools.ConverterFunctions.map;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Beta;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.Event;

@Beta
public class Inspector {

  /** Enables inspector domain notifications. */
  public static Command<Void> enable() {
    return new Command<>("Inspector.enable", ImmutableMap.of());
  }

  /** Disables inspector domain notifications. */
  public static Command<Void> disable() {
    return new Command<>("Inspector.disable", ImmutableMap.of());
  }
  /** Fired when remote debugging connection is about to be terminated. Contains detach reason. */
  public static Event<String> detached() {
    return new Event<>("Inspector.detached", map("reason", String.class));
  }
}
