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

/**
 * Created with IntelliJ IDEA. User: alexei Date: 05.05.13 Time: 15:29 To change this template use
 * File | Settings | File Templates.
 */

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.openqa.grid.e2e.misc.ConfigInheritanceTest;
import org.openqa.grid.e2e.misc.Grid1HeartbeatTest;
import org.openqa.grid.e2e.misc.GridSerializeExceptionTest;
import org.openqa.grid.e2e.misc.GridViaCommandLineTest;
import org.openqa.grid.e2e.misc.HubRestart;
import org.openqa.grid.e2e.misc.HubRestartNeg;
import org.openqa.grid.e2e.misc.WebDriverPriorityDemo;
import org.openqa.grid.e2e.node.BrowserTimeOutTest;
import org.openqa.grid.e2e.node.CrashWhenStartingBrowserTest;
import org.openqa.grid.e2e.node.DefaultProxyFindsFirefoxLocationsTest;
import org.openqa.grid.e2e.node.DefaultProxyIsUnregisteredIfDownForTooLongTest;
import org.openqa.grid.e2e.node.NodeGoingDownAndUpTest;
import org.openqa.grid.e2e.node.NodeRecoveryTest;
import org.openqa.grid.e2e.node.NodeTimeOutTest;
import org.openqa.grid.e2e.node.SmokeTest;
import org.openqa.grid.e2e.utils.ExtraServletUtilTest;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    ConfigInheritanceTest.class,
    Grid1HeartbeatTest.class,
    GridSerializeExceptionTest.class,
    HubRestart.class,
    HubRestartNeg.class,
    //Issue1586.class, // extremely slow test, for issue1586. Excluding from regression.
    WebDriverPriorityDemo.class,
    //BrowserTimeOutTest.class, // broken on CI, needs investigation
    CrashWhenStartingBrowserTest.class,
    DefaultProxyFindsFirefoxLocationsTest.class,
    DefaultProxyIsUnregisteredIfDownForTooLongTest.class,
    NodeGoingDownAndUpTest.class, // slow
    NodeRecoveryTest.class,
    NodeTimeOutTest.class,
    SmokeTest.class, // slow
    ExtraServletUtilTest.class,
    GridViaCommandLineTest.class,
})
public class GridE2ETests {
}
