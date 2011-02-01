/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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

package org.openqa.selenium.iphone;

import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.NoDriverAfterTest;

/**
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class IPhoneSimulatorCommandExecutorTest extends AbstractDriverTestCase {

  @NoDriverAfterTest
  public void testShouldDetectThatTheIPhoneSimulatorHasUnexpectedlyShutdown() throws Exception {
    if (!(driver instanceof IPhoneSimulatorDriver)) {
      System.out.println(String.format(
          "[%s] Skipping test; requires current driver to be a %s, but instead is a %s",
          getName(), IPhoneSimulatorDriver.class.getName(), driver.getClass().getName()));
      return;
    }

    IPhoneSimulatorCommandExecutor executor =
        ((IPhoneSimulatorCommandExecutor) ((IPhoneSimulatorDriver) driver).getCommandExecutor());
    assertEquals(0, executor.getBinary().getKillScript().start().waitFor());

    try {
      driver.get(pages.simpleTestPage);
      fail("Should have thrown a " +
           IPhoneSimulatorCommandExecutor.IPhoneSimulatorNotRunningException.class.getName());
    } catch (IPhoneSimulatorCommandExecutor.IPhoneSimulatorNotRunningException expected) {
      // Do nothing
    }
  }
}
