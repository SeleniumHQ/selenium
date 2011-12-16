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

/**
 * Represents a single remote action
 * 
 * @version $Id: $
 */
public interface RemoteCommand {
  /**
   * Return the URL query string which will be sent to the browser
   */
  String getCommandURLString();

  String getCommand();

  String getField();

  String getValue();

  // In proxy injection mode, the selenium JavaScript cannot maintain its own state because it is
  // part of the test application window, and therefore can and will be reloaded at any time.
  // Therefore some state is maintained on the selenium server, and is sent along with each
  // command. This state is kept in the following field:
  String getPiggybackedJavaScript();
}
