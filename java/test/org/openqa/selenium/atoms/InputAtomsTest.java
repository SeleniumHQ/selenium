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

import java.io.IOException;
import net.sourceforge.htmlunit.corejs.javascript.Context;
import net.sourceforge.htmlunit.corejs.javascript.ContextAction;
import net.sourceforge.htmlunit.corejs.javascript.ContextFactory;
import net.sourceforge.htmlunit.corejs.javascript.ScriptableObject;
import org.junit.jupiter.api.Test;

/** Sanity tests against the //javascript/webdriver/atoms:inputs target. */
class InputAtomsTest {

  private static final String RESOURCE_PATH = "/org/openqa/selenium/atoms/atoms_inputs.js";

  @Test
  void exportsTheExpectedNames() throws IOException {
    final String source = JavaScriptLoader.loadResource(RESOURCE_PATH);
    ContextFactory.getGlobal()
        .call(
            new ContextAction<Object>() {
              private ScriptableObject global;

              @Override
              public Object run(Context context) {
                global = context.initStandardObjects();

                // Check assumptions abut the global context, which the atoms assume is a DOM
                // window.
                assertThat(eval(context, "this.window=this;")).isEqualTo(global);
                assertThat(eval(context, "this")).isEqualTo(global);
                assertThat(eval(context, "window")).isEqualTo(global);
                assertThat(eval(context, "this === window")).isEqualTo(true);

                eval(context, source, RESOURCE_PATH);

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
                assertThat(eval(context, "typeof " + property))
                    .describedAs(property)
                    .isEqualTo("function");
              }

              private Object eval(Context context, String script) {
                return eval(context, script, "");
              }

              private Object eval(Context context, String script, String src) {
                return context.evaluateString(global, script, src, 1, null);
              }
            });
  }
}
