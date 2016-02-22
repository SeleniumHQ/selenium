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

import static org.junit.Assert.assertEquals;

import net.sourceforge.htmlunit.corejs.javascript.Context;
import net.sourceforge.htmlunit.corejs.javascript.ContextAction;
import net.sourceforge.htmlunit.corejs.javascript.ContextFactory;
import net.sourceforge.htmlunit.corejs.javascript.ScriptableObject;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import java.io.IOException;

/**
 * Sanity tests against the //javascript/webdriver/atoms:inputs target.
 */
@RunWith(JUnit4.class)
public class InputAtomsTest {

  private static final String RESOURCE_PATH = "/org/openqa/selenium/atoms/atoms_inputs.js";
  private static final String RESOURCE_TASK = "//javascript/webdriver/atoms:inputs";

  @Test
  public void exportsTheExpectedNames() throws IOException {
    final String source = JavaScriptLoader.loadResource(RESOURCE_PATH, RESOURCE_TASK);
    ContextFactory.getGlobal().call(new ContextAction() {
      private ScriptableObject global;

      @Override
      public Object run(Context context) {
        global = context.initStandardObjects();

        // Check assumptions abut the global context, which the atoms assumes is a DOM window.
        assertEquals(global, eval(context, "this.window=this;"));
        assertEquals(global, eval(context, "this"));
        assertEquals(global, eval(context, "window"));
        assertEquals(true, eval(context, "this === window"));

        eval(context, source, JavaScriptLoader.taskToBuildOutput(RESOURCE_TASK));

        assertFunction(context, "webdriver.atoms.inputs.sendKeys");
        assertFunction(context, "webdriver.atoms.inputs.click");
        assertFunction(context, "webdriver.atoms.inputs.mouseMove");
        assertFunction(context, "webdriver.atoms.inputs.mouseButtonDown");
        assertFunction(context, "webdriver.atoms.inputs.mouseButtonUp");
        assertFunction(context, "webdriver.atoms.inputs.doubleClick");
        assertFunction(context, "webdriver.atoms.inputs.rightClick");

        return null;
      }

      private void assertFunction(Context context, String property) {
        assertEquals(
            "Expected " + property + " to be a function",
            "function",
            eval(context, "typeof " + property));
      }

      @SuppressWarnings({"unchecked"})
      private <T> T eval(Context context, String script) {
        return (T) eval(context, script, "");
      }

      @SuppressWarnings({"unchecked"})
      private <T> T eval(Context context, String script, String src) {
        return (T) context.evaluateString(global, script, src, 1, null);
      }
    });
  }
}
