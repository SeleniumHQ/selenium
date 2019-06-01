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

package org.openqa.selenium.devtools.profiler;

import static org.openqa.selenium.devtools.ConverterFunctions.map;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableMap.Builder;
import com.google.common.reflect.TypeToken;

import org.openqa.selenium.Beta;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.profiler.model.ConsoleProfileFinished;
import org.openqa.selenium.devtools.profiler.model.ConsoleProfileStarted;
import org.openqa.selenium.devtools.profiler.model.Profile;
import org.openqa.selenium.devtools.profiler.model.ScriptCoverage;
import org.openqa.selenium.devtools.profiler.model.ScriptTypeProfile;

import java.util.List;
import java.util.Optional;

public class Profiler {

  /**
   * Disable Profiling
   */
  public static Command<Void> disable() {
    return new Command<>("Profiler.disable", ImmutableMap.of());
  }

  /**
   * Enable Profiling
   */
  public static Command<Void> enable() {
    return new Command<>("Profiler.enable", ImmutableMap.of());
  }

  /**
   * start Profiling process
   */
  public static Command<Void> start() {
    return new Command<>("Profiler.start", ImmutableMap.of());
  }

  /**
   * stop Profiling process
   **/
  public static Command<Profile> stop() {
    return new Command<>("Profiler.stop", ImmutableMap.of(), map("profile", Profile.class));
  }

  /**
   * Collect coverage data for the current isolate. The coverage data may be incomplete due to garbage collection.
   **/
  public static Command<List<ScriptCoverage>> getBestEffortCoverage() {
    return new Command<>(
        "Profiler.getBestEffortCoverage", ImmutableMap.of(),
        map("result", new TypeToken<List<ScriptCoverage>>() {
        }.getType()));
  }

  /**
   * Changes CPU profiler sampling interval. Must be called before CPU profiles recording started.
   *
   * @param interval New sampling interval in microseconds.
   */
  public static Command<Void> setSamplingInterval(int interval) {
    return new Command<>("Profiler.setSamplingInterval", ImmutableMap.of("interval", interval));
  }

  /**
   * Enable precise code coverage. Coverage data for JavaScript executed before enabling precise code coverage may be
   * incomplete. Enabling prevents running optimized code and resets execution counters.
   *
   * @param callCount Collect accurate call counts beyond simple 'covered' or 'not covered'.
   * @param detailed  Collect block-based coverage.
   */
  public static Command<Void> startPreciseCoverage(
      Optional<Boolean> callCount, Optional<Boolean> detailed) {
    Builder<String, Object> mapBuilder = ImmutableMap.builder();
    callCount.ifPresent(value -> mapBuilder.put("callCount", value));
    detailed.ifPresent(value -> mapBuilder.put("detailed", value));
    return new Command<>("Profiler.startPreciseCoverage", mapBuilder.build());
  }

  /**
   * Enable type profile
   */
  @Beta
  public static Command<Void> startTypeProfile() {
    return new Command<>("Profiler.startTypeProfile", ImmutableMap.of());
  }

  /**
   * Disable precise code coverage. Disabling releases unnecessary execution count records and allows executing
   * optimized code.
   */
  public static Command<Void> stopPreciseCoverage() {
    return new Command<Void>("Profiler.stopPreciseCoverage", ImmutableMap.of());
  }

  /**
   * Disable type profile. Disabling releases type profile data collected so far.EXPERIMENTAL
   */
  @Beta
  public static Command<Void> stopTypeProfile() {
    return new Command<>("Profiler.stopTypeProfile", ImmutableMap.of());
  }

  /**
   * Collect coverage data for the current isolate, and resets execution counters. Precise code coverage needs to have
   * started.
   */
  public static Command<List<ScriptCoverage>> takePreciseCoverage() {
    return new Command<>(
        "Profiler.takePreciseCoverage",
        ImmutableMap.of(),
        map("result", new TypeToken<List<ScriptCoverage>>() {
        }.getType()));
  }

  /**
   * Collect type profile.EXPERIMENTAL
   */
  @Beta
  public static Command<List<ScriptCoverage>> takeTypeProfile() {
    return new Command<>(
        "Profiler.takeTypeProfile",
        ImmutableMap.of(),
        map("result", new TypeToken<List<ScriptTypeProfile>>() {
        }.getType()));
  }

  public static Event<ConsoleProfileFinished> consoleProfileFinished() {
    return new Event<>("Profiler.consoleProfileFinished", map("id", ConsoleProfileFinished.class));
  }

  /**
   * Sent when new profile recording is started using console.profile() call.
   */
  public static Event<ConsoleProfileStarted> consoleProfileStarted() {
    return new Event<>("Profiler.consoleProfileStarted", map("id", ConsoleProfileStarted.class));
  }
}
