package org.openqa.grid.e2e.utils;

import java.util.concurrent.Callable;

import org.openqa.grid.internal.Registry;
import org.openqa.selenium.TestWaiter;

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
}
