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

package org.openqa.selenium.testing;

import org.junit.runner.Description;
import org.junit.runners.BlockJUnit4ClassRunner;
import org.junit.runners.model.FrameworkMethod;
import org.junit.runners.model.InitializationError;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.testing.drivers.TestIgnorance;

public class SeleniumTestRunner extends BlockJUnit4ClassRunner {

  private TestIgnorance ignorance;

  /**
   * Creates a BlockJUnit4ClassRunner to run {@code klass}
   *
   * @param klass The class under test
   * @throws org.junit.runners.model.InitializationError
   *          if the test class is malformed.
   */
  public SeleniumTestRunner(Class<?> klass) throws InitializationError {
    super(klass);
    Browser browser = Browser.detect();
    if (browser == null && DevMode.isInDevMode()) {
      browser = Browser.chrome;
    }
    ignorance = new TestIgnorance(browser);
  }

  @Override
  protected boolean isIgnored(FrameworkMethod child) {
    Description description = describeChild(child);
    return ignorance.isIgnored(description) || super.isIgnored(child);
  }

}
