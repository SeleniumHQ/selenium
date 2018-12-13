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
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.util.Set;

@Ignore(FIREFOX)
public class LocalStorageTest extends JUnit4TestBase {
  @Before
  public void checkHasWebStorage() {
    assumeTrue(driver instanceof WebStorage);
    driver.get(pages.html5Page);
    LocalStorage local = ((WebStorage) driver).getLocalStorage();
    local.clear();
  }

  @Test
  public void testLocalStorageSetAndGetItem() {
    driver.get(pages.html5Page);

    LocalStorage local = ((WebStorage) driver).getLocalStorage();
    local.clear();
    assertThat(local.size()).isEqualTo(0);

    local.setItem("FOO", "BAR");
    assertThat(local.getItem("FOO")).isEqualTo("BAR");

    local.setItem("FOO1", "BAR1");
    assertThat(local.getItem("FOO1")).isEqualTo("BAR1");
    assertThat(local.size()).isEqualTo(2);

    local.clear();
    assertThat(local.size()).isEqualTo(0);
  }

  @Test
  public void testLocalStorageKeySet() {
    driver.get(pages.html5Page);

    LocalStorage local = ((WebStorage) driver).getLocalStorage();
    local.clear();
    local.setItem("FOO1", "BAR1");
    local.setItem("FOO2", "BAR2");
    local.setItem("FOO3", "BAR3");

    Set<String> keySet = local.keySet();
    assertThat(keySet.size()).isEqualTo(3);
    assertThat(keySet).contains("FOO1", "FOO2", "FOO3");

    local.clear();
    assertThat(local.keySet()).isEmpty();
  }

  @Test
  public void testClearLocalStorage() {
    LocalStorage local = ((WebStorage) driver).getLocalStorage();
    local.setItem("FOO1", "BAR1");
    local.setItem("FOO2", "BAR2");
    local.setItem("FOO3", "BAR3");
    assertThat(local.size()).isEqualTo(3);

    local.clear();
    assertThat(local.size()).isEqualTo(0);
  }

  @Test
  public void testLocalStorageRemoveItem() {
    driver.get(pages.html5Page);

    LocalStorage local = ((WebStorage) driver).getLocalStorage();
    local.clear();
    local.setItem("FOO", "BAR");
    assertThat(local.size()).isEqualTo(1);
    String removedItemValue = local.removeItem("FOO");
    assertThat(removedItemValue).isEqualTo("BAR");
    assertThat(local.size()).isEqualTo(0);
    local.clear();
  }

  @Test
  public void testLocalAndSessionStorageDontInterfereWithEachOther() {
    driver.get(pages.html5Page);

    LocalStorage local = ((WebStorage) driver).getLocalStorage();
    SessionStorage session = ((WebStorage) driver).getSessionStorage();
    local.clear();
    session.clear();
    local.setItem("FOO", "BAR_LOCAL");
    session.setItem("FOO", "BAR_SESSION");
    assertThat(local.size()).isEqualTo(1);
    assertThat(session.size()).isEqualTo(1);
    assertThat(local.getItem("FOO")).isEqualTo("BAR_LOCAL");
    assertThat(session.getItem("FOO")).isEqualTo("BAR_SESSION");
    String removedItemValue = session.removeItem("FOO");
    assertThat(removedItemValue).isEqualTo("BAR_SESSION");
    assertThat(local.size()).isEqualTo(1);
    assertThat(session.size()).isEqualTo(0);
    removedItemValue = local.removeItem("FOO");
    assertThat(removedItemValue).isEqualTo("BAR_LOCAL");
    assertThat(local.size()).isEqualTo(0);
    assertThat(session.size()).isEqualTo(0);
    local.clear();
    session.clear();
  }
}
