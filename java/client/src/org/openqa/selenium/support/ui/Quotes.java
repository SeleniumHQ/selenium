package org.openqa.selenium.support.ui;

public class Quotes {
  public static String escape(String toEscape) {
    // Convert strings with both quotes and ticks into: foo'"bar -> concat("foo'", '"', "bar")
    if (toEscape.indexOf("\"") > -1 && toEscape.indexOf("'") > -1) {
      boolean quoteIsLast = false;
      if (toEscape.lastIndexOf("\"") == toEscape.length() - 1) {
        quoteIsLast = true;
      }
      String[] substrings = toEscape.split("\"");

      StringBuilder quoted = new StringBuilder("concat(");
      for (int i = 0; i < substrings.length; i++) {
        quoted.append("\"").append(substrings[i]).append("\"");
        quoted
            .append(((i == substrings.length - 1) ? (quoteIsLast ? ", '\"')" : ")") : ", '\"', "));
      }
      return quoted.toString();
    }

    // Escape string with just a quote into being single quoted: f"oo -> 'f"oo'
    if (toEscape.indexOf("\"") > -1) {
      return String.format("'%s'", toEscape);
    }

    // Otherwise return the quoted string
    return String.format("\"%s\"", toEscape);
  }
}
