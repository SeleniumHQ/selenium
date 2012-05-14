/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.grid.e2e.utils;

import org.openqa.selenium.TestWaiter;

import org.openqa.grid.internal.Registry;

import java.util.concurrent.Callable;

public class RegistryTestHelper {

  /**
   * Wait for the registry to have exactly nodeNumber nodes registered.
   * 
   * @param r
   * @param nodeNumber
   */
  public static void waitForNode(final Registry r, final int nodeNumber) {
    TestWaiter.waitFor(new Callable<Integer>() {
      public Integer call() throws Exception {
        Integer i = r.getAllProxies().size();
        if (i != nodeNumber) {
          return null;
        } else {
          return i;
        }
      }
    });
  }


  public static void waitForActiveTestSessionCount(final Registry r, final int activeTestSesssions) {
    TestWaiter.waitFor(new Callable<Integer>() {
      public Integer call() throws Exception {
        Integer i = r.getActiveSessions().size();
        if (i != activeTestSesssions) {
          return null;
        } else {
          return i;
        }
      }
    });
  }
}
