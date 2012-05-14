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

package org.openqa.selenium;

import org.junit.Test;

import java.util.Date;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

public class CookieTest {

  @Test
  public void testCanCreateAWellFormedCookie() {
    new Cookie("Fish", "cod", "", "", null, false);
  }

  @Test
  public void testShouldThrowAnExceptionWhenSemiColonExistsInTheCookieAttribute() {
    try {
      new Cookie("hi;hi", "value", null, null, null, false);
      fail();
    } catch (IllegalArgumentException e) {
      // Expected
    }
  }

  @Test
  public void testShouldThrowAnExceptionTheNameIsNull() {
    try {
      new Cookie(null, "value", null, null, null, false);
      fail();
    } catch (IllegalArgumentException e) {
      // expected
    }
  }

  @Test
  public void testCookiesShouldAllowSecureToBeSet() {
    Cookie cookie = new Cookie("name", "value", "", "/", new Date(), true);
    assertTrue(cookie.isSecure());
  }

  @Test
  public void testSecureDefaultsToFalse() {
    Cookie cookie = new Cookie("name", "value");
    assertFalse(cookie.isSecure());
  }
}
