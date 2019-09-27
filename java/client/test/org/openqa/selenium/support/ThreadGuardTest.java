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
package org.openqa.selenium.support;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.withSettings;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.interactions.HasTouchScreen;

import java.util.concurrent.atomic.AtomicInteger;

public class ThreadGuardTest {

  @Test
  public void testProtect() throws Exception {
    WebDriver actual = mock(WebDriver.class);
    final WebDriver protect = ThreadGuard.protect(actual);
    final AtomicInteger successes = new AtomicInteger();
    Thread foo = new Thread(() -> {
      protect.findElement(By.id("foo"));
      successes.incrementAndGet();
    });
    foo.start();
    foo.join();
    assertThat(successes.get()).isEqualTo(0);
  }

  @Test
  public void testProtectSuccess() {
    WebDriver actual = mock(WebDriver.class);
    final WebDriver protect = ThreadGuard.protect(actual);
    assertThat(protect.findElement(By.id("foo"))).isNull();
  }

  @Test
  public void testInterfacesProxiedProperly() {
    WebDriver actual = mock(WebDriver.class,
                            withSettings().extraInterfaces(HasTouchScreen.class));
    final WebDriver webdriver = ThreadGuard.protect(actual);
    HasTouchScreen hasTouchScreen = (HasTouchScreen) webdriver;
    assertThat(hasTouchScreen).isNotNull();
  }
}
