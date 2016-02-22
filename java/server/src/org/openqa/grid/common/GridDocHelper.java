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

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonIOException;
import com.google.gson.JsonParser;

import org.openqa.grid.shared.CliUtils;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class GridDocHelper {
  private static List<Option> hubOptions = load(
    "org/openqa/grid/common/defaults/HubOptions.json");
  private static List<Option> nodeOptions = load(
    "org/openqa/grid/common/defaults/NodeOptions.json");

  public static void printHubHelp(String msg) {
    printHubHelp(msg, true);
  }

  public static void printHubHelp(String msg, boolean error) {
    printHelpInConsole(msg, "hub", hubOptions, error);
    CliUtils.printWrappedLine(
      "",
      "This synopsis lists options available in hub role only. To get help on the command line options available for other roles run the server with -help name and the corresponding -role name value.");
  }

  public static void printNodeHelp(String msg) {
    printNodeHelp(msg, true);
  }

  public static void printNodeHelp(String msg, boolean error) {
    printHelpInConsole(msg, "node", nodeOptions, error);
    CliUtils.printWrappedLine(
      "",
      "This synopsis lists options available in node role only. To get help on the command line options available for other roles run the server with -help name and the corresponding -role name value.");
  }

  private static Map<String, String> hubOptionsMap;

  public static String getHubParam(String param) {
    if (hubOptionsMap == null) {
      hubOptionsMap = new HashMap<>();
      for (Option option : hubOptions) {
        hubOptionsMap.put(option.name, option.description);
      }
    }
    if (hubOptionsMap.containsKey(param)) {
      return hubOptionsMap.get(param);
    } else {
      return "No help specified for " + param;
    }
  }

  private static void printHelpInConsole(String msg, String role, List<Option> options, boolean error) {
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
    for (Option option : options) {
      System.out.println(indent + "-" + option.name + ":");
      CliUtils.printWrappedLine(System.out, indent2x, option.description, true);
      System.out.println("");
    }
  }

  private static List<Option> load(String resource) {
    InputStream in = Thread.currentThread().getContextClassLoader().getResourceAsStream(resource);
    List<Option> result = new ArrayList<>();
    try {
      JsonElement json = new JsonParser().parse(new InputStreamReader(in));
      for (JsonElement element : json.getAsJsonArray()) {
        JsonArray arr = element.getAsJsonArray();
        result.add(new Option(arr.get(0).getAsString(), arr.get(1).getAsString()));
      }

    } catch (JsonIOException e) {
      throw new RuntimeException(resource + " cannot be loaded.");
    }
    return result;
  }

  private static class Option {
    private final String name;
    private final String description;

    public Option(String option, String description) {
      this.name = option;
      this.description = description;
    }
  }
}
