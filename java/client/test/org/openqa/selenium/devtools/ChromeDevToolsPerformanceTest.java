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

import static org.openqa.selenium.devtools.performance.Performance.disable;
import static org.openqa.selenium.devtools.performance.Performance.enable;
import static org.openqa.selenium.devtools.performance.Performance.getMetrics;

import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.devtools.performance.Performance;
import org.openqa.selenium.devtools.performance.model.Metric;
import org.openqa.selenium.devtools.performance.model.TimeDomain;

import java.util.List;
import java.util.Objects;


public class ChromeDevToolsPerformanceTest extends DevToolsTestBase {


  @Test
  public void enableAndDisablePerformance() {

    devTools.send(enable());
    driver.get(appServer.whereIs("simpleTest.html"));
    devTools.send(disable());
  }

  @Test
  public void disablePerformance() {

    devTools.send(disable());
    driver.get(appServer.whereIs("simpleTest.html"));
    devTools.send(disable());
  }

  @Test
  public void setTimeDomainTimeTickPerformance() {
    devTools.send(disable());

    devTools.send(Performance.setTimeDomain(TimeDomain.timeTicks));
    devTools.send(enable());
    driver.get(appServer.whereIs("simpleTest.html"));
    devTools.send(disable());
  }

  @Test
  public void setTimeDomainsThreadTicksPerformance() {
    devTools.send(disable());
    devTools.send(Performance.setTimeDomain(TimeDomain.threadTicks));
    devTools.send(enable());
    driver.get(appServer.whereIs("simpleTest.html"));
    devTools.send(disable());
  }

  @Test
  public void getMetricsByTimeTicks() {
    devTools.send(Performance.setTimeDomain(TimeDomain.timeTicks));
    devTools.send(enable());
    driver.get(appServer.whereIs("simpleTest.html"));
    List<Metric> metrics = devTools.send(getMetrics());
    Objects.requireNonNull(metrics);
    Assert.assertFalse(metrics.isEmpty());
    devTools.send(disable());
  }

  @Test
  public void getMetricsByThreadTicks() {
    devTools.send(Performance.setTimeDomain(TimeDomain.threadTicks));
    devTools.send(enable());
    driver.get(appServer.whereIs("simpleTest.html"));
    List<Metric> metrics = devTools.send(getMetrics());
    Objects.requireNonNull(metrics);
    Assert.assertFalse(metrics.isEmpty());
    devTools.send(disable());
  }


}
