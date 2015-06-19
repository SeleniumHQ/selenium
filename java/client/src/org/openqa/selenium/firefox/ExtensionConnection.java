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

package org.openqa.selenium.firefox;

import org.openqa.selenium.logging.NeedsLocalLogs;
import org.openqa.selenium.remote.CommandExecutor;

import java.io.IOException;
import java.net.URI;

/**
 * Represents a connection with the FirefoxDriver browser extension.
 */
public interface ExtensionConnection extends CommandExecutor, NeedsLocalLogs {

  /**
   * Establishes a connection to the extension.
   *
   * @throws IOException If an I/O error occurs.
   */
  void start() throws IOException;

  /**
   * @return Whether the extension is reachable and accepting requests.
   */
  boolean isConnected();

  /**
   * Terminates the connection.
   */
  void quit();

  /**
   * @return The address of the remote server.
   */
  URI getAddressOfRemoteServer();
}
