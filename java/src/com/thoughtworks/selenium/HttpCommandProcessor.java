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

package com.thoughtworks.selenium;

import static java.nio.charset.StandardCharsets.UTF_8;

import org.openqa.selenium.net.Urls;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.Writer;
import java.net.ConnectException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Sends commands and retrieves results via HTTP.
 *
 * @author Ben Griffiths, Jez Humble
 * @deprecated The RC interface will be removed in Selenium 3.0. Please migrate to using WebDriver.
 */
@Deprecated
public class HttpCommandProcessor implements CommandProcessor {

  private String pathToServlet;
  private String browserStartCommand;
  private String browserURL;
  private String sessionId;
  private String extensionJs;
  private String rcServerLocation;

  /**
   * Specifies a server host/port, a command to launch the browser, and a starting URL for the
   * browser.
   *
   * @param serverHost - the host name on which the Selenium Server resides
   * @param serverPort - the port on which the Selenium Server is listening
   * @param browserStartCommand - the command string used to launch the browser, e.g. "*firefox" or
   *        "c:\\program files\\internet explorer\\iexplore.exe"
   * @param browserURL - the starting URL including just a domain name. We'll start the browser
   *        pointing at the Selenium resources on this URL,
   */
  public HttpCommandProcessor(String serverHost, int serverPort, String browserStartCommand,
      String browserURL) {
    rcServerLocation = serverHost +
        ":" + Integer.toString(serverPort);
    this.pathToServlet = "http://" + rcServerLocation + "/selenium-server/driver/";
    this.browserStartCommand = browserStartCommand;
    this.browserURL = browserURL;
    this.extensionJs = "";
  }

  /**
   * Specifies the URL to the CommandBridge servlet, a command to launch the browser, and a starting
   * URL for the browser.
   *
   * @param pathToServlet - the URL of the Selenium Server Driver, e.g.
   *        "http://localhost:4444/selenium-server/driver/" (don't forget the final slash!)
   * @param browserStartCommand - the command string used to launch the browser, e.g. "*firefox" or
   *        "c:\\program files\\internet explorer\\iexplore.exe"
   * @param browserURL - the starting URL including just a domain name. We'll start the browser
   *        pointing at the Selenium resources on this URL,
   */
  public HttpCommandProcessor(String pathToServlet, String browserStartCommand, String browserURL) {
    this.pathToServlet = pathToServlet;
    this.browserStartCommand = browserStartCommand;
    this.browserURL = browserURL;
    this.extensionJs = "";
  }

  @Override
  public String getRemoteControlServerLocation() {
    return rcServerLocation;
  }

  @Override
  public String doCommand(String commandName, String[] args) {
    DefaultRemoteCommand command = new DefaultRemoteCommand(commandName, args);
    String result = executeCommandOnServlet(command.getCommandURLString());
    if (result == null) {
      throw new NullPointerException("Selenium Bug! result must not be null");
    }
    if (!result.startsWith("OK")) {
      return throwAssertionFailureExceptionOrError(result);
    }
    return result;
  }

  protected String throwAssertionFailureExceptionOrError(String message) {
    throw new SeleniumException(message);
  }

  /** Sends the specified command string to the bridge servlet
   * @param command command to execute
   * @return response from the command execution
   */
  public String executeCommandOnServlet(String command) {
    try {
      return getCommandResponseAsString(command);
    } catch (IOException e) {
      if (e instanceof ConnectException) {
        throw new SeleniumException(e.getMessage(), e);
      }
      e.printStackTrace();
      throw new UnsupportedOperationException("Catch body broken: IOException from " + command +
          " -> " + e, e);
    }
  }

  private String stringContentsOfInputStream(Reader rdr) throws IOException {
    StringBuffer sb = new StringBuffer();
    int c;
    try {
      while ((c = rdr.read()) != -1) {
        sb.append((char) c);
      }
      return sb.toString();
    } finally {
      rdr.close();
    }
  }

  // for testing
  protected HttpURLConnection getHttpUrlConnection(URL urlForServlet) throws IOException {
    return (HttpURLConnection) urlForServlet.openConnection();
  }

  // for testing
  protected Writer getOutputStreamWriter(HttpURLConnection conn) throws IOException {
    return new BufferedWriter(new OutputStreamWriter(conn.getOutputStream(), UTF_8));
  }

  // for testing
  protected Reader getInputStreamReader(HttpURLConnection conn) throws IOException {
    return new InputStreamReader(conn.getInputStream(), UTF_8);
  }

  // for testing
  protected int getResponseCode(HttpURLConnection conn) throws IOException {
    return conn.getResponseCode();
  }

  protected String getCommandResponseAsString(String command) throws IOException {
    String responseString = null;
    int responsecode = HttpURLConnection.HTTP_MOVED_PERM;
    HttpURLConnection uc = null;
    Writer wr = null;
    Reader rdr = null;
    while (responsecode == HttpURLConnection.HTTP_MOVED_PERM) {
      URL result = new URL(pathToServlet);
      String body = buildCommandBody(command);
      try {
        uc = getHttpUrlConnection(result);
        uc.setRequestProperty("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
        uc.setInstanceFollowRedirects(false);
        uc.setDoOutput(true);
        wr = getOutputStreamWriter(uc);
        wr.write(body);
        wr.flush();
        responsecode = getResponseCode(uc);
        if (responsecode == HttpURLConnection.HTTP_MOVED_PERM) {
          pathToServlet = uc.getHeaderField("Location");
        } else if (responsecode != HttpURLConnection.HTTP_OK) {
          throwAssertionFailureExceptionOrError(uc.getResponseMessage() + " URL: " + result);
        } else {
          rdr = getInputStreamReader(uc);
          responseString = stringContentsOfInputStream(rdr);
        }
      } finally {
        closeResources(uc, wr, rdr);
      }
    }
    return responseString;
  }

  protected void closeResources(HttpURLConnection conn, Writer wr, Reader rdr) {
    try {
      if (null != wr) {
        wr.close();
      }
    } catch (IOException ioe) {
      // ignore
    }

    try {
      if (null != rdr) {
        rdr.close();
      }
    } catch (IOException ioe) {
      // ignore
    }

    if (null != conn) {
      conn.disconnect();
    }
  }

  private String buildCommandBody(String command) {
    StringBuffer sb = new StringBuffer();
    sb.append(command);
    if (sessionId != null) {
      sb.append("&sessionId=");
      sb.append(Urls.urlEncode(sessionId));
    }
    return sb.toString();
  }

  /**
   * This should be invoked before start().
   *
   * @param extensionJs the extra extension Javascript to include in this browser session.
   */
  @Override
  public void setExtensionJs(String extensionJs) {
    this.extensionJs = extensionJs;
  }

  @Override
  public void start() {
    String result = getString("getNewBrowserSession",
        new String[] {browserStartCommand, browserURL, extensionJs});
    setSessionInProgress(result);
  }

  @Override
  public void start(String optionsString) {
    String result = getString("getNewBrowserSession",
        new String[] {browserStartCommand, browserURL,
            extensionJs, optionsString});
    setSessionInProgress(result);
  }

  /**
   * Wraps the version of start() that takes a String parameter, sending it the result of calling
   * toString() on optionsObject, which will likely be a BrowserConfigurationOptions instance.
   *
   * @param optionsObject start options
   */
  @Override
  public void start(Object optionsObject) {
    start(optionsObject.toString());
  }

  protected void setSessionInProgress(String result) {
    sessionId = result;
  }

  @Override
  public void stop() {
    if (hasSessionInProgress()) {
      doCommand("testComplete", new String[0]);
    }
    setSessionInProgress(null);
  }

  public boolean hasSessionInProgress() {
    return null != sessionId;
  }

  @Override
  public String getString(String commandName, String[] args) {
    String result = doCommand(commandName, args);
    if (result.length() >= "OK,".length()) {
      return result.substring("OK,".length());
    }
    System.err.println("WARNING: getString(" + commandName + ") saw a bad result " + result);
    return "";
  }

  @Override
  public String[] getStringArray(String commandName, String[] args) {
    String result = getString(commandName, args);
    return parseCSV(result);
  }

  /**
   * Convert backslash-escaped comma-delimited string into String array. As described in SRC-CDP
   * spec section 5.2.1.2, these strings are comma-delimited, but commas can be escaped with a
   * backslash "\". Backslashes can also be escaped as a double-backslash.
   *
   * @param input the unparsed string, e.g. "veni\, vidi\, vici,c:\\foo\\bar,c:\\I came\, I
   *        \\saw\\\, I conquered"
   * @return the string array resulting from parsing this string
   */
  public static String[] parseCSV(String input) {
    List<String> output = new ArrayList<>();
    StringBuffer sb = new StringBuffer();
    for (int i = 0; i < input.length(); i++) {
      char c = input.charAt(i);
      switch (c) {
        case ',':
          output.add(sb.toString());
          sb = new StringBuffer();
          continue;
        case '\\':
          i++;
          c = input.charAt(i);
          // fall through to:
        default:
          sb.append(c);
      }
    }
    output.add(sb.toString());
    return output.toArray(new String[output.size()]);
  }

  @Override
  public Number getNumber(String commandName, String[] args) {
    String result = getString(commandName, args);
    Number n;
    try {
      n = NumberFormat.getInstance().parse(result);
    } catch (ParseException e) {
      throw new RuntimeException(e);
    }
    if (n instanceof Long && n.intValue() == n.longValue()) {
      // SRC-315 we should return Integers if possible
      return Integer.valueOf(n.intValue());
    }
    return n;
  }

  @Override
  public Number[] getNumberArray(String commandName, String[] args) {
    String[] result = getStringArray(commandName, args);
    Number[] n = new Number[result.length];
    for (int i = 0; i < result.length; i++) {
      try {
        n[i] = NumberFormat.getInstance().parse(result[i]);
      } catch (ParseException e) {
        throw new RuntimeException(e);
      }
    }
    return n;
  }

  @Override
  public boolean getBoolean(String commandName, String[] args) {
    String result = getString(commandName, args);
    boolean b;
    if ("true".equals(result)) {
      b = true;
      return b;
    }
    if ("false".equals(result)) {
      b = false;
      return b;
    }
    throw new RuntimeException("result was neither 'true' nor 'false': " + result);
  }

  @Override
  public boolean[] getBooleanArray(String commandName, String[] args) {
    String[] result = getStringArray(commandName, args);
    boolean[] b = new boolean[result.length];
    for (int i = 0; i < result.length; i++) {
      if ("true".equals(result[i])) {
        b[i] = true;
        continue;
      }
      if ("false".equals(result[i])) {
        b[i] = false;
        continue;
      }
      throw new RuntimeException("result was neither 'true' nor 'false': " +
          Arrays.toString(result));
    }
    return b;
  }

}
