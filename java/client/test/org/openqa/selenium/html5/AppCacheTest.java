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

package org.openqa.selenium.html5;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.html5.AppCacheStatus.UNCACHED;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.testing.JUnit4TestBase;

public class AppCacheTest extends JUnit4TestBase {

  @Before
  public void checkIsApplicationCache() {
    assumeTrue(driver instanceof ApplicationCache);
  }

  @Test
  public void testAppCacheStatus() {
    driver.get(pages.html5Page);
    driver.manage().timeouts().implicitlyWait(2000, MILLISECONDS);

    AppCacheStatus status = ((ApplicationCache) driver).getStatus();
    while (status == AppCacheStatus.DOWNLOADING) {
      status = ((ApplicationCache) driver).getStatus();
    }
    assertThat(status).isEqualTo(UNCACHED);
  }

  @Test
  public void testBrowserLoadsFromCacheWhenOffline() {
    driver.get(pages.html5Page);
    driver.get(pages.formPage);
  }
}
