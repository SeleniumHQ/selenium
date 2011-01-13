/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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

package org.openqa.selenium.android.util;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.android.AndroidWebElement;
import org.openqa.selenium.internal.WrapsElement;

import java.util.Collection;

/**
 * Utility class for Javascript handling.
 */
public class JsUtil {

  /**
   * Converts the given arguments into Javascript arguments.
   *
   * @param arg can be either of type {@link Boolean}, {@link Number}, or {@link String}, throws
   *            {@IllegalArgumentException } otherwise.
   * @return the converted object.
   */
  public static Object convertArgumentToJsObject(Object arg) {
    // TODO(berrada): Too loose. We should check for Set or List (because Map is different)
    if (arg instanceof Collection) {
      StringBuilder s = new StringBuilder();
      s.append("[");
      for (Object o : (Collection) arg) {
        s.append(convertArgumentToJsObject(o)).append(",");
      }
      s.append("]");
      return s.toString();
    } else if (arg instanceof WrapsElement) {
      WebElement wrapped = ((WrapsElement) arg).getWrappedElement();
      if (wrapped instanceof AndroidWebElement) {
        return convertWebElementToJavaScript((AndroidWebElement) wrapped);
      }
    } else if (arg instanceof AndroidWebElement) {
      return convertWebElementToJavaScript((AndroidWebElement) arg);
    } else if (arg instanceof Number) {
      return String.valueOf(arg);
    } else if (arg instanceof Boolean) {
      return Boolean.toString((Boolean) arg);
    } else if (arg instanceof String) {
      return escapeQuotes(arg.toString());
    }

    throw new IllegalArgumentException(
        "Argument must be a number, a boolean, a string, a array, a collection, a WebElement: "
            + arg + " is of type " + arg.getClass());
  }

  private static String convertWebElementToJavaScript(AndroidWebElement element) {
    return "window.document.documentElement.androiddriver_elements[" + element.getElementId() + "]";
  }

  /**
   * Escapes string as follow:
   *
   * Strings with both quotes and ticks into: foo'"bar -> "foo'" + '"' + "bar"
   *
   * String with just a quote into being single quoted: f"oo -> 'f"oo'
   *
   * Simple string into being double quotes: foo -> "foo"
   *
   * @return a string
   */
  public static String escapeQuotes(String toEscape) {
    // Convert strings with both quotes and ticks into: foo'"bar -> "foo'" + '"' + "bar"
    if (toEscape.indexOf("\"") > -1 && toEscape.indexOf("'") > -1) {
      boolean quotedIsLast = false;
      if (toEscape.indexOf("\"") == toEscape.length() - 1) {
        quotedIsLast = true;
      }
      String[] substrings = toEscape.split("\"");
      StringBuilder quoted = new StringBuilder("");
      for (int i = 0; i < substrings.length - 1; i++) {
        quoted.append("\"").append(substrings[i]).append("\"");
        quoted.append(" + '\"' + ");
      }
      quoted.append("\"").append(substrings[substrings.length - 1]).append("\"");
      if (quotedIsLast) {
        quoted.append(" + '\"'");
      }
      quoted.trimToSize();
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
