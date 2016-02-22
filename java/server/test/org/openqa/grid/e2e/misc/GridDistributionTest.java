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

import junit.framework.Assert;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.ProxySet;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSlot;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.server.SeleniumServer;

import java.util.ArrayList;
import java.util.List;

public class GridDistributionTest {

  private static Hub hub;
  private static List<WebDriver> drivers = new ArrayList<>();

  @BeforeClass
  public static void prepare() throws Exception {

    hub = GridTestHelper.getHub();

    for (int i =0; i < 8; i++) {
      SelfRegisteringRemote remote =
        GridTestHelper.getRemoteWithoutCapabilities(hub, GridRole.NODE);

      remote.addBrowser(DesiredCapabilities.chrome(), 3);
      remote.setRemoteServer(new SeleniumServer(remote.getConfiguration()));
      remote.startRemoteServer();
      remote.sendRegistrationRequest();
      RegistryTestHelper.waitForNode(hub.getRegistry(), i+1);
    }
  }

  @Test
  public void testLoadIsDistributedEvenly() throws Throwable {


    for (int i=0; i < 8; i++) {
      drivers.add(GridTestHelper.getRemoteWebDriver(DesiredCapabilities.chrome(), hub));
    }

    ProxySet ps = hub.getRegistry().getAllProxies();

    for (RemoteProxy p : ps) {
      int freeslots = 0;
      for (TestSlot ts : p.getTestSlots()) {
        if (ts.getSession() == null) {
          freeslots++;
        }
      }
      Assert.assertEquals("checking proxy free slots, all should have only one session running", freeslots, 2);
    }

    for (int i=0; i < 8; i++) {
      drivers.add(GridTestHelper.getRemoteWebDriver(DesiredCapabilities.chrome(), hub));
    }

    for (RemoteProxy p : ps) {
      int freeslots = 0;
      for (TestSlot ts : p.getTestSlots()) {
        if (ts.getSession() == null) {
          freeslots++;
        }
      }
      Assert.assertEquals("checking proxy free slots, all should have two sessions running", freeslots, 1);
    }

    drivers.add(GridTestHelper.getRemoteWebDriver(DesiredCapabilities.chrome(), hub));

    Boolean foundOneFull = false;
    for (RemoteProxy p : ps) {
      int freeslots = 0;
      for (TestSlot ts : p.getTestSlots()) {
        if (ts.getSession() == null) {
          freeslots++;
        }
      }
      if (freeslots == 0) {
        if (!foundOneFull) {
          foundOneFull = true;
        } else {
          throw new RuntimeException(
            "Found more than one node with all test slots running sessions");
        }
      }
    }
  }

  @AfterClass
  public static void stop() throws Exception {
    for (WebDriver driver : drivers) {
      try {
        driver.quit();
      } catch (Exception e) {
        System.out.println(e.toString());
      }
    }
    hub.stop();
  }
}
