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
