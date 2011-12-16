/*
 * Copyright 2011 Software Freedom Conservancy.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package org.openqa.selenium.server;

import org.openqa.selenium.net.Urls;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * The default implementation of the RemoteCommand interface
 * 
 * @author Paul Hammant
 * @version $Revision: 184 $
 */
public class DefaultRemoteCommand implements RemoteCommand {
  private final String command;
  private final String field;
  private final String value;
  private final String piggybackedJavaScript;
  private final Pattern JSON_ESCAPABLES = Pattern.compile("([\\\\\"'\b\f\n\r\t])");


  public DefaultRemoteCommand(String command, String field, String value) {
    this.command = command;
    this.field = field;
    this.value = value;
    this.piggybackedJavaScript = null;
  }

  public DefaultRemoteCommand(String command, String field, String value,
      String piggybackedJavaScript) {
    this.command = command;
    this.field = field;
    this.value = value;
    if (piggybackedJavaScript != null && !"".equals(piggybackedJavaScript)) {
      this.piggybackedJavaScript = piggybackedJavaScript;
    } else {
      this.piggybackedJavaScript = null;
    }
  }

  public String getCommandURLString() {
    return "cmd=" + Urls.urlEncode(command) + "&1=" + Urls.urlEncode(field) + "&2=" +
        Urls.urlEncode(value);
  }

  public String getJSONString() {
    String rest = "";
    if (piggybackedJavaScript != null) {
      rest = ",rest:\"" + escapeJSON(piggybackedJavaScript) + "\"";
    }
    return "json={command:\"" + escapeJSON(command)
        + "\",target:\"" + escapeJSON(field)
        + "\",value:\"" + escapeJSON(value)
        + "\""
        + rest + "}";
  }

  private String escapeJSON(String s) {
    // TODO use a real JSON library (but it should be Apache licensed and less than 1.4 megs
    // including deps!)
    Matcher m = JSON_ESCAPABLES.matcher(s);
    boolean result = m.find();
    if (result) {
      StringBuffer sb = new StringBuffer();
      do {
        String val = m.group(1);
        if (val.length() != 1) {
          throw new RuntimeException("Bug! matcher matched >1 char: <" +
              val + ">: " + s);
        }
        char c = val.charAt(0);
        switch (c) {
          case '\\':
            m.appendReplacement(sb, "\\\\\\\\");
            break;
          case '"':
            m.appendReplacement(sb, "\\\\\"");
            break;
          case '\'':
            m.appendReplacement(sb, "\\\\'");
            break;
          case '\b':
            m.appendReplacement(sb, "\\\\b");
            break;
          case '\f':
            m.appendReplacement(sb, "\\\\f");
            break;
          case '\n':
            m.appendReplacement(sb, "\\\\n");
            break;
          case '\r':
            m.appendReplacement(sb, "\\\\r");
            break;
          case '\t':
            m.appendReplacement(sb, "\\\\t");
            break;
          default:
            throw new RuntimeException("Bug! matcher matched unexpected char: <" + c + "> " + s);
        }
        result = m.find();
      } while (result);
      m.appendTail(sb);
      return sb.toString();
    }
    return s;
  }

  public String getCommand() {
    return command;
  }

  public String getField() {
    return field;
  }

  public String getValue() {
    return value;
  }

  @Override
  public String toString() {
    return getJSONString();
  }

  @Override
  public boolean equals(Object obj) {
    if (!(obj instanceof RemoteCommand)) {
      return false;
    }
    return toString().equals(obj.toString());
  }


  @Override
  public int hashCode() {
    return toString().hashCode();
  }

  /**
   * Factory method to create a RemoteCommand from a wiki-style input string
   */
  public static RemoteCommand parse(String inputLine) {
    if (inputLine == null) throw new NullPointerException("inputLine must not be null");
    inputLine = inputLine.trim();
    // TODO use a real JSON library (but it should be Apache licensed and less than 1.4 megs
    // including deps!)
    final String prefix = "json={command:\"";
    if (!inputLine.startsWith(prefix))
      throw new IllegalArgumentException("invalid command string, missing '" + prefix + "'=" +
          inputLine);
    int index = prefix.length();
    int hackToPassByReference[] = new int[1];
    hackToPassByReference[0] = index;
    String command = parseJSONString(inputLine, hackToPassByReference);
    index = hackToPassByReference[0] + 1;
    final String targetDelim = ",target:\"";
    if (!(inputLine.length() > index + targetDelim.length()))
      throw new IllegalArgumentException("invalid command string, missing '" + targetDelim + "'=" +
          inputLine);
    if (!inputLine.substring(index, index + targetDelim.length()).equals(targetDelim))
      throw new IllegalArgumentException("invalid command string, missing '" + targetDelim + "'=" +
          inputLine);
    index += targetDelim.length();
    hackToPassByReference[0] = index;
    String target = parseJSONString(inputLine, hackToPassByReference);
    index = hackToPassByReference[0] + 1;
    final String valueDelim = ",value:\"";
    if (!(inputLine.length() > index + valueDelim.length()))
      throw new IllegalArgumentException("invalid command string, missing '" + valueDelim + "'=" +
          inputLine);
    if (!inputLine.substring(index, index + valueDelim.length()).equals(valueDelim))
      throw new IllegalArgumentException("invalid command string, missing '" + valueDelim + "'=" +
          inputLine);
    index += valueDelim.length();
    hackToPassByReference[0] = index;
    String value = parseJSONString(inputLine, hackToPassByReference);
    index = hackToPassByReference[0] + 1;
    final String restDelim = ",rest:\"";
    if (!(inputLine.length() > index + restDelim.length())) {
      return new DefaultRemoteCommand(command, target, value);
    }
    if (!inputLine.substring(index, index + restDelim.length()).equals(restDelim))
      throw new IllegalArgumentException("invalid command string, missing '" + restDelim + "'=" +
          inputLine);
    index += restDelim.length();
    hackToPassByReference[0] = index;
    String rest = parseJSONString(inputLine, hackToPassByReference);
    return new DefaultRemoteCommand(command, target, value, rest);
  }

  private static String parseJSONString(String inputLine, int[] hackToPassByReference) {
    int index = hackToPassByReference[0];
    StringBuffer sb = new StringBuffer();
    boolean finished = false;
    for (; index < inputLine.length(); index++) {
      char c = inputLine.charAt(index);
      if ('"' == c) {
        finished = true;
        break;
      }
      if ('\\' == c) {
        c = inputLine.charAt(++index);
        switch (c) {
          case 'b':
            sb.append('\b');
            break;
          case 'f':
            sb.append('\f');
            break;
          case 'n':
            sb.append('\n');
            break;
          case 'r':
            sb.append('\r');
            break;
          case 't':
            sb.append('\t');
            break;
          case 'u':
            String fourHexDigits = inputLine.substring(index + 1, index + 5);
            c = (char) Integer.parseInt(fourHexDigits, 16);
            sb.append(c);
            index += 4;
            break;
          default:
            // probably \ or "
            sb.append(c);
        }
      } else {
        sb.append(c);
      }
    }
    if (!finished) {
      throw new IllegalArgumentException("Invalid JSON string, quote never terminated: " +
          inputLine);
    }
    hackToPassByReference[0] = index;
    return sb.toString();
  }

  public String getPiggybackedJavaScript() {
    return piggybackedJavaScript;
  }
}
