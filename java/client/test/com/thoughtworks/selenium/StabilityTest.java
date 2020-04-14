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

package com.thoughtworks.selenium;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WrapsDriver;

import static org.junit.Assume.assumeFalse;

/**
 * Regression test suite for stability problems discovered in Selenium Remote Control
 *
 * You need to have a Remote-Control server running on 4444 in a separate process before running
 * this test
 */
public class StabilityTest extends InternalSelenseTestBase {

  @Before
  public void assumeSeCoreImplementation() {
    assumeFalse(selenium instanceof WrapsDriver);
  }

  @Test
  public void retrieveLastRemoteControlLogsDoesNotTriggerOutOfMemoryErrors() {
    for (int i = 1; i < 100000; i++) {
      selenium.retrieveLastRemoteControlLogs();
    }
  }

}
