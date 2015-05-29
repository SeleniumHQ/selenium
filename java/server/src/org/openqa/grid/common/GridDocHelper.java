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

package org.openqa.grid.common;

import org.openqa.selenium.server.cli.RemoteControlLauncher;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;


public class GridDocHelper {
  private static Properties hubProperties = load(
    "org/openqa/grid/common/defaults/HubParameters.properties");
  private static Properties nodeProperties = load(
    "org/openqa/grid/common/defaults/NodeParameters.properties");

  public static void printHubHelp(String msg) {
    printHubHelp(msg, true);
  }

  public static void printHubHelp(String msg, boolean error) {
    printHelpInConsole(msg, "hub", hubProperties, error);
    RemoteControlLauncher.printWrappedLine(
      "",
      "This synopsis lists options available in hub role only. To get help on the command line options available for other roles run the server with -help option and the corresponding -role option value.");
  }

  public static void printNodeHelp(String msg) {
    printNodeHelp(msg, true);
  }

  public static void printNodeHelp(String msg, boolean error) {
    printHelpInConsole(msg, "node", nodeProperties, error);
    RemoteControlLauncher.printWrappedLine(
      "",
      "This synopsis lists options available in node role only. To get help on the command line options available for other roles run the server with -help option and the corresponding -role option value.");
  }

  private static String getParam(Properties properties, String param) {
    if (param == null) {
      return "";
    }
    String s = (String) properties.get(param);
    if (s == null) {
      return "No help specified for " + param;
    } else {
      return s;
    }
  }

  public static String getHubParam(String param) {
    return getParam(hubProperties, param);
  }

  public static String getNodeParam(String param) {
    return getParam(nodeProperties, param);
  }

  private static void printHelpInConsole(String msg, String role, Properties properties, boolean error) {
    String indent = "  ";
    String indent2x = indent + indent;
    if (msg != null) {
      if (error) {
        System.out.println("Error building the config :" + msg);
      } else {
        System.out.println(msg);
      }
    }

    System.out.println("Usage: java -jar selenium-server.jar -role " + role + " [options]\n");
    for (Object key : properties.keySet()) {
      System.out.println(indent + "-" + key + ":");
      RemoteControlLauncher.printWrappedLine(System.out, indent2x, getParam(properties, key.toString()), true);
      System.out.println("");
    }
  }

  private static Properties load(String resource) {
    InputStream in = Thread.currentThread().getContextClassLoader().getResourceAsStream(resource);
    Properties p = new Properties();
    if (in != null) {
      try {
        p.load(in);
        return p;
      } catch (IOException e) {
        throw new RuntimeException(resource + " cannot be loaded.");
      }
    } else {
      throw new RuntimeException(resource + " cannot be loaded.");
    }
  }
}
