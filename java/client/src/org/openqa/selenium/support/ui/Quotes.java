package org.openqa.selenium.support.ui;

public class Quotes {

  /**
   * Convert strings with both quotes and ticks into: foo'"bar -> concat("foo'", '"', "bar")
   * 
   * @param toEscape a text to escape quotes in, e.g. "f'oo"
   * @return the same text with escaped quoted, e.g. "\"f'oo\""
   */
  public static String escape(String toEscape) {
    if (toEscape.contains("\"") && toEscape.contains("'")) {
      boolean quoteIsLast = false;
      if (toEscape.lastIndexOf("\"") == toEscape.length() - 1) {
        quoteIsLast = true;
      }
      String[] substringsWithoutQuotes = toEscape.split("\"");

      StringBuilder quoted = new StringBuilder("concat(");
      for (int i = 0; i < substringsWithoutQuotes.length; i++) {
        quoted.append("\"").append(substringsWithoutQuotes[i]).append("\"");
        quoted
            .append(((i == substringsWithoutQuotes.length - 1) ? (quoteIsLast ? ", '\"')" : ")")
                                                           : ", '\"', "));
      }
      return quoted.toString();
    }

    // Escape string with just a quote into being single quoted: f"oo -> 'f"oo'
    if (toEscape.contains("\"")) {
      return String.format("'%s'", toEscape);
    }

    // Otherwise return the quoted string
    return String.format("\"%s\"", toEscape);
  }
}
