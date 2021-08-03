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
package org.openqa.selenium.server.htmlrunner;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.io.Writer;
import java.net.URLDecoder;
import java.text.MessageFormat;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;

/**
 * A data model class for the results of the Selenium HTMLRunner (aka TestRunner, FITRunner)
 *
 * @author Darren Cotterill
 * @author Ajit George
 */
public class HTMLTestResults {
  private final String result;
  private final String totalTime;
  private final String numTestTotal;
  private final String numTestPasses;
  private final String numTestFailures;
  private final String numCommandPasses;
  private final String numCommandFailures;
  private final String numCommandErrors;
  private final String seleniumVersion;
  private final String seleniumRevision;
  private final String log;
  private final HTMLSuiteResult suite;

  private static final String HEADER = "<html>\n" +
      "<head><style type='text/css'>\n" +
      "body, table {\n" +
      "    font-family: Verdana, Arial, sans-serif;\n" +
      "    font-size: 12;\n" +
      "}\n" +
      "\n" +
      "table {\n" +
      "    border-collapse: collapse;\n" +
      "    border: 1px solid #ccc;\n" +
      "}\n" +
      "\n" +
      "th, td {\n" +
      "    padding-left: 0.3em;\n" +
      "    padding-right: 0.3em;\n" +
      "}\n" +
      "\n" +
      "a {\n" +
      "    text-decoration: none;\n" +
      "}\n" +
      "\n" +
      ".title {\n" +
      "    font-style: italic;\n" +
      "}\n" +
      "\n" +
      ".selected {\n" +
      "    background-color: #ffffcc;\n" +
      "}\n" +
      "\n" +
      ".status_done {\n" +
      "    background-color: #eeffee;\n" +
      "}\n" +
      "\n" +
      ".status_passed {\n" +
      "    background-color: #ccffcc;\n" +
      "}\n" +
      "\n" +
      ".status_failed {\n" +
      "    background-color: #ffcccc;\n" +
      "}\n" +
      "\n" +
      ".breakpoint {\n" +
      "    background-color: #cccccc;\n" +
      "    border: 1px solid black;\n" +
      "}\n" +
      "</style><title>Test suite results</title></head>\n" +
      "<body>\n<h1>Test suite results </h1>";
  private static final String SUMMARY_HTML =
      "\n\n<table>\n" +
      "<tr>\n<td>result:</td>\n<td>{0}</td>\n</tr>\n" +
      "<tr>\n<td>totalTime:</td>\n<td>{1}</td>\n</tr>\n" +
      "<tr>\n<td>numTestTotal:</td>\n<td>{2}</td>\n</tr>\n" +
      "<tr>\n<td>numTestPasses:</td>\n<td>{3}</td>\n</tr>\n" +
      "<tr>\n<td>numTestFailures:</td>\n<td>{4}</td>\n</tr>\n" +
      "<tr>\n<td>numCommandPasses:</td>\n<td>{5}</td>\n</tr>\n" +
      "<tr>\n<td>numCommandFailures:</td>\n<td>{6}</td>\n</tr>\n" +
      "<tr>\n<td>numCommandErrors:</td>\n<td>{7}</td>\n</tr>\n" +
      "<tr>\n<td>Selenium Version:</td>\n<td>{8}</td>\n</tr>\n" +
      "<tr>\n<td>Selenium Revision:</td>\n<td>{9}</td>\n</tr>\n" +
      "<tr>\n<td>{10}</td>\n<td>&nbsp;</td>\n</tr>\n</table>";

  private static final String SUITE_HTML =
      "<tr>\n<td><a name=\"testresult{0}\">{1}</a><br/>{2}</td>\n<td>&nbsp;</td>\n</tr>";

  private final List<String> testTables;

  public HTMLTestResults(String postedSeleniumVersion, String postedSeleniumRevision,
      String postedResult, String postedTotalTime,
      String postedNumTestTotal, String postedNumTestPasses,
      String postedNumTestFailures, String postedNumCommandPasses, String postedNumCommandFailures,
      String postedNumCommandErrors, String postedSuite, List<String> postedTestTables,
      String postedLog) {

    result = postedResult;
    numCommandFailures = postedNumCommandFailures;
    numCommandErrors = postedNumCommandErrors;
    suite = new HTMLSuiteResult(postedSuite);
    totalTime = postedTotalTime;
    numTestTotal = postedNumTestTotal;
    numTestPasses = postedNumTestPasses;
    numTestFailures = postedNumTestFailures;
    numCommandPasses = postedNumCommandPasses;
    testTables = postedTestTables;
    seleniumVersion = postedSeleniumVersion;
    seleniumRevision = postedSeleniumRevision;
    log = postedLog;
  }


  public String getResult() {
    return result;
  }

  public String getNumCommandErrors() {
    return numCommandErrors;
  }

  public String getNumCommandFailures() {
    return numCommandFailures;
  }

  public String getNumCommandPasses() {
    return numCommandPasses;
  }

  public String getNumTestFailures() {
    return numTestFailures;
  }

  public String getNumTestPasses() {
    return numTestPasses;
  }

  public Collection<String> getTestTables() {
    return testTables;
  }

  public String getTotalTime() {
    return totalTime;
  }

  public int getNumTotalTests() {
    return Integer.parseInt(numTestPasses) + Integer.parseInt(numTestFailures);
  }

  public void write(Writer out) throws IOException {
    out.write(HEADER);
    out.write(MessageFormat.format(SUMMARY_HTML,
        result,
        totalTime,
        numTestTotal,
        numTestPasses,
        numTestFailures,
        numCommandPasses,
        numCommandFailures,
        numCommandErrors,
        seleniumVersion,
        seleniumRevision,
        suite.getUpdatedSuite()));
    out.write("<table>");
    for (int i = 0; i < testTables.size(); i++) {
      String table = testTables.get(i).replace("\u00a0", "&nbsp;");
      out.write(MessageFormat.format(SUITE_HTML, i, suite.getHref(i), table));
    }
    out.write("</table><pre>\n");
    if (log != null) {
      out.write(quoteCharacters(log));
    }
    out.write("</pre></body></html>");
    out.flush();
  }

  public static String quoteCharacters(String s) {
    StringBuffer result = null;
    for (int i = 0, max = s.length(), delta = 0; i < max; i++) {
      char c = s.charAt(i);
      String replacement = null;

      if (c == '&') {
        replacement = "&amp;";
      } else if (c == '<') {
        replacement = "&lt;";
      } else if (c == '>') {
        replacement = "&gt;";
      } else if (c == '"') {
        replacement = "&quot;";
      } else if (c == '\'') {
        replacement = "&apos;";
      }

      if (replacement != null) {
        if (result == null) {
          result = new StringBuffer(s);
        }
        result.replace(i + delta, i + delta + 1, replacement);
        delta += (replacement.length() - 1);
      }
    }
    if (result == null) {
      return s;
    }
    return result.toString();
  }

  class UrlDecoder {

    public String decode(String string) {
      try {
        return URLDecoder.decode(string, System.getProperty("file.encoding"));
      } catch (UnsupportedEncodingException e) {
        return string;
      }
    }

    public List<String> decodeListOfStrings(List<String> list) {
      List<String> decodedList = new LinkedList<>();

      for (String o : list) {
        decodedList.add(decode(o));
      }

      return decodedList;
    }
  }
}
