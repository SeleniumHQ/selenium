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

package org.openqa.selenium;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NoDriverAfterTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assumptions.assumeThat;

public class AuthenticationTest extends JUnit4TestBase {

  @Before
  public void testRequiresAuthentication() {
    assumeThat(driver).isInstanceOf(HasAuthentication.class);
  }

  @Test(timeout = 10000)
  @NoDriverAfterTest
  public void canAccessUrlProtectedByBasicAuth() {
    ((HasAuthentication) driver).register(UsernameAndPassword.of("test", "test"));

    driver.get(appServer.whereIs("basicAuth"));
    assertThat(driver.findElement(By.tagName("h1")).getText()).isEqualTo("authorized");
  }
}
