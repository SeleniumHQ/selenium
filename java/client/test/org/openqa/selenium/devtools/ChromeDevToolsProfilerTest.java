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

package org.openqa.selenium.devtools;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.openqa.selenium.devtools.profiler.Profiler.consoleProfileFinished;
import static org.openqa.selenium.devtools.profiler.Profiler.consoleProfileStarted;
import static org.openqa.selenium.devtools.profiler.Profiler.disable;
import static org.openqa.selenium.devtools.profiler.Profiler.enable;
import static org.openqa.selenium.devtools.profiler.Profiler.getBestEffortCoverage;
import static org.openqa.selenium.devtools.profiler.Profiler.setSamplingInterval;
import static org.openqa.selenium.devtools.profiler.Profiler.start;
import static org.openqa.selenium.devtools.profiler.Profiler.startPreciseCoverage;
import static org.openqa.selenium.devtools.profiler.Profiler.startTypeProfile;
import static org.openqa.selenium.devtools.profiler.Profiler.stop;
import static org.openqa.selenium.devtools.profiler.Profiler.stopTypeProfile;
import static org.openqa.selenium.devtools.profiler.Profiler.takePreciseCoverage;

import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.devtools.profiler.model.Profile;
import org.openqa.selenium.devtools.profiler.model.ProfileNode;
import org.openqa.selenium.devtools.profiler.model.ScriptCoverage;

import java.util.List;
import java.util.Optional;

public class ChromeDevToolsProfilerTest extends DevToolsTestBase {

  private void validateProfile(Profile profiler) {
    assertNotNull(profiler);
    assertNotNull(profiler.getNodes());
    assertNotNull(profiler.getStartTime());
    assertNotNull(profiler.getEndTime());
    assertNotNull(profiler.getTimeDeltas());
    for (Integer integer : profiler.getTimeDeltas()) {
      assertNotNull(integer);
    }
    for (ProfileNode n : profiler.getNodes()) {
      assertNotNull(n);
      assertNotNull(n.getCallFrame());
    }
  }

  @Test
  public void sampleGetBestEffortProfilerTest() {
    devTools.send(enable());
    driver.get(appServer.whereIs("devToolsProfilerTest.html"));
    devTools.send(setSamplingInterval(30));
    List<ScriptCoverage> bestEffort = devTools.send(getBestEffortCoverage());
    assertNotNull(bestEffort);
    assertFalse(bestEffort.isEmpty());
    devTools.send(disable());
  }

  @Test
  public void sampleSetStartPreciseCoverageTest() {
    devTools.send(enable());
    driver.get(appServer.whereIs("devToolsProfilerTest.html"));
    devTools.send(startPreciseCoverage(Optional.of(true), Optional.of(true)));
    devTools.send(start());
    List<ScriptCoverage> pc = devTools.send(takePreciseCoverage());
    assertNotNull(pc);
    Profile profiler = devTools.send(stop());
    validateProfile(profiler);
    devTools.send(disable());
  }

  @Test
  public void sampleProfileEvents() {
    devTools.addListener(consoleProfileFinished(), Assert::assertNotNull);
    devTools.addListener(consoleProfileStarted(), Assert::assertNotNull);
    devTools.send(enable());
    driver.get(appServer.whereIs("devToolsProfilerTest.html"));
    devTools.addListener(consoleProfileStarted(), Assert::assertNotNull);
    devTools.send(startTypeProfile());
    devTools.send(start());
    driver.navigate().refresh();

    devTools.send(stopTypeProfile());
    Profile profiler = devTools.send(stop());
    validateProfile(profiler);
    devTools.send(disable());
  }
}
