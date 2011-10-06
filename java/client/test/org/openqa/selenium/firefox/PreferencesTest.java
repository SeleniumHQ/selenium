/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium.firefox;

import junit.framework.TestCase;

import java.io.Reader;
import java.io.StringReader;

public class PreferencesTest extends TestCase {

  public void testStringifyVsStringFormat() {
    assertEquals("\"stringifyMe\"", String.format("\"%s\"", "stringifyMe"));
  }


  public void testStringFormatOfStringify() {
    assertEquals("\"\"stringifyMe\"\"", String.format("\"%s\"", "\"stringifyMe\""));
  }

  public void testDetectStringification() {
    Preferences a = new Preferences();

    assertFalse("Empty String", canSet(a, "\"\""));
    assertFalse("Valid stringified string", canSet(a, ("\"Julian\"")));
    assertTrue("Only start is stringified", canSet(a, ("\"StartOnly")));
    assertTrue("Only end is stringified", canSet(a, ("EndOnly\"")));
    assertFalse("Using String.format(\"%%s\")",
        canSet(a, (String.format("\"%s\"", "FormatMe"))));

    assertFalse("Stringified string containing extra double-quotes",
        canSet(a, ("\"Julian\" \"TestEngineer\" Harty.\"")));

  }

  public void testParsePreferences_boolean() {
    StringReader lines = new StringReader("user_pref(\"extensions.update.notifyUser\", false);");
    Preferences prefs = new Preferences(lines);

    assertEquals(false, prefs.getPreference("extensions.update.notifyUser"));
  }

  public void testParsePreferences_integer() {
    StringReader lines = new StringReader("user_pref(\"dom.max_script_run_time\", 30);");
    Preferences prefs = new Preferences(lines);

    assertEquals(30, prefs.getPreference("dom.max_script_run_time"));
  }

  public void testParsePreferences_string() {
    String prefWithComma = "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_1 like Mac OS X; en-us) "
        + "AppleWebKit/532.9 (KHTML, like Gecko)";
    String prefWithQuotes = "lpr ${MOZ_PRINTER_NAME:+-P\"$MOZ_PRINTER_NAME\"}";

    Reader lines = new StringReader(
        "user_pref(\"general.useragent.override\", \"" + prefWithComma + "\");\n" +
            "user_pref(\"print.print_command\", \"" + prefWithQuotes + "\");");
    Preferences prefs = new Preferences(lines);

    assertEquals(prefWithComma, prefs.getPreference("general.useragent.override"));
    assertEquals(prefWithQuotes, prefs.getPreference("print.print_command"));
  }

  public void testParsePreferences_multiline() {
    Reader lines = new StringReader(
        "user_pref(\"extensions.update.notifyUser\", false);\n" +
            "user_pref(\"dom.max_script_run_time\", 30);");
    Preferences prefs = new Preferences(lines);

    assertEquals(false, prefs.getPreference("extensions.update.notifyUser"));
    assertEquals(30, prefs.getPreference("dom.max_script_run_time"));
  }


  private boolean canSet(Preferences pref, String value) {
    try {
      pref.setPreference("key", value);
      return true;
    } catch (IllegalArgumentException e) {
      return false;
    }
  }
}
