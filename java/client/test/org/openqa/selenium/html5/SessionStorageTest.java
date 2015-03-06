/*
Copyright 2011 Selenium committers

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

package org.openqa.selenium.html5;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeTrue;

public class SessionStorageTest extends JUnit4TestBase {
  @Before
  public void checkHasWebStorage() {
    assumeTrue(driver instanceof WebStorage);
  }

  @Test
  public void testSessionStorageSetAndGetItem() {
    driver.get(pages.html5Page);
    SessionStorage session = ((WebStorage) driver).getSessionStorage();
    assertEquals("Session Storage isn't empty.", 0, session.size());

    session.setItem("BAR", "FOO");
    assertEquals("FOO", session.getItem("BAR"));

    session.setItem("BAR1", "FOO1");
    assertEquals("FOO1", session.getItem("BAR1"));
    assertEquals(2, session.size());

    session.clear();
    assertEquals(0, session.size());
  }

  @Test
  public void testSessionStorageKeySet() {
    driver.get(pages.html5Page);

    SessionStorage session = ((WebStorage) driver).getSessionStorage();
    session.clear();
    session.setItem("FOO1", "BAR1");
    session.setItem("FOO2", "BAR2");
    session.setItem("FOO3", "BAR3");

    Set<String> keySet = session.keySet();
    assertTrue(keySet.size() == 3);
    assertTrue(keySet.contains("FOO1"));
    assertTrue(keySet.contains("FOO2"));
    assertTrue(keySet.contains("FOO3"));

    session.clear();
    assertTrue(session.keySet().isEmpty());
  }

  @Test
  public void testClearSessionStorage() {
    SessionStorage session = ((WebStorage) driver).getSessionStorage();
    session.setItem("FOO1", "BAR1");
    session.setItem("FOO2", "BAR2");
    session.setItem("FOO3", "BAR3");
    assertEquals(3, session.size());

    session.clear();
    assertEquals(0, session.size());
  }

  @Test
  public void testSessionStorageRemoveItem() {
    driver.get(pages.html5Page);

    SessionStorage session = ((WebStorage) driver).getSessionStorage();
    session.clear();
    session.setItem("BAR", "FOO");
    assertEquals(1, session.size());
    String removedItemValue = session.removeItem("BAR");
    assertEquals("FOO", removedItemValue);
    assertEquals(0, session.size());
    session.clear();
  }
}
