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
    assertFalse("Valid stringified string", canSet(a,("\"Julian\"")));
    assertTrue("Only start is stringified", canSet(a,("\"StartOnly")));
    assertTrue("Only end is stringified", canSet(a,("EndOnly\"")));
    assertFalse("Using String.format(\"%%s\")",
               canSet(a,(String.format("\"%s\"", "FormatMe"))));

    assertFalse("Stringified string containing extra double-quotes",
               canSet(a,("\"Julian\" \"TestEngineer\" Harty.\"")));

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
