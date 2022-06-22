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

import com.google.common.collect.ImmutableSet;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.testing.JupiterTestBase;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assumptions.assumeThat;

public class ScriptPinningTest extends JupiterTestBase {

  private JavascriptExecutor executor;

  @BeforeEach
  public void setUp() {
    assumeThat(driver).isInstanceOf(JavascriptExecutor.class);

    driver.get(pages.simpleTestPage);

    executor = (JavascriptExecutor) driver;
  }

  @Test
  public void shouldAllowAScriptToBePinned() {
    ScriptKey hello = executor.pin("return 'I like cheese'");

    Object value = executor.executeScript(hello);

    assertThat(value).isEqualTo("I like cheese");
  }

  @Test
  public void pinnedScriptsShouldBeAbleToTakeArguments() {
    ScriptKey hello = executor.pin("return arguments[0]");

    Object value = executor.executeScript(hello, "cheese");

    assertThat(value).isEqualTo("cheese");
  }

  @Test
  public void shouldBeAbleToListAllPinnedScripts() {
    Set<ScriptKey> expected = ImmutableSet.of(
      executor.pin("return arguments[0];"),
      executor.pin("return 'cheese';"),
      executor.pin("return 42;"));

    Set<ScriptKey> pinned = executor.getPinnedScripts();

    assertThat(pinned).isEqualTo(expected);
  }

  @Test
  public void shouldAllowAPinnedScriptToBeUnpinned() {
    ScriptKey cheese = executor.pin("return 'brie'");
    executor.unpin(cheese);

    assertThat(executor.getPinnedScripts()).doesNotContain(cheese);
  }

  @Test
  public void callingAnUnpinnedScriptIsAnError() {
    ScriptKey cheese = executor.pin("return 'brie'");
    executor.unpin(cheese);

    assertThatExceptionOfType(JavascriptException.class).isThrownBy(() -> executor.executeScript(cheese));
  }

}
