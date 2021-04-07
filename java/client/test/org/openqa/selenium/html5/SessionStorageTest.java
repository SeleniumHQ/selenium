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

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.testing.drivers.Browser.LEGACY_FIREFOX_XPI;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.util.Set;

@Ignore(LEGACY_FIREFOX_XPI)
public class SessionStorageTest extends JUnit4TestBase {
  @Before
  public void checkHasWebStorage() {
    assumeTrue(driver instanceof WebStorage);
  }

  @Test
  public void testSessionStorageSetAndGetItem() {
    driver.get(pages.html5Page);
    SessionStorage session = ((WebStorage) driver).getSessionStorage();
    assertThat(session.size()).isEqualTo(0);

    session.setItem("BAR", "FOO");
    assertThat(session.getItem("BAR")).isEqualTo("FOO");

    session.setItem("BAR1", "FOO1");
    assertThat(session.getItem("BAR1")).isEqualTo("FOO1");
    assertThat(session.size()).isEqualTo(2);

    session.clear();
    assertThat(session.size()).isEqualTo(0);
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
    assertThat(keySet).hasSize(3);
    assertThat(keySet).contains("FOO1", "FOO2", "FOO3");

    session.clear();
    assertThat(session.keySet()).isEmpty();
  }

  @Test
  public void testClearSessionStorage() {
    driver.get(pages.html5Page);

    SessionStorage session = ((WebStorage) driver).getSessionStorage();
    session.setItem("FOO1", "BAR1");
    session.setItem("FOO2", "BAR2");
    session.setItem("FOO3", "BAR3");
    assertThat(session.size()).isEqualTo(3);

    session.clear();
    assertThat(session.size()).isEqualTo(0);
  }

  @Test
  public void testSessionStorageRemoveItem() {
    driver.get(pages.html5Page);

    SessionStorage session = ((WebStorage) driver).getSessionStorage();
    session.clear();
    session.setItem("BAR", "FOO");
    assertThat(session.size()).isEqualTo(1);
    String removedItemValue = session.removeItem("BAR");
    assertThat(removedItemValue).isEqualTo("FOO");
    assertThat(session.size()).isEqualTo(0);
    session.clear();
  }
}
