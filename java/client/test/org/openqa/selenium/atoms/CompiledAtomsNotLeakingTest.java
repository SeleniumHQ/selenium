/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.selenium.atoms;

import static org.junit.Assert.assertEquals;

import org.openqa.selenium.Build;
import org.openqa.selenium.testing.InProject;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import net.sourceforge.htmlunit.corejs.javascript.Context;
import net.sourceforge.htmlunit.corejs.javascript.ContextAction;
import net.sourceforge.htmlunit.corejs.javascript.ContextFactory;
import net.sourceforge.htmlunit.corejs.javascript.ScriptableObject;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.BlockJUnit4ClassRunner;

import java.io.File;
import java.io.IOException;

@RunWith(BlockJUnit4ClassRunner.class)
public class CompiledAtomsNotLeakingTest {

  private static final String FRAGMENT_TASK = "//javascript/webdriver/atoms:execute_script";
  private static final String FRAGMENT_PATH =
      "build/javascript/webdriver/atoms/execute_script.js";

  private static String fragment;

  private ScriptableObject global;

  @BeforeClass
  public static void loadFragment() throws IOException {
    File topDir = InProject.locate("Rakefile").getParentFile();
    File atomFile = new File(topDir, FRAGMENT_PATH);
    if (!atomFile.exists()) {
      new Build().of(FRAGMENT_TASK).go();
    }
    fragment = Files.toString(atomFile, Charsets.UTF_8);
  }

  @Before
  public void prepareGlobalObject() {
    ContextFactory.getGlobal().call(new ContextAction() {
      public Object run(Context context) {
        global = context.initStandardObjects();
        global.defineProperty("_", 1234, ScriptableObject.EMPTY);
        assertEquals(1234, eval(context, "_"));

        // We're using the //javascript/webdriver/atoms:execute_script atom,
        // which assumes it is used in the context of a browser window, so make
        // sure the "window" free variable is defined and refers to the global
        // context.
        assertEquals(global, eval(context, "this.window=this;"));
        assertEquals(global, eval(context, "this"));
        assertEquals(global, eval(context, "window"));
        assertEquals(true, eval(context, "this === window"));

        return null;
      }
    });
  }

  /** http://code.google.com/p/selenium/issues/detail?id=1333 */
  @Test
  public void fragmentWillNotLeakVariablesToEnclosingScopes() {
    ContextFactory.getGlobal().call(new ContextAction() {
      public Object run(Context context) {
        eval(context, "(" + fragment + ")()", FRAGMENT_PATH);
        assertEquals(1234, eval(context, "_"));

        eval(context, "(" + fragment + ").call(this)", FRAGMENT_PATH);
        assertEquals(1234, eval(context, "_"));

        eval(context, "(" + fragment + ").apply(this,[])", FRAGMENT_PATH);
        assertEquals(1234, eval(context, "_"));

        eval(context, "(" + fragment + ").call(null)", FRAGMENT_PATH);
        assertEquals(1234, eval(context, "_"));

        eval(context, "(" + fragment + ").apply(null,[])", FRAGMENT_PATH);
        assertEquals(1234, eval(context, "_"));

        eval(context, "(" + fragment + ").call({})", FRAGMENT_PATH);
        assertEquals(1234, eval(context, "_"));
        return null;
      }
    });
  }

  @Test
  public void nestedFragmentsShouldNotLeakVariables() {
    ContextFactory.getGlobal().call(new ContextAction() {
      public Object run(Context context) {
        // executeScript atom recursing on itself to execute "return 1+2".
        // Should result in {status:0,value:{status:0,value:3}}
        // Global scope should not be modified.
        String nestedScript = String.format("(%s).call(null, %s, ['return 1+2;'], true)",
            fragment, fragment);

        String jsonResult = eval(context, nestedScript, FRAGMENT_PATH);

        try {
          JSONObject result = new JSONObject(jsonResult);

          assertEquals(jsonResult, 0, result.getInt("status"));

          result = result.getJSONObject("value");
          assertEquals(jsonResult, 0, result.getInt("status"));
          assertEquals(jsonResult, 3, result.getInt("value"));

        } catch (JSONException e) {
          throw new RuntimeException("JSON result was: " + jsonResult, e);
        }

        assertEquals(1234, eval(context, "_"));
        return null;
      }
    });
  }

  @SuppressWarnings({"unchecked"})
  private <T> T eval(Context context, String script) {
    return (T) eval(context, script, "");
  }

  @SuppressWarnings({"unchecked"})
  private <T> T eval(Context context, String script, String src) {
    return (T) context.evaluateString(global, script, src, 1, null);
  }
}
