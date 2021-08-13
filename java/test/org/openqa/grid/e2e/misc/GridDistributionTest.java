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

package org.openqa.grid.e2e.misc;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebDriver;

import java.util.ArrayList;
import java.util.List;

public class GridDistributionTest {

//  private Hub hub;
  private List<WebDriver> drivers = new ArrayList<>();

  @Before
  public void prepare() {

//    hub = GridTestHelper.getHub();
//
//    for (int i =0; i < 8; i++) {
//      SelfRegisteringRemote remote =
//        GridTestHelper.getRemoteWithoutCapabilities(hub, GridRole.NODE);
//
//      remote.addBrowser(GridTestHelper.getDefaultBrowserCapability(), 3);
//      remote.setRemoteServer(new SeleniumServer(remote.getConfiguration()));
//      remote.startRemoteServer();
//      remote.sendRegistrationRequest();
//      RegistryTestHelper.waitForNode(hub.getRegistry(), i+1);
//    }
  }

  @Test
  public void testLeastRecentlyUsedNodesPickedFirst() {
//    ProxySet ps = hub.getRegistry().getAllProxies();
//
//    for (int i=0; i < 4; i++) {
//      drivers.add(GridTestHelper.getRemoteWebDriver(hub));
//    }
//
//    Set<String> chosenNodes = new HashSet<>();
//
//    for (RemoteProxy p : ps) {
//      for (TestSlot ts : p.getTestSlots()) {
//        if (ts.getSession() != null) {
//          chosenNodes.add(p.getRemoteHost().toString());
//          break;
//        }
//      }
//    }
//
//    stopDrivers(drivers);
//
//    for (int i=0; i < 4; i++) {
//      drivers.add(GridTestHelper.getRemoteWebDriver(hub));
//    }
//
//    for (RemoteProxy p : ps) {
//      for (TestSlot ts : p.getTestSlots()) {
//        if (ts.getSession() != null) {
//          Assert.assertFalse("Should not be immediately reused: " + p.getRemoteHost().toString() + " previously used nodes: " + chosenNodes,
//                             chosenNodes.contains(p.getRemoteHost().toString()));
//          break;
//        }
//      }
//    }
//
//    chosenNodes.clear();
//
//    for (RemoteProxy p : ps) {
//      for (TestSlot ts : p.getTestSlots()) {
//        if (ts.getSession() != null) {
//          chosenNodes.add(p.getRemoteHost().toString());
//          break;
//        }
//      }
//    }
//
//    stopDrivers(drivers);
//
//    for (int i=0; i < 4; i++) {
//      drivers.add(GridTestHelper.getRemoteWebDriver(hub));
//    }
//
//    for (RemoteProxy p : ps) {
//      for (TestSlot ts : p.getTestSlots()) {
//        if (ts.getSession() != null) {
//          Assert.assertFalse("Should not be immediately reused: " + p.getRemoteHost().toString() + " previously used nodes: " + chosenNodes,
//                             chosenNodes.contains(p.getRemoteHost().toString()));
//          break;
//        }
//      }
//    }
  }

  private void stopDrivers(List<WebDriver> drivers) {
    for (WebDriver driver : drivers) {
      try {
        driver.quit();
      } catch (Exception e) {
        System.out.println(e.toString());
      }
    }
    drivers.clear();
  }

  @After
  public void stop() {
    stopDrivers(drivers);
//    hub.stop();
  }
}
