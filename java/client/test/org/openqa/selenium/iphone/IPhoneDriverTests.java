/*
Copyright 2007-2009 Selenium committers

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

import java.io.File;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.StandardSeleniumTests;
import org.openqa.selenium.interactions.touch.TouchTests;
import org.openqa.selenium.testing.InProject;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    StandardSeleniumTests.class,
    TouchTests.class,
    IPhoneSpecificTests.class
})
public class IPhoneDriverTests {

  // this is being magically used in ReflectionBackedDriverSupplier
  public static class TestIPhoneSimulatorDriver extends IPhoneSimulatorDriver {
    public TestIPhoneSimulatorDriver(Capabilities ignore) throws Exception {
      super(locateSimulatorBinary());
    }

    private static IPhoneSimulatorBinary locateSimulatorBinary() throws Exception {
      File iWebDriverApp = InProject.locate(
          "iphone/build/Release-iphonesimulator/iWebDriver.app/iWebDriver");
      return new IPhoneSimulatorBinary(iWebDriverApp);
    }
  }
}
