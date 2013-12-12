/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

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

package org.openqa.grid.internal.utils;

import java.lang.System;

import org.openqa.grid.internal.utils.configuration.GridConfiguration;
import org.openqa.selenium.server.cli.RemoteControlLauncher;


public class GridDocHelper {
  private static GridConfiguration gridConfiguration = new GridConfiguration();

  public static void printHelp(String msg) {
    printHelpInConsole(msg, true);
  }

  public static void printHelp(String msg, boolean error) {
    printHelpInConsole(msg, error);
  }


  public static String getGridParam(String param) {
    if (param == null) {
      return "";
    } else {
      return getGridConfiguration().getDescriptionForParam(param);
    }
  }


  private static void printHelpInConsole(String msg, boolean error) {
    String indent = "  ";
    String indent2x = indent + indent;
    if (msg != null) {
      if (error) {
        System.out.println("Error building the config :" + msg);
      } else {
        System.out.println(msg);
      }
    }

    System.out.println("Usage :");
    for (Object key : getGridConfiguration().keySet()) {
      System.out.println(indent + "-" + key + ":\t");
      RemoteControlLauncher.printWrappedLine(System.out, indent2x, getGridParam(key.toString()), true);
      System.out.println("");
    }
  }

  protected static GridConfiguration getGridConfiguration(){
    return gridConfiguration;
  }

}
