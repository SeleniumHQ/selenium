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

package org.openqa.grid.e2e;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.openqa.grid.e2e.misc.GridDistributionTest;
import org.openqa.grid.e2e.misc.GridListActiveSessionsTest;
import org.openqa.grid.e2e.misc.HubRestart;
import org.openqa.grid.e2e.misc.HubRestartNeg;
import org.openqa.grid.e2e.misc.WebDriverPriorityDemo;
import org.openqa.grid.e2e.node.BrowserTimeOutTest;
import org.openqa.grid.e2e.node.CrashWhenStartingBrowserTest;
import org.openqa.grid.e2e.node.DefaultProxyIsUnregisteredIfDownForTooLongTest;
import org.openqa.grid.e2e.node.NodeGoingDownAndUpTest;
import org.openqa.grid.e2e.node.NodeRecoveryTest;
import org.openqa.grid.e2e.node.SmokeTest;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    BrowserTimeOutTest.class,
    CrashWhenStartingBrowserTest.class,
    DefaultProxyIsUnregisteredIfDownForTooLongTest.class,
    GridDistributionTest.class,
    HubRestart.class,
    HubRestartNeg.class,
    NodeGoingDownAndUpTest.class, // slow
    NodeRecoveryTest.class,
    SmokeTest.class, // slow
    WebDriverPriorityDemo.class,
    GridListActiveSessionsTest.class
})
public class GridE2ETests {
}
