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

/**
 * <p>
 * Provides a <code>doCommand</code> method, which sends the command to the browser to be performed.
 * </p>
 *
 *
 * @author Paul Hammant
 * @version $Revision$
 * @deprecated The RC interface will be removed in Selenium 3.0. Please migrate to using WebDriver.
 */
@Deprecated
public interface CommandProcessor {

  /**
   * The URL that the RemoteControl instance is allegedly running on
   *
   * @return the URL
   */
  String getRemoteControlServerLocation();

  /**
   * Send the specified remote command to the browser to be performed
   *
   * @param command - the remote command verb
   * @param args - the arguments to the remote command (depends on the verb)
   * @return - the command result, defined by the remote JavaScript. "getX" style commands may
   *         return data from the browser; other "doX" style commands may just return "OK" or an
   *         error message.
   */
  String doCommand(String command, String[] args);

  /**
   * Sets extension Javascript for the session
   *
   * @param extensionJs extension javascript
   */
  void setExtensionJs(String extensionJs);

  /** Starts a new Selenium testing session */
  void start();

  /** Starts a new Selenium testing session with a String, representing a configuration
   * @param optionsString option string
   */
  void start(String optionsString);

  /** Starts a new Selenium testing session with a configuration options object
   * @param optionsObject options object
   */
  void start(Object optionsObject);

  /** Ends the current Selenium testing session (normally killing the browser) */
  void stop();

  String getString(String string, String[] strings);

  String[] getStringArray(String string, String[] strings);

  Number getNumber(String string, String[] strings);

  Number[] getNumberArray(String string, String[] strings);

  boolean getBoolean(String string, String[] strings);

  boolean[] getBooleanArray(String string, String[] strings);
}
