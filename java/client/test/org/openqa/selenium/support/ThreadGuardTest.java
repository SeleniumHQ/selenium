/*
 * Copyright 2011 Software Freedom Conservancy.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.openqa.selenium.support;

import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.HasTouchScreen;
import org.openqa.selenium.StubDriver;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ThreadGuard;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * @author Kristian Rosenvold
 */
public class ThreadGuardTest {

  @Test
  public void testProtect() throws Exception {
    WebDriver actual = new PermissiveStubDriver();
    final WebDriver protect = ThreadGuard.protect(actual);
    final AtomicInteger successes = new AtomicInteger();
    Thread foo = new Thread(new Runnable() {
      public void run() {
        protect.findElement(By.id("foo"));
        successes.incrementAndGet();
      }
    });
    foo.start();
    foo.join();
    Assert.assertEquals(0, successes.get());
  }

  @Test
  public void testProtectSuccess() throws Exception {
    WebDriver actual = new PermissiveStubDriver();
    final WebDriver protect = ThreadGuard.protect(actual);
    Assert.assertNull(protect.findElement(By.id("foo")));
  }

  @Test
  public void testInterfacesProxiedProeprly() throws Exception {
    WebDriver actual = new PermissiveStubDriver();
    final WebDriver webdriver = ThreadGuard.protect(actual);
    HasTouchScreen hasTouchScreen = (HasTouchScreen) webdriver;
    Assert.assertNotNull(hasTouchScreen);
  }

  class PermissiveStubDriver extends StubDriver {
    @Override
    public WebElement findElement(By by) {
      return null;
    }
  }
}
