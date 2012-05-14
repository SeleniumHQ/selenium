/*
Copyright 2007-2009 WebDriver committers

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

package org.openqa.selenium;

import com.google.common.base.Supplier;

import junit.extensions.TestSetup;
import junit.framework.Test;

public class DriverTestDecorator extends TestSetup {

  private final boolean keepDriver;
  private final boolean freshDriver;

  private static WebDriver driver;
  private final boolean restartDriver;
  private final Supplier<WebDriver> driverSupplier;

  public DriverTestDecorator(Test test, Supplier<WebDriver> driverSupplier, boolean keepDriver,
      boolean freshDriver, boolean restartDriver) {
    super(test);
    this.driverSupplier = driverSupplier;
    this.keepDriver = keepDriver;
    this.freshDriver = freshDriver;
    this.restartDriver = restartDriver;
  }

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    if (driver != null && freshDriver) {
      driver.quit();
      driver = null;
    }

    if (getTest() instanceof NeedsDriver) {
      try {
        driver = instantiateDriver();
        ((NeedsDriver) getTest()).setDriver(driver);
      } catch (RuntimeException e) {
        e.printStackTrace();
        throw e;
      }
    }
  }

  @Override
  protected void tearDown() throws Exception {
    if (!keepDriver || restartDriver) {
      try {
        driver.quit();

      } catch (Exception e) {
        // this is okay --- the driver could be quit by the test
      }
      driver = null;
    }
    super.tearDown();
  }

  public static WebDriver getDriver() {
    return driver;
  }

  private WebDriver instantiateDriver() {
    if (keepDriver && driver != null) {
      return driver;
    }

    try {
      return driverSupplier.get();
    } catch (Exception e) {
      e.printStackTrace();
      System.err.println("Cannot instantiate driver: " + e.getMessage());
      throw new RuntimeException(e);
    }
  }
}
