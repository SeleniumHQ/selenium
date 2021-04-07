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

package org.openqa.selenium.atoms;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.InstanceOfAssertFactories.MAP;

import net.sourceforge.htmlunit.corejs.javascript.Context;
import net.sourceforge.htmlunit.corejs.javascript.ContextFactory;
import net.sourceforge.htmlunit.corejs.javascript.ScriptableObject;

import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.json.Json;

import java.io.IOException;
import java.util.Map;

public class CompiledAtomsNotLeakingTest {

  private static final String RESOURCE_PATH = "/org/openqa/selenium/atoms/execute_script.js";

  private static String fragment;

  private ScriptableObject global;

  @BeforeClass
  public static void loadFragment() throws IOException {
    fragment = JavaScriptLoader.loadResource(RESOURCE_PATH);
  }

  @Before
  public void prepareGlobalObject() {
    ContextFactory.getGlobal().call(context -> {
      global = context.initStandardObjects();
      global.defineProperty("_", 1234, ScriptableObject.EMPTY);
      assertThat(eval(context, "_")).isEqualTo(1234);

      // We're using the //javascript/webdriver/atoms:execute_script atom,
      // which assumes it is used in the context of a browser window, so make
      // sure the "window" free variable is defined and refers to the global
      // context.
      assertThat(eval(context, "this.window=this;")).isEqualTo(global);
      assertThat(eval(context, "this")).isEqualTo(global);
      assertThat(eval(context, "window")).isEqualTo(global);
      assertThat(eval(context, "this === window")).isEqualTo(true);

      return null;
    });
  }

  /** https://github.com/SeleniumHQ/selenium-google-code-issue-archive/issues/1333 */
  @Test
  public void fragmentWillNotLeakVariablesToEnclosingScopes() {
    ContextFactory.getGlobal().call(context -> {
      eval(context, "(" + fragment + ")()", RESOURCE_PATH);
      assertThat(eval(context, "_")).isEqualTo(1234);

      eval(context, "(" + fragment + ").call(this)", RESOURCE_PATH);
      assertThat(eval(context, "_")).isEqualTo(1234);

      eval(context, "(" + fragment + ").apply(this,[])", RESOURCE_PATH);
      assertThat(eval(context, "_")).isEqualTo(1234);

      eval(context, "(" + fragment + ").call(null)", RESOURCE_PATH);
      assertThat(eval(context, "_")).isEqualTo(1234);

      eval(context, "(" + fragment + ").apply(null,[])", RESOURCE_PATH);
      assertThat(eval(context, "_")).isEqualTo(1234);

      eval(context, "(" + fragment + ").call({})", RESOURCE_PATH);
      assertThat(eval(context, "_")).isEqualTo(1234);
      return null;
    });
  }

  @Test
  public void nestedFragmentsShouldNotLeakVariables() {
    ContextFactory.getGlobal().call(context -> {
      // executeScript atom recursing on itself to execute "return 1+2".
      // Should result in {status:0,value:{status:0,value:3}}
      // Global scope should not be modified.
      String nestedScript = String.format("(%s).call(null, %s, ['return 1+2;'], true)",
          fragment, fragment);

      String jsonResult = (String) eval(context, nestedScript, RESOURCE_PATH);

      Map<String, Object> result = new Json().toType(jsonResult, Json.MAP_TYPE);

      assertThat(result.get("status")).isInstanceOf(Long.class).as(jsonResult).isEqualTo(0L);
      assertThat(result.get("value")).isInstanceOf(Map.class);
      assertThat(result.get("value"))
          .asInstanceOf(MAP)
          .hasSize(2)
          .containsEntry("status", 0L)
          .containsEntry("value", 3L);

      assertThat(eval(context, "_")).isEqualTo(1234);
      return null;
    });
  }

  private Object eval(Context context, String script) {
    return eval(context, script, "");
  }

  private Object eval(Context context, String script, String src) {
    return context.evaluateString(global, script, src, 1, null);
  }
}
