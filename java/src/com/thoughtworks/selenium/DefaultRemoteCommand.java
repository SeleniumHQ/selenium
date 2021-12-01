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

import org.openqa.selenium.net.Urls;

import java.util.Arrays;

/**
 * The default implementation of the RemoteCommand interface
 *
 * @see com.thoughtworks.selenium.RemoteCommand
 * @author Paul Hammant
 * @version $Revision$
 */
public class DefaultRemoteCommand implements RemoteCommand {
  // as we have beginning and ending pipes, we will have 1 more entry than we need
  private static final int NUMARGSINCLUDINGBOUNDARIES = 4;
  private static final int FIRSTINDEX = 1;
  private static final int SECONDINDEX = 2;
  private static final int THIRDINDEX = 3;
  private final String command;
  private final String[] args;


  public DefaultRemoteCommand(String command, String[] args) {
    this.command = command;
    this.args = Arrays.copyOf(args, args.length);
    if ("selectWindow".equals(command) && this.args[0] == null) {
      // hackylicious I know, but what a dorky interface! Users naturally give us too much credit,
      // and submit a null argument
      // instead of a string "null". Our code elsewhere assumes that all arguments are non-null, so
      // I fix this up here in order to avoid trouble later:
      this.args[0] = "null";
    }
  }

  @Override
  public String getCommandURLString() {
    StringBuffer sb = new StringBuffer("cmd=");
    sb.append(Urls.urlEncode(command));
    if (args == null) return sb.toString();
    for (int i = 0; i < args.length; i++) {
      sb.append('&');
      sb.append(Integer.toString(i + 1));
      sb.append('=');
      sb.append(Urls.urlEncode(args[i]));
    }
    return sb.toString();
  }

  @Override
  public String toString() {
    return getCommandURLString();
  }

  /** Factory method to create a RemoteCommand from a wiki-style input string
   * @param inputLine wiki-style input string
   * @return RemoteCommand
   */
  public static RemoteCommand parse(String inputLine) {
    if (null == inputLine) throw new NullPointerException("inputLine can't be null");
    String[] values = inputLine.split("\\|");
    if (values.length != NUMARGSINCLUDINGBOUNDARIES) {
      throw new IllegalStateException("Cannot parse invalid line: " + inputLine + values.length);
    }
    return new DefaultRemoteCommand(values[FIRSTINDEX], new String[] {values[SECONDINDEX],
        values[THIRDINDEX]});
  }

}
