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

package org.openqa.selenium.devtools.log;

import static org.openqa.selenium.devtools.ConverterFunctions.map;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.log.model.LogEntry;

public class Log {

  private final static String DOMAIN_NAME = "Log";

  public static Command<Void> clear() {
    return new Command<>(DOMAIN_NAME + ".clear", ImmutableMap.of());
  }

  public static Command<Void> enable() {
    return new Command<>(DOMAIN_NAME + ".enable", ImmutableMap.of());
  }

  public static Command<Void> disable() {
    return new Command<>(DOMAIN_NAME + ".disable", ImmutableMap.of());
  }

  public static Event<LogEntry> entryAdded() {
    return new Event<>(
        DOMAIN_NAME + ".entryAdded",
        map("entry", LogEntry.class));
  }

}
