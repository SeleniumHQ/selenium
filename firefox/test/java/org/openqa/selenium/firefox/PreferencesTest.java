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
