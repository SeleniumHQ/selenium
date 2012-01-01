/*
 Copyright 2011 Software Freedom Conservancy.

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

package org.openqa.selenium.remote.server.xdrpc;

import static com.google.common.base.Preconditions.checkNotNull;

import java.io.BufferedReader;
import java.io.Reader;
import java.io.StringReader;

/**
 * A cross-domain RPC that specifies a command to execute in the WebDriver
 * wire protocol.
 *
 * @see <a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol">
 *   WebDriver Wire Protocol</a>
 */
public class CrossDomainRpc {

  private final String method;
  private final String path;
  private final String data;

  /**
   * Creates a new RPC.
   *
   * @param method The method for the desired command.
   * @param path The path for the command resource.
   * @param data The raw data associated with the command.
   */
  public CrossDomainRpc(String method, String path, String data) {
    this.method = checkNotNull(method);
    this.path = checkNotNull(path);
    this.data = checkNotNull(data);
  }

  public String getMethod() {
    return method;
  }

  public String getPath() {
    return path;
  }

  public String getData() {
    return data;
  }

  public Reader getDataReader() {
    return new BufferedReader(new StringReader(data));
  }
}
